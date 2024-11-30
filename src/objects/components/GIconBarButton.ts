import { COLOR } from "../../colors";
import { GInputMode } from "../../GInputMode";
import { GBaseScene } from "../../scenes/GBaseScene";

export class GIconBarButton extends Phaser.GameObjects.Image {
    private text: Phaser.GameObjects.Text;
    private hotkeyBg: Phaser.GameObjects.Image;
    private hotkeyText: Phaser.GameObjects.Text;
    private clickFunction: Function;
    private onTexture: string;
    private offTexture: string;
    private hotkey: string|undefined;
    private enabled: boolean = true;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        offTexture: string,
        onTexture: string,
        buttonText: string,
        hotkey: string|undefined,
        clickFunction: Function
    ) {
        super(scene, x, y, offTexture);
        this.setOrigin(0, 0);
        this.offTexture = offTexture;
        this.onTexture = onTexture;
        this.hotkey = hotkey;
        this.clickFunction = clickFunction;

        // Add button to the scene
        scene.add.existing(this);

        // Add text under the button
        this.text = scene.add.text(x + this.width / 2, y + this.height, buttonText, {
            fontSize: '14px',
            color: '#545454',
            fontFamily: 'dyonisius'
        });
        this.text.setOrigin(.5, 0); // Center the text

        // Add hotkey indicator
        if (this.hotkey) {
            this.hotkeyBg = scene.add.image(x, y + 2, 'blank_key').setOrigin(0, 0);
            this.hotkeyText = scene.add.text(this.hotkeyBg.x + this.hotkeyBg.width / 2, this.hotkeyBg.y + this.hotkeyBg.height / 2, this.hotkey.toUpperCase(), {
                fontSize: '14px',
                color: COLOR.GREY_1.str(),
                fontFamily: 'oxygen'
            });
            this.hotkeyText.setOrigin(.5, .5); // Center the text
        }

        // Enable input for this button
        this.setInteractive();

        // Mouse event listeners
        this.on('pointerover', this.onHover, this);
        this.on('pointermove', this.onHover, this);
        this.on('pointerout', this.onOut, this);
        this.on('pointerdown', this.onClick, this);

        this.alpha = .5;
    }

    public setEnabled(enabled: boolean) {
        this.enabled = enabled;
        if (this.enabled) {
            this.setInteractive();
        } else {
            this.disableInteractive();
        }
        this.showHotkey(enabled);
    }

    public isEnabled(): boolean {
        return this.enabled;
    }

    public getHotkey(): string|undefined {
        return this.hotkey;
    }

    // public pressHotkey() {
    //     if (this.enabled && this.isMouseAllowed()) {
    //         this.onHover();
    //         (this.scene as GBaseScene).getSound().playSound('icon_click');
    //         this.clickFunction();
    //         this.scene.time.delayedCall(100, () => {
    //             this.onOut();
    //             this.clickFunction();
    //         });
    //     }
    // }

    public showHotkey(show: boolean) {
        if (this.hotkeyBg && this.hotkeyText) {
            this.hotkeyBg.setVisible(show);
            this.hotkeyText.setVisible(show);
        }
    }

    private isMouseAllowed(): boolean {
        return ((this.scene as GBaseScene).getInputMode() as GInputMode).isEventAllowed('MOUSE_UI_BUTTON');
    }

    // Called when mouse hovers over the button
    public onHover() {
        if (this.enabled && this.isMouseAllowed()) {
            this.setTexture(this.onTexture);
            this.text.setStyle({ color: '#ffffff' });
            this.alpha = 1;
            this.showHotkey(false);
        }
    }

    // Called when mouse moves away from the button
    public onOut() {
        if (this.enabled && this.isMouseAllowed()) {
            this.setTexture(this.offTexture);
            this.text.setStyle({ color: '#545454' });
            this.alpha = .5;
            this.showHotkey(true);
        }
    }

    // Called when the button is clicked
    public onClick() {
        if (this.enabled && this.isMouseAllowed()) {
            this.clickFunction();
        }
    }
}