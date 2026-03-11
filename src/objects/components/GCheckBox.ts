import { COLOR } from "../../colors";
import { GBaseScene } from "../../scenes/GBaseScene";
import { GColor } from "../../colors";

const BOX_GREY: number = COLOR.GREY_3.num();

const BOX_SIDE: number = 16;
const LABEL_GAP: number = 3;

export class GCheckBox extends Phaser.GameObjects.Container {

    private clickFunction: (labelText: string, checkState: boolean) => void;
    private clickSound: string = 'icon_click';
    private label: Phaser.GameObjects.Text;
    private box: Phaser.GameObjects.Rectangle;
    private checkState: boolean = false;
    private enabled: boolean = true;

    private defaultColor: GColor = COLOR.GREY_1;
    private hoverColor: GColor = COLOR.GREY_2;
    private disabledColor: GColor = COLOR.GREY_3;

    constructor(scene: Phaser.Scene, x: number, y: number, text: string, checkState: boolean, enabled: boolean, clickFunction: (labelText: string, checkState: boolean) => void) {
        super(scene, x, y);
        this.scene.add.existing(this);
        this.clickFunction = clickFunction;

        this.box = this.scene.add.rectangle(0, 0, BOX_SIDE, BOX_SIDE, BOX_GREY);
        this.box.setStrokeStyle(1, COLOR.GREY_2.num());
        this.box.setOrigin(0, 0);
        this.add(this.box);

        this.label = scene.add.text(BOX_SIDE + LABEL_GAP, 0, text, {
            fontFamily: 'dyonisius',
            fontSize: '18px'
        }).setOrigin(0, 0);
        this.add(this.label);

        // Initialize
        this.setCheckState(checkState);
        this.setEnabled(enabled);

        // Mouse event listeners
        this.box.on('pointerover', this.onHover, this);
        this.box.on('pointermove', this.onHover, this);
        this.box.on('pointerout', this.onOut, this);
        this.box.on('pointerdown', this.onClick, this);
        this.label.on('pointerover', this.onHover, this);
        this.label.on('pointermove', this.onHover, this);
        this.label.on('pointerout', this.onOut, this);
        this.label.on('pointerdown', this.onClick, this);

        this.width = this.box.width + LABEL_GAP + this.label.width;
        this.height = Math.max(this.box.height, this.label.height);
    }

    public getLabelText(): string {
        return this.label.text;
    }

    public setEnabled(enabled: boolean) {
        this.enabled = enabled;
        if (this.enabled) {
            this.box.setInteractive();
            this.label.setInteractive();
            this.label.setColor(this.defaultColor.str());
            this.box.strokeColor = this.defaultColor.num();
            this.alpha = 1.0;
        } else {
            this.box.disableInteractive();
            this.label.disableInteractive();
            this.label.setColor(this.disabledColor.str());
            this.box.strokeColor = this.disabledColor.num();
            this.alpha = .6;
        }
    }

    public setCheckState(checked: boolean) {
        this.checkState = checked;
        if (this.checkState) {
            this.box.fillColor = COLOR.RED.num();
        } else {
            this.box.fillColor = BOX_GREY;
        }
    }

    public isChecked(): boolean {
        return this.checkState;
    }

    public isEnabled(): boolean {
        return this.enabled;
    }

    public setCustomClickSound(clickSound: string) {
        this.clickSound = clickSound;
    }

    public setColorScheme(defaultColor: GColor = COLOR.GREY_1, hoverColor: GColor = COLOR.GREY_2, disabledColor: GColor = COLOR.GREY_3) {
        this.defaultColor = defaultColor;
        this.hoverColor = hoverColor;
        this.disabledColor = disabledColor;
        this.setEnabled(this.enabled); // Update colors based on current enabled state
    }

    // Called when mouse hovers over the button
    public onHover() {
        if (this.enabled) {
            this.label.setColor(this.hoverColor.str());
            this.box.strokeColor = this.hoverColor.num();
        }
    }

    // Called when mouse moves away from the button
    public onOut() {
        if (this.enabled) {
            this.label.setColor(this.defaultColor.str());
            this.box.strokeColor = this.defaultColor.num();
        }
    }

    // Called when the button is clicked
    public onClick(playSound: boolean = true) {
        if (this.enabled) {
            if (playSound) {
                (this.scene as GBaseScene).getSound().playSound(this.clickSound);
            }
            this.clickFunction(this.label.text, !this.checkState);
        }
    }

    public destroy(fromScene?: boolean): void {
        this.box.destroy();
        this.label.destroy();
        super.destroy();
    }
}