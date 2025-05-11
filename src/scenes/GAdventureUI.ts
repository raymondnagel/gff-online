import 'phaser';
import { GUIScene } from './GUIScene';
import { GAdventureContent } from './GAdventureContent';
import { GFF } from '../main';
import { GPoint2D } from '../types';
import { RANDOM } from '../random';
import { DEPTH } from '../depths';

const MOUSE_INACTIVE_INTERVAL: number = 2000;

export class GAdventureUI extends GUIScene {

    private nametagKey: Phaser.Input.Keyboard.Key;
    private lastActivityTime: number;

    constructor() {
        super("AdventureUI");
        GFF.AdventureUI = this;
        this.setContainingMode(GFF.ADVENTURE_MODE);
    }

    public preload(): void {
    }

    public create(): void {
        super.create();
        this.createUIBar();
        this.setMouseInactiveTimer();

        // this.createTileGuidelines();
        // this.initDesignMode();
    }

    public sendPotentialHotkey(keyEvent: KeyboardEvent) {
        // AdventureUI must handle popup hotkeys as well as UI bar hotkeys;
        // if a popup is active, it should be prioritized:
        if (GFF.AdventureContent.isPopupActive()) {
            GFF.AdventureContent.getPopup()?.sendKey(keyEvent.key);
        } else {
            super.sendPotentialHotkey(keyEvent);
        }
    }

    private setMouseInactiveTimer() {
        this.lastActivityTime = this.time.now;

        // Detect mouse movement or clicks
        this.input.on('pointermove', this.resetActivityTimer, this);
        this.input.on('pointerdown', this.resetActivityTimer, this);

        // Start checking for inactivity
        this.time.addEvent({
            delay: 100, // Check every 100ms
            callback: this.checkForInactivity,
            callbackScope: this,
            loop: true
        });
    }

    private resetActivityTimer(): void {
        this.lastActivityTime = this.time.now;

        // Make the cursor visible when activity is detected
        GFF.setMouseVisible(true);
    }

    private checkForInactivity(): void {
        const currentTime = this.time.now;

        if (currentTime - this.lastActivityTime > MOUSE_INACTIVE_INTERVAL) {
            // Mouse hasn't moved for awhile:
            GFF.setMouseVisible(false);
            this.uiButtons.forEach(b => {
                b.onOut();
            });
        }
    }

    public pauseAdventure() {
        GFF.AdventureContent.getSound().pauseMusic();
        GFF.AdventureContent.getSound().playSound('pause', 0.3);
        GFF.AdventureContent.scene.pause();
    }

    public unpauseAdventure() {
        GFF.AdventureContent.scene.resume();
        GFF.AdventureContent.getSound().unpauseMusic();
    }

    public transitionToBattle(encounterPoint: GPoint2D, bgImageKey: string) {

        this.getSound().playSound('encounter');

        const finalX: number = GFF.GAME_W / 2;
        const finalY: number = GFF.GAME_H / 2;

        // Create the background image
        GFF.BATTLE_MODE.setBgImage(bgImageKey);
        const bgImage: Phaser.GameObjects.Image = this.add.image(encounterPoint.x, encounterPoint.y, bgImageKey).setDepth(DEPTH.TRANSITION);

        // Start with a very small size
        bgImage.setScale(0);
        bgImage.setAlpha(0); // Start with no rotation

        // Create a tween to animate the background
        this.tweens.add({
            targets: bgImage,
            x: finalX,
            y: finalY,
            scaleX: 1,
            scaleY: 1,
            alpha: 1,
            duration: 700,
            onComplete: () => {
                GFF.BATTLE_MODE.switchTo(this.getContainingMode());
                bgImage.destroy();
            }
        });
    }

    public deactivate(): void {
        this.scene.sleep();
    }
}