import { GInputMode } from "../../GInputMode";
import { GBaseScene } from "../../scenes/GBaseScene";

export class GIconBarButton extends Phaser.GameObjects.Image {
    private text: Phaser.GameObjects.Text;
    private clickFunction: Function;
    private onTexture: string;
    private offTexture: string;
    private enabled: boolean = true;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        offTexture: string,
        onTexture: string,
        buttonText: string,
        clickFunction: Function
    ) {
        super(scene, x, y, offTexture);
        this.setOrigin(0, 0);
        this.offTexture = offTexture;
        this.onTexture = onTexture;
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
        this.disableInteractive();
    }

    public isEnabled(): boolean {
        this.setInteractive();
        return this.enabled;
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
        }
    }

    // Called when mouse moves away from the button
    public onOut() {
        if (this.enabled && this.isMouseAllowed()) {
            this.setTexture(this.offTexture);
            this.text.setStyle({ color: '#545454' });
            this.alpha = .5;
        }
    }

    // Called when the button is clicked
    public onClick() {
        if (this.enabled && this.isMouseAllowed()) {
            (this.scene as GBaseScene).getSound().playSound('icon_click');
            this.clickFunction();
        }
    }
}