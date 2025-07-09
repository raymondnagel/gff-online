import { COLOR } from "../../colors";
import { GColor } from "../../types";
import { GMenuTextOption } from "./GMenuTextOption";

const CHECKBOX_GAP: number = 4;
const CHECKBOX_STROKE_WIDTH: number = 2;

type CheckFunction = (labelText: string, checkState: boolean) => void;

export class GMenuCheckOption extends GMenuTextOption {

    protected checkColor: GColor = COLOR.RED;
    private checkboxSize: number;
    private checkBox: Phaser.GameObjects.Rectangle;
    private checkState: boolean = false;
    private checkFunction: CheckFunction|null = null;

    constructor(scene: Phaser.Scene, x: number, y: number, text: string, boxColor: GColor, descriptionText: string, style: Phaser.Types.GameObjects.Text.TextStyle) {
        super(scene, x, y, text, descriptionText, style);
        this.checkboxSize = this.height;
        this.setPosition(x + this.checkboxSize + CHECKBOX_GAP, y);
        this.setOrigin(0, 0);

        this.checkBox = scene.add.rectangle(
            x, y, this.checkboxSize, this.checkboxSize
        ).setOrigin(0, 0).setStrokeStyle(CHECKBOX_STROKE_WIDTH, boxColor.num());
        this.checkBox.setInteractive();
        this.checkBox.on('pointerover', this.onHover, this);
        this.checkBox.on('pointermove', this.onHover, this);
        this.checkBox.on('pointerout', this.onOut, this);
        this.checkBox.on('pointerdown', this.onClick, this);
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

    public setCheckFunction(checkFunction: CheckFunction): void {
        this.checkFunction = checkFunction;
    }

    public setCheckColor(checkColor: GColor) {
        this.checkColor = checkColor;
    }

    // Set keyboard focus
    public setFocus() {
        super.setFocus();
        this.checkBox.setStrokeStyle(CHECKBOX_STROKE_WIDTH, this.highlightColor.num());
    }

    // Remove keyboard focus
    public removeFocus() {
        super.removeFocus();
        this.checkBox.setStrokeStyle(CHECKBOX_STROKE_WIDTH, this.defaultColor.num());
    }

    public onClick(playSound: boolean = true) {
        super.onClick(playSound);
        this.setCheckState(!this.checkState);
        if (this.checkFunction) {
            this.checkFunction(this.text, this.checkState);
        }
    }

}