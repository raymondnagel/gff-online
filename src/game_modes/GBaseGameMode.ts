import { GInputMode } from "../GInputMode";
import { GFF } from "../main";
import { GBaseScene } from "../scenes/GBaseScene";

export abstract class GBaseGameMode {

    private modeName: string;

    private contentSceneKey: string|undefined;
    private uiSceneKey: string|undefined;

    private contentScene: GBaseScene|undefined;
    private uiScene: GBaseScene|undefined;

    private inputMode: GInputMode|null = null;
    private previousInputMode: GInputMode|null = null;

    constructor(
        modeName: string,
        contentSceneKey?: string,
        uiSceneKey?: string
    ) {
        this.modeName = modeName;

        this.contentSceneKey = contentSceneKey;
        this.uiSceneKey = uiSceneKey;
    }

    public getName(): string {
        return this.modeName;
    }

    public setInputMode(inputMode: GInputMode|null) {
        // Reset any keypress states for the modes involved:
        this.previousInputMode?.clearKeypressStates();
        this.inputMode?.clearKeypressStates();
        inputMode?.clearKeypressStates();

        // Make the current mode the previous one:
        this.previousInputMode = this.inputMode;

        // Make the new mode the current one:
        this.inputMode = inputMode;
        GFF.log(`Set to input mode: ${this.inputMode?.getName()}`);
    }

    public getInputMode(): GInputMode|null {
        return this.inputMode;
    }

    public revertInputMode() {
        this.inputMode = this.previousInputMode;
        GFF.log(`Revert to input mode: ${this.inputMode?.getName()}`);
    }

    public getContentScene(): GBaseScene|undefined {
        return this.contentScene;
    }

    public getUiScene(): GBaseScene|undefined {
        return this.uiScene;
    }

    private activateScene(sceneKey: string|undefined): GBaseScene|undefined {
        if (sceneKey !== undefined) {
            const scene: Phaser.Scene|null = GFF.GAME.scene.getScene(sceneKey);
            if (scene !== null) {
                if (scene.scene.isSleeping()) {
                    GFF.GAME.scene.wake(sceneKey);
                } else if (scene.scene.isPaused()) {
                    // If paused, we may not want to resume yet...
                    // Most scenes will stop when deactivated.
                    // AdventureContent will sleep when deactivated; if it is paused,
                    // gameplay may actually be paused, and we should wait for user to unpause.
                    // GFF.GAME.scene.resume(sceneKey);
                } else {
                    GFF.GAME.scene.start(sceneKey);
                }
            } else {
                GFF.GAME.scene.start(sceneKey);
            }
            return GFF.GAME.scene.getScene(sceneKey) as GBaseScene;
        } else {
            return undefined;
        }
    }

    private deactivateScene(sceneKey: string|undefined) {
        if (sceneKey !== undefined) {
            const scene: GBaseScene|null = GFF.GAME.scene.getScene(sceneKey) as GBaseScene;
            if (scene !== null) {
                scene.deactivate();
            }
        }
    }

    public switchTo(fromMode?: GBaseGameMode): void {
        fromMode?.switchFrom();
        this.contentScene = this.activateScene(this.contentSceneKey);
        this.uiScene = this.activateScene(this.uiSceneKey);
    }

    protected switchFrom(): void {
        this.inputMode?.clearKeypressStates();
        this.deactivateScene(this.contentSceneKey);
        this.deactivateScene(this.uiSceneKey);
    }
}