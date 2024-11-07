import { GInputMode } from '../GInputMode';
import { GSoundManager } from '../GSoundManager';
import { GBaseGameMode } from '../game_modes/GBaseGameMode';

export abstract class GBaseScene extends Phaser.Scene {

    private name: string;
    private containingMode: GBaseGameMode;
    private soundManager: GSoundManager;
    private fadeOverlay: Phaser.GameObjects.Rectangle;

    constructor(key: string) {
        super({
            key: key,
            active: false
        });
        this.name = key;

        // Create a sound manager for this Scene:
        this.soundManager = new GSoundManager(this);
    }

    public getName(): string {
        return this.name;
    }

    public setContainingMode(mode: GBaseGameMode) {
        this.containingMode = mode;
    }

    public getContainingMode(): GBaseGameMode {
        return this.containingMode;
    }

    public setInputMode(inputMode: GInputMode|null) {
        this.containingMode.setInputMode(inputMode);
    }

    public getInputMode(): GInputMode|null {
        return this.containingMode.getInputMode();
    }

    public revertInputMode() {
        this.containingMode.revertInputMode();
    }

    public getSound(): GSoundManager {
        return this.soundManager;
    }

    private createFadeOverlay(color?: number) {
        if (this.fadeOverlay !== undefined) {
            this.destroyFadeOverlay();
        }
        this.fadeOverlay = this.add.rectangle(
            0,
            0,
            this.scale.width,
            this.scale.height,
            color ?? 0x000000
        );
        this.fadeOverlay.setOrigin(0, 0);
        this.fadeOverlay.setDepth(10000);
        this.fadeOverlay.setData('permanent', true);
    }

    protected destroyFadeOverlay() {
        this.fadeOverlay?.destroy();
    }

    public getFadeOverlay(): Phaser.GameObjects.Rectangle {
        return this.fadeOverlay;
    }

    public fadeIn(overTime: number, color?: number, preLoad?: Function, onComplete?: Function) {
        this.createFadeOverlay(color);
        this.fadeOverlay.setAlpha(1);
        this.fadeOverlay.setVisible(true);

        preLoad?.call(this);

        this.tweens.add({
            targets: this.fadeOverlay,
            alpha: 0,
            duration: overTime,
            ease: 'Linear',
            onComplete: () => {
                onComplete?.call(this);
            }
        });
    }

    public fadeOut(overTime: number, color?: number, onComplete?: Function) {
        this.createFadeOverlay(color);
        this.fadeOverlay.setAlpha(0);
        this.fadeOverlay.setVisible(true);
        this.tweens.add({
            targets: this.fadeOverlay,
            alpha: 1,
            duration: overTime,
            ease: 'Linear',
            onComplete: () => {
                onComplete?.call(this);
            }
        });
    }

    // The default deactivation for custom scenes should be to stop them.
    // Certain scenes, like those in AdventureMode, may elect to sleep or pause instead.
    public deactivate() {
        this.scene.stop();
    }
}