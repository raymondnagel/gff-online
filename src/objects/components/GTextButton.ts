import { GBaseScene } from "../../scenes/GBaseScene";

const LIGHT_GREY: number = 0xaaaaaa;

export class GTextButton extends Phaser.GameObjects.Container {

    private clickFunction: Function;
    private clickSound: string|null = 'icon_click';
    private hotkey: string|undefined;
    private text: Phaser.GameObjects.Text;
    private border: Phaser.GameObjects.Rectangle;

    constructor(scene: Phaser.Scene, x: number, y: number, text: string, clickFunction: Function, hotkey?: string) {
        super(scene, x, y);
        this.scene.add.existing(this);
        this.clickFunction = clickFunction;
        this.hotkey = hotkey;
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

    public getHotkey(): string|undefined {
        return this.hotkey;
    }

    public setCustomClickSound(clickSound: string|null) {
        this.clickSound = clickSound;
    }

    // Called when mouse hovers over the button
    public onHover() {
        this.text.setBackgroundColor('#0023F5');
    }

    // Called when mouse moves away from the button
    public onOut() {
        this.text.setBackgroundColor('#555555');
    }

    // Called when the button is clicked
    public onClick() {
        if (this.clickSound !== null) {
            (this.scene as GBaseScene).getSound().playSound(this.clickSound);
        }
        this.clickFunction();
    }

    public destroy(fromScene?: boolean): void {
        this.text.destroy();
        this.border.destroy();
        super.destroy();
    }
}