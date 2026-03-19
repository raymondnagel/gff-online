import 'phaser';
import { GBaseScene } from './scenes/GBaseScene';
import { REGISTRY } from './registry';
import { RANDOM } from './random';

const BASE_SPEECH_RATE = 2.5;
const SPEECH_RATE_VARIANCE = 0.3;
const SYLLABLES = ['ba', 'be', 'bi', 'bo', 'bu'];

const PHONETIC_MAP: Array<[string, string]> = [
    ['ph', 'f'],
    ['oo', 'u'],
    ['qu', 'k'],
    ['qu', 'k'],
    ['ck', 'k'],
    ['x', 'ks'],
];

const FULL_SYLLABLES = [
  'ba',
  'be',
  'bi',
  'bo',
  'bu',
  'cha',
  'che',
  'chi',
  'cho',
  'chu',
  'da',
  'de',
  'di',
  'do',
  'du',
  'fa',
  'fe',
  'fi',
  'fo',
  'fu',
  'ga',
  'ge',
  'gi',
  'go',
  'gu',
  'ha',
  'he',
  'hi',
  'ho',
  'hu',
  'ja',
  'je',
  'ji',
  'jo',
  'ju',
  'ka',
  'ke',
  'ki',
  'ko',
  'ku',
  'la',
  'le',
  'li',
  'lo',
  'lu',
  'ma',
  'me',
  'mi',
  'mo',
  'mu',
  'pa',
  'pe',
  'pi',
  'po',
  'pu',
  'ra',
  're',
  'ri',
  'ro',
  'ru',
  'sa',
  'se',
  'si',
  'so',
  'su',
  'sha',
  'she',
  'shi',
  'sho',
  'shu',
  'ta',
  'te',
  'ti',
  'to',
  'tu',
  'tha',
  'the',
  'thi',
  'tho',
  'thu',
  'va',
  've',
  'vi',
  'vo',
  'vu',
  'wa',
  'we',
  'wi',
  'wo',
  'wu',
  'ya',
  'ye',
  'yi',
  'yo',
  'yu',
  'za',
  'ze',
  'zi',
  'zo',
  'zu',
];

export class GSoundManager {

    private scene: GBaseScene;
    private music: Phaser.Sound.BaseSound|null = null;
    private soundVolume: number = 1.0;
    private musicVolume: number = 1.0;
    private speechVolume: number = 1.0;

    constructor(scene: GBaseScene) {
        this.scene = scene;
    }

    public setSoundVolume(volume: number) {
        this.soundVolume = volume;
    }

    public getSoundVolume(): number {
        return this.soundVolume;
    }

    public setMusicVolume(volume: number) {
        this.musicVolume = volume;
        if (this.music !== null && 'volume' in this.music) {
            this.music.volume = this.getCalculatedMusicVolume();
        }
    }

    public getMusicVolume(): number {
        return this.musicVolume;
    }

    public setSpeechVolume(volume: number) {
        this.speechVolume = volume;
    }

    public getSpeechVolume(): number {
        return this.speechVolume;
    }

    public playSound(soundKey: string, volume?: number): Phaser.Sound.BaseSound {
        const sound: Phaser.Sound.BaseSound = this.scene.sound.add(
            soundKey,
            {
                loop: false,
                volume: this.getCalculatedSoundVolume(volume)
            }
        );
        sound.play();
        return sound;
    }

    /**
     * Simulate speech by interpreting a word as a syllable sound from the specified voice set.
     * Voices are played at a high rate, to make them sound squeaky and cute, but
     * with some variance to avoid sounding too robotic.
     */
    public playSpeech(voiceKey: string, word: string, volume?: number): void {
        const syllable = this.getSoundForToken(word);
        this.scene.sound.add(
            `${voiceKey}_${syllable}`,
            {
                loop: false,
                volume: this.getCalculatedSpeechVolume(volume)
            }
        ).play({ rate: RANDOM.randFloat(BASE_SPEECH_RATE - SPEECH_RATE_VARIANCE, BASE_SPEECH_RATE + SPEECH_RATE_VARIANCE) });
    }

    public isMusicPlaying() {
        return this.music !== null && this.music.isPlaying;
    }

    public getMusic(): Phaser.Sound.BaseSound|null {
        return this.music;
    }

    public playMusic(soundKey: string, volume?: number): Phaser.Sound.BaseSound {
        this.stopMusic();
        this.music = this.scene.sound.add(
            soundKey,
            {
                loop: true,
                volume: this.getCalculatedMusicVolume(volume)
            }
        );
        this.music.play();
        return this.music;
    }

    public pauseMusic() {
        this.music?.pause();
    }

    public unpauseMusic() {
        this.music?.resume();
    }

    public stopMusic() {
        this.music?.stop();
    }

    public fadeInMusic(overTime: number, soundKey?: string, onComplete?: Function) {
        if (soundKey === undefined) {
            if (this.music === null) {
                return;
            }
            soundKey = this.music.key;
        }
        this.stopMusic();
        this.playMusic(soundKey);
        this.scene.tweens.add({
            targets: this.music,
            volume: this.getCalculatedMusicVolume(),
            duration: overTime,
            onComplete: () => {
                onComplete?.call(this);
            }
        });
    }

    public fadeOutMusic(overTime: number, onComplete?: Function) {
        if (this.music === null) {
            return;
        }
        this.scene.tweens.add({
            targets: this.music,
            volume: 0,
            duration: overTime,
            onComplete: () => {
                this.music?.stop();
                onComplete?.call(this);
            }
        });
    }

    private getCalculatedMusicVolume(arbitraryVolume: number = this.musicVolume): number {
        return arbitraryVolume * REGISTRY.get('musicVolume') * REGISTRY.get('masterVolume');
    }

    private getCalculatedSoundVolume(arbitraryVolume: number = this.soundVolume): number {
        return arbitraryVolume * REGISTRY.get('sfxVolume') * REGISTRY.get('masterVolume');
    }

    private getCalculatedSpeechVolume(arbitraryVolume: number = this.speechVolume): number {
        return arbitraryVolume * REGISTRY.get('speechVolume') * REGISTRY.get('masterVolume');
    }

    /**
     * Get an array of sound keys that make up a single word.
     * The array contains one sound (for short words), or two sounds (for longer words).
     * (To avoid splitting long words, call getSoundForToken() instead.)
     */
    public getSoundsForWord(word: string): string[] {
        // First, split word in half if > 6 letters, to avoid very long words being reduced to a single syllable
        const tokens = word.length > 6 ? [word.slice(0, Math.ceil(word.length / 2)), word.slice(Math.ceil(word.length / 2))] : [word];
        // Get the sound for each token
        for (let i = 0; i < tokens.length; i++) {
            tokens[i] = this.getSoundForToken(tokens[i]);
        }
        return tokens;
    }

    public getSoundForToken(token: string): string {
        const phoneticToken = this.toPhonetic(token);

        // Pass 1: check for the first matching syllable
        let firstMatchIndex: number = -1;
        let firstMatchSyllable: string|null = null;
        for (const syllable of FULL_SYLLABLES) {
            const index = phoneticToken.indexOf(syllable);
            if (index !== -1 && (firstMatchIndex === -1 || index < firstMatchIndex)) {
                firstMatchIndex = index;
                firstMatchSyllable = syllable;
            }
        }
        if (firstMatchSyllable !== null) {
            return firstMatchSyllable;
        }

        // Pass 2: iterate through syllables and find one with a matching letter
        for (const syllable of FULL_SYLLABLES) {
            const randomLetter = phoneticToken[Math.floor(Math.random() * phoneticToken.length)];
            if (syllable.includes(randomLetter)) {
                return syllable;
            }
        }

        // Pass 3: fallback to a random syllable
        return FULL_SYLLABLES[Math.floor(Math.random() * FULL_SYLLABLES.length)];
    }

    public toPhonetic(input: string): string {
        let result = input.toLowerCase();

        for (const [from, to] of PHONETIC_MAP) {
            result = result.replaceAll(from, to);
        }

        return result;
    }
}