import { COLOR } from "../../colors";
import { GBaseScene } from "../../scenes/GBaseScene";
import { GColor } from "../../types";

export class GMenuTextOption extends Phaser.GameObjects.Text {

    protected defaultColor: GColor = COLOR.BLACK;
    protected highlightColor: GColor = COLOR.BLUE;
    protected clickFunction: Function|null = null;
    private clickSound: string|null = 'icon_click';
    private descriptionText: string;
    private descriptionHost: Phaser.GameObjects.Text|null = null;

    constructor(scene: Phaser.Scene, x: number, y: number, text: string, descriptionText: string, style: Phaser.Types.GameObjects.Text.TextStyle) {
        super(scene, x, y, text, style);
        this.scene.add.existing(this);
        this.descriptionText = descriptionText;

        // Enable input
        this.setInteractive();

        // Mouse event listeners
        this.on('pointerover', this.onHover, this);
        this.on('pointermove', this.onHover, this);
        this.on('pointerout', this.onOut, this);
        this.on('pointerdown', this.onClick, this);
    }

    public setColorScheme(defaultColor: GColor, highlightColor: GColor) {
        this.defaultColor = defaultColor;
        this.highlightColor = highlightColor;
    }

    public setDescriptionHost(host: Phaser.GameObjects.Text) {
        this.descriptionHost = host;
    }

    public setClickFunction(clickFunction: Function) {
        this.clickFunction = clickFunction;
    }

    public setCustomClickSound(clickSound: string|null) {
        this.clickSound = clickSound;
    }

    // Called when mouse hovers over the button
    public onHover() {
        this.setFocus();
    }

    // Called when mouse moves away from the button
    public onOut() {
        this.removeFocus();
    }

    // Set keyboard focus
    public setFocus() {
        this.setColor(this.highlightColor.str());
        if (this.descriptionHost) {
            this.descriptionHost.setText(this.descriptionText);
        }
    }

    // Remove keyboard focus
    public removeFocus() {
        this.setColor(this.defaultColor.str());
        if (this.descriptionHost) {
            this.descriptionHost.setText('');
        }
    }

    public onClick(playSound: boolean = true) {
        if (this.clickSound !== null && playSound) {
            (this.scene as GBaseScene).getSound().playSound(this.clickSound);
        }
        if (this.clickFunction) {
            this.clickFunction();
        }
    }
}