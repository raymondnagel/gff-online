import 'phaser';
import { GBaseScene } from './scenes/GBaseScene';
import { REGISTRY } from './registry';

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

    // Speech is treated as a separate category from sound effects, so that it can be adjusted independently.
    public playSpeech(soundKey: string, volume?: number): Phaser.Sound.BaseSound {
        const sound: Phaser.Sound.BaseSound = this.scene.sound.add(
            soundKey,
            {
                loop: false,
                volume: this.getCalculatedSpeechVolume(volume)
            }
        );
        sound.play();
        return sound;
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
}