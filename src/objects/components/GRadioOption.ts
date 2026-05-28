import { COLOR } from "../../colors";
import { GBaseScene } from "../../scenes/GBaseScene";
import { GColor } from "../../colors";
import { GRadioGroup } from "./GRadioGroup";

const BOX_GREY: number = COLOR.GREY_3.num();

const BOX_SIDE: number = 16;
const LABEL_GAP: number = 3;

type CheckFunction = (labelText: string) => void;

export class GRadioOption extends Phaser.GameObjects.Container {

    private checkFunction: CheckFunction;
    private clickSound: string = 'icon_click';
    private label: Phaser.GameObjects.Text;
    private checkColor: GColor = COLOR.RED;
    private checkboxSize: number;
    private checkBox: Phaser.GameObjects.Ellipse;
    private checkState: boolean = false;
    private enabled: boolean = true;
    private radioGroup: GRadioGroup|null = null;

    private defaultColor: GColor = COLOR.GREY_1;
    private hoverColor: GColor = COLOR.GREY_2;
    private disabledColor: GColor = COLOR.GREY_3;

    constructor(scene: Phaser.Scene, x: number, y: number, text: string, checkState: boolean, enabled: boolean, style: Phaser.Types.GameObjects.Text.TextStyle) {
        super(scene, x, y);
        this.scene.add.existing(this);

        this.checkBox = this.scene.add.ellipse(0, 0, BOX_SIDE, BOX_SIDE, BOX_GREY);
        this.checkBox.setStrokeStyle(1, COLOR.GREY_2.num());
        this.checkBox.setOrigin(0, 0);
        this.add(this.checkBox);

        this.label = scene.add.text(BOX_SIDE + LABEL_GAP, 0, text, style).setOrigin(0, 0);
        this.add(this.label);

        // Initialize
        this.setCheckState(checkState);
        this.setEnabled(enabled);

        // Mouse event listeners
        this.checkBox.on('pointerover', this.onHover, this);
        this.checkBox.on('pointermove', this.onHover, this);
        this.checkBox.on('pointerout', this.onOut, this);
        this.checkBox.on('pointerdown', this.onClick, this);
        this.label.on('pointerover', this.onHover, this);
        this.label.on('pointermove', this.onHover, this);
        this.label.on('pointerout', this.onOut, this);
        this.label.on('pointerdown', this.onClick, this);

        this.width = this.checkBox.width + LABEL_GAP + this.label.width;
        this.height = Math.max(this.checkBox.height, this.label.height);
    }

    public setCheckFunction(checkFunction: CheckFunction): void {
        this.checkFunction = checkFunction;
    }

    public setCheckColor(checkColor: GColor) {
        this.checkColor = checkColor;
    }

    public getLabelText(): string {
        return this.label.text;
    }

    public setEnabled(enabled: boolean) {
        this.enabled = enabled;
        if (this.enabled) {
            this.checkBox.setInteractive();
            this.label.setInteractive();
            this.label.setColor(this.defaultColor.str());
            this.checkBox.strokeColor = this.defaultColor.num();
            this.alpha = 1.0;
        } else {
            this.checkBox.disableInteractive();
            this.label.disableInteractive();
            this.label.setColor(this.disabledColor.str());
            this.checkBox.strokeColor = this.disabledColor.num();
            this.alpha = .6;
        }
    }

    public setRadioGroup(group: GRadioGroup) {
        this.radioGroup = group;
        group.addOption(this);
    }

    public setVisible(value: boolean): this {
        super.setVisible(value);
        this.checkBox.setVisible(value);
        return this;
    }

    public setCheckState(checked: boolean) {
        this.checkState = checked;
        if (this.checkState) {
            this.checkBox.setFillStyle(this.checkColor.num());
        } else {
            this.checkBox.setFillStyle();
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
            this.checkBox.strokeColor = this.hoverColor.num();
        }
    }

    // Called when mouse moves away from the button
    public onOut() {
        if (this.enabled) {
            this.label.setColor(this.defaultColor.str());
            this.checkBox.strokeColor = this.defaultColor.num();
        }
    }

    // Called when the button is clicked
    public onClick(playSound: boolean = true) {
        if (this.enabled) {
            if (playSound) {
                (this.scene as GBaseScene).getSound().playSound(this.clickSound);
            }
            this.setCheckState(true);
            this.radioGroup?.setSelection(this);
            this.checkFunction?.(this.label.text);
        }
    }

    public destroy(fromScene?: boolean): void {
        this.checkBox.destroy();
        this.label.destroy();
        super.destroy();
    }
}