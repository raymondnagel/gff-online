import { COLOR } from "../../colors";
import { CONSOLE } from "../../console";
import { GFF } from "../../main";
import { GTextEntryControl } from "./GTextEntryControl";

const MARGIN: number = 4;
const CONSOLE_WIDTH: number = 400;
const ROW_HEIGHT: number = 14;
const FONT_SIZE: string = '12px';

export class GTestConsole extends GTextEntryControl {

    private lastCommandText: Phaser.GameObjects.Text;
    private lastOutputText: Phaser.GameObjects.Text;
    private newCommandText: Phaser.GameObjects.Text;
    private background: Phaser.GameObjects.Rectangle;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        this.scene.add.existing(this);

        // Create a background rectangle for the console
        this.background = scene.add.rectangle(0, 0, CONSOLE_WIDTH + (MARGIN * 2), ROW_HEIGHT * 3 + (MARGIN * 2));
        this.background.setStrokeStyle(1, COLOR.GREY_3.num());
        this.background.setFillStyle(COLOR.BLACK.num(), .6);
        this.background.setOrigin(0, 0);
        this.add(this.background);

        // First line usually contains the last command
        this.lastCommandText = scene.add.text(MARGIN, MARGIN, '', {
            color: '#ffffff',
            fontFamily: 'mono',
            fontSize: FONT_SIZE,
        }).setOrigin(0, 0);
        this.add(this.lastCommandText);

        // Second line usually contains the output of the last command
        this.lastOutputText = scene.add.text(MARGIN, ROW_HEIGHT + MARGIN, '', {
            color: '#ffffff',
            fontFamily: 'mono',
            fontSize: FONT_SIZE,
        }).setOrigin(0, 0);
        this.add(this.lastOutputText);

        // Third line is for entering a new command
        this.newCommandText = scene.add.text(MARGIN, ROW_HEIGHT * 2 + MARGIN, '>_', {
            color: '#ffffff',
            fontFamily: 'mono',
            fontSize: FONT_SIZE,
        }).setOrigin(0, 0);
        this.add(this.newCommandText);
    }

    private enterCommand(command: string) {
        const lines: string[] = CONSOLE.exec(command);
        this.setTexts(lines[0], lines[1], '');
    }

    private setCommandText(text: string) {
        this.newCommandText.text = `>${text}_`;
    }

    public setTexts(line1?: string, line2?: string, initCommand?: string) {
        this.lastCommandText.text = line1 || '';
        this.lastOutputText.text = line2 || '';
        if (initCommand !== undefined) {
            this.setCommandText(initCommand);
        }
    }

    public sendKeyPress(keyEvent: KeyboardEvent): void {
        switch(keyEvent.key) {
            case 'Enter':
                this.enterCommand(this.getEnteredText());
                break;
            case 'Escape':
                GFF.AdventureContent.hideTestConsole();
                break;
            case 'Backspace':
            case 'Delete':
                this.setCommandText(this.getEnteredText().slice(0, -1));
                break;
            default:
                if (keyEvent.key.length > 1) {
                    // Ignore non-character keys
                    return;
                }
                this.setCommandText(this.getEnteredText() + keyEvent.key);
                break;
        }
    }

    public getEnteredText(): string {
        // Remove the leading '>' and trailing '_'
        return this.newCommandText.text.substring(1, this.newCommandText.text.length - 1);
    }

    public destroy(fromScene?: boolean): void {
        this.lastCommandText.destroy();
        this.lastOutputText.destroy();
        this.newCommandText.destroy();
        this.background.destroy();
        super.destroy();
    }
}