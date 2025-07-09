import 'phaser';
import { GUIScene } from './GUIScene';
import { GFF } from '../main';
import { GPoint2D } from '../types';
import { DEPTH } from '../depths';
import { COLOR } from '../colors';
import { GTestConsole } from '../objects/components/GTestConsole';

const MOUSE_INACTIVE_INTERVAL: number = 2000;

export class GAdventureUI extends GUIScene {

    private promptBacker: Phaser.GameObjects.Image;
    private promptText: Phaser.GameObjects.Text;
    private testConsole: GTestConsole;
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
        this.createPrompt();
        this.createConsole();
        this.setMouseInactiveTimer();

        // this.createTileGuidelines();
        // this.initDesignMode();
    }

    private createPrompt() {
        this.promptBacker = this.add.image(GFF.ADV_UI_W, GFF.GAME_H - GFF.ADV_UI_H, 'prompt_backer').setOrigin(0, 0);
        const backerWidth: number = this.promptBacker.width;
        this.promptText = this.add.text(GFF.ADV_UI_W - (backerWidth / 2), GFF.GAME_H - (GFF.ADV_UI_H / 2), 'Choose selection ↑↓ and press Enter', {
            color: COLOR.WHITE.str(),
            fontFamily: 'dyonisius',
            fontSize: '24px'
        });
        this.promptText.setFixedSize(0, 24); // Setting this keeps the bottom of the arrows from being cut off
        this.promptText.setOrigin(.5, .5);
        this.promptBacker.setVisible(false);
        this.promptText.setVisible(false);
    }

    /**
     * Slide in the prompt backer from the right side of the screen,
     * covering up the UI bar icons, and providing a space for
     * the prompt text to be displayed.
     *
     * This should be called at the beginning of a conversation.
     */
    public showPromptBacker() {
        // Slide the prompt backer in from the right:
        this.promptBacker.setVisible(true);
        const finalX: number = GFF.ADV_UI_W - this.promptBacker.width;
        this.tweens.add({
            targets: this.promptBacker,
            x: finalX,
            duration: 300
        });
    }

    /**
     * Slide the prompt backer out to the right side of the screen,
     * hiding it from view.
     *
     * This should be called when a conversation ends.
     */
    public hidePromptBacker() {
        // Slide the prompt backer out to the right:
        this.tweens.add({
            targets: this.promptBacker,
            x: GFF.ADV_UI_W,
            duration: 300,
            onComplete: () => {
                this.promptBacker.setVisible(false);
            }
        });
    }

    /**
     * Show prompt text over the backer with a blinking effect.
     * The prompt indicates what action the player should take
     * to continue the conversation; for example:
     * - speech and thought bubbles, "Press Enter to continue"
     * - choice bubbles, "Choose selection ↑↓ and press Enter"
     */
    public showPrompt(text: string) {
        // If the prompt text is already visible, just update it:
        if (this.promptText.visible) {
            this.promptText.setText(text);
            return;
        }

        this.promptText.setText(text);
        this.promptText.setAlpha(0);
        this.promptText.setVisible(true);
        // Animate the text with a yo-yo blink:
        this.tweens.add({
            targets: this.promptText,
            alpha: { from: 0, to: 1 },
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }

    /**
     * Hide the prompt text when the required action has been taken.
     */
    public hidePrompt() {
        this.promptText.setVisible(false);
        this.tweens.killTweensOf(this.promptText); // Stop any ongoing animations
    }

    private createConsole() {
        this.testConsole = new GTestConsole(this, 0, 0);
        this.testConsole.setVisible(false);
    }

    public showConsole(line1?: string, line2?: string, initCommand?: string): void {
        this.testConsole.setVisible(true);
        this.testConsole.setTexts(line1, line2, initCommand);
    }

    public hideConsole(): void {
        this.testConsole.setVisible(false);
    }

    public sendKeypressToConsole(keyEvent: KeyboardEvent): void {
        this.testConsole.sendKeyPress(keyEvent);
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