import { GBaseScene } from "../../scenes/GBaseScene";
import { GPoint } from "../../types";
import { GTextEntryControl } from "./GTextEntryControl";

const MAX_CHARS: number = 3;

export class GNumberEntry extends GTextEntryControl {

    private boxImage: Phaser.GameObjects.Image;
    private numberText: Phaser.GameObjects.Text;
    private caretImage: Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);

        this.boxImage = scene.add.image(0, 0, 'number_entry').setOrigin(.5, .5);
        this.add(this.boxImage);
        this.numberText = scene.add.text(0, 0, '', {
            color: '#000000',
            fontFamily: 'gemerald',
            fontSize: '28px',
        }).setOrigin(.5, .5).setLetterSpacing(2);
        this.add(this.numberText);

        const caretPos: GPoint = this.numberText.getRightCenter();
        this.caretImage = scene.add.image(caretPos.x, caretPos.y, 'number_entry_caret').setOrigin(0, .5);
        this.add(this.caretImage);
    }

    public addChar(char: string) {
        if (this.numberText.text.length < MAX_CHARS) {
            (this.scene as GBaseScene).getSound().playSound('type_key');
            this.numberText.text += char;
            this.updateCaret();
        }
    }

    public deleteLastChar() {
        if (this.numberText.text.length > 0) {
            (this.scene as GBaseScene).getSound().playSound('delete_char');
            this.numberText.text = this.numberText.text.substring(0, this.numberText.text.length - 1);
            this.updateCaret();
        }
    }

    private updateCaret() {
        const caretPos: GPoint = this.numberText.getRightCenter();
        this.caretImage.setPosition(caretPos.x, caretPos.y);
    }

    public isEnteredTextValid(): boolean {
        const int: number = parseInt(this.numberText.text);
        return !isNaN(int) && int >= 1;
    }

    public getEnteredText(): string {
        return this.numberText.text;
    }

    public setEnteredText(text: string) {
        this.numberText.text = text;
        this.updateCaret();
    }
}