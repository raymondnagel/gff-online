import 'phaser';
import { GBaseScene } from './scenes/GBaseScene';

export class GSoundManager {

    private scene: GBaseScene;
    private music: Phaser.Sound.BaseSound|null = null;
    private soundVolume: number = 0.5;
    private musicVolume: number = 0.5;

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
            this.music.volume = this.musicVolume;
        }
    }

    public getMusicVolume(): number {
        return this.musicVolume;
    }

    public playSound(soundKey: string, volume?: number): Phaser.Sound.BaseSound {
        const sound: Phaser.Sound.BaseSound = this.scene.sound.add(soundKey, { loop: false, volume: volume ?? this.soundVolume });
        sound.play();
        return sound;
    }

    public isMusicPlaying() {
        return this.music !== null && this.music.isPlaying;
    }

    public playMusic(soundKey: string, volume?: number): Phaser.Sound.BaseSound {
        this.stopMusic();
        this.music = this.scene.sound.add(soundKey, { loop: true, volume: volume ?? this.musicVolume });
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

    public fadeInMusic(soundKey: string, overTime: number, onComplete?: Function) {
        this.stopMusic();
        this.playMusic(soundKey);
        this.scene.tweens.add({
            targets: this.music,
            volume: this.musicVolume,
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
}