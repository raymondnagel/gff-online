import { COLOR } from "../../colors";
import { GBaseScene } from "../../scenes/GBaseScene";
import { GColor } from "../../types";
import { GOptionGroup } from "./GOptionGroup";

const LIGHT_GREY: number = 0xaaaaaa;

type ButtonState = {
    fontColor: GColor,
    backgroundColor: GColor,
    borderColor: GColor
};

const DEFAULT_STATE: ButtonState = {
    fontColor: COLOR.GREY_1,
    backgroundColor: COLOR.GREY_3,
    borderColor: COLOR.GREY_1
};
const HOVER_STATE: ButtonState = {
    fontColor: COLOR.GREY_4,
    backgroundColor: COLOR.GREY_3,
    borderColor: COLOR.GREY_4
};
const SELECTED_STATE: ButtonState = {
    fontColor: COLOR.WHITE,
    backgroundColor: COLOR.BLUE,
    borderColor: COLOR.WHITE
};

export class GTextOptionButton extends Phaser.GameObjects.Container {

    private selectFunction: Function;
    private clickSound: string = 'icon_click';
    private text: Phaser.GameObjects.Text;
    private border: Phaser.GameObjects.Rectangle;
    private selected: boolean = false;
    private optionGroup: GOptionGroup|undefined;

    constructor(scene: Phaser.Scene, x: number, y: number, text: string, selectFunction: Function) {
        super(scene, x, y);
        this.scene.add.existing(this);
        this.selectFunction = selectFunction;
        this.text = scene.add.text(0, 0, text, {
            color: '#ffffff',
            backgroundColor: '#555555',
            fontFamily: 'dyonisius',
            fontSize: '16px',
            padding: {
                top: 6,
                left: 6,
                right: 6,
                bottom: 6
            }
        }).setOrigin(0, 0);
        this.add(this.text);

        // Enable input
        this.text.setInteractive();

        // Mouse event listeners
        this.text.on('pointerover', this.onHover, this);
        this.text.on('pointermove', this.onHover, this);
        this.text.on('pointerout', this.onOut, this);
        this.text.on('pointerdown', this.onClick, this);

        // Draw a thin, light-grey border:
        this.border = this.scene.add.rectangle(this.text.x, this.text.y, this.text.width, this.text.height);
        this.border.setStrokeStyle(1, LIGHT_GREY);
        this.border.setOrigin(0, 0);
        this.add(this.border);

        this.width = this.text.width;
        this.height = this.text.height;
    }

    public setOptionGroup(group: GOptionGroup) {
        this.optionGroup = group;
        group.addOption(this);
    }

    public setSize(width: number, height: number): this {
        this.text.setSize(width, height);
        this.text.setFixedSize(width, height);
        this.border.setSize(width, height);
        this.width = width;
        this.height = height;
        return this;
    }

    public setText(text: string) {
        this.text.text = text;
        this.border.setSize(this.text.width, this.text.height);
    }

    public getText(): string {
        return this.text.text;
    }

    public setCustomClickSound(clickSound: string) {
        this.clickSound = clickSound;
    }

    public isSelected(): boolean {
        return this.selected;
    }

    public select() {
        if (this.optionGroup !== undefined) {
            this.optionGroup.setSelection(this);
        }
        this.selected = true;
        this.updateButtonVisuals(SELECTED_STATE);
        this.selectFunction();
    }

    public deselect() {
        this.selected = false;
        this.updateButtonVisuals(DEFAULT_STATE);
    }

    // Called when mouse hovers over the button
    public onHover() {
        if (!this.selected) {
            this.updateButtonVisuals(HOVER_STATE);
        }
    }

    // Called when mouse moves away from the button
    public onOut() {
        if (!this.selected) {
            this.updateButtonVisuals(DEFAULT_STATE);
        }
    }

    // Called when the button is clicked
    public onClick() {
        (this.scene as GBaseScene).getSound().playSound(this.clickSound);
        this.select();
    }

    private updateButtonVisuals(state: ButtonState) {
        this.text.setColor(state.fontColor.str());
        this.text.setBackgroundColor(state.backgroundColor.str());
        this.border.setStrokeStyle(1, state.borderColor.num());
    }

    public destroy(fromScene?: boolean): void {
        this.text.destroy();
        this.border.destroy();
        super.destroy();
    }
}