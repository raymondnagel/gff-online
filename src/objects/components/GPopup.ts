import { GGlossary } from "../../GGlossary";
import { GFF } from "../../main";
import { GAdventureContent } from "../../scenes/GAdventureContent";
import { GActionableOption, GGlossaryEntry, GPoint } from "../../types";
import { GDistributionContainer } from "./GDistributionContainer";
import { GDynamicPositioner } from "./GDynamicPositioner";
import { GTextButton } from "./GTextButton";

const SHADOW_WIDTH: number = 4;
const MARGIN: number = 20;
const CONTENT_SPACER: number = MARGIN * 2;
const MAX_WIDTH = 512;
const MAX_HEIGHT = 300;

const LIGHT_GREY: number = 0xaaaaaa;

export class GPopup extends Phaser.GameObjects.Image {

    private components: Phaser.GameObjects.GameObject[] = [];
    private miniTitleText: Phaser.GameObjects.Text;
    private titleText: Phaser.GameObjects.Text;
    private bodyText: Phaser.GameObjects.Text;
    private itemImage: Phaser.GameObjects.Image;

    private buttons: GTextButton[] = [];
    private defaultButton: GTextButton|null = null;
    private buttonDistributor: GDistributionContainer;
    private positioner: GDynamicPositioner;
    private closeFunction: Function;

    // Add to these to grow the popup as more components are added:
    private minWidth: number = MARGIN;
    private minHeight: number = MARGIN;

    private constructor() {
        super(GFF.AdventureUI, 0, 0, 'greystone_bg');
        GFF.AdventureContent.setPopup(this);
        if (!GFF.AdventureContent.scene.isPaused()) {
            GFF.AdventureContent.scene.pause();
        }

        this.positioner = new GDynamicPositioner();
    }

    private sizeAndCenter(width: number, height: number) {
        this.setOrigin(0, 0);
        this.width = width;
        this.height = height;
        this.setCrop(0, 0, width, height);
        this.setPosition(
            GFF.ROOM_X + (GFF.ROOM_W / 2) - (this.width / 2),
            GFF.ROOM_Y + (GFF.ROOM_H / 2) - (this.height / 2)
        );
    }

    private createBorder() {
        // Create a graphics object to use for drawing the shapes:
        const gfx: Phaser.GameObjects.Graphics = this.scene.add.graphics();
        this.components.push(gfx);

        // Draw a thin, light-grey border:
        gfx.lineStyle(2, LIGHT_GREY, 1);
        gfx.strokeRect(this.x, this.y, this.width, this.height);

        // Draw a dark, wider dark-grey shadow:
        const bottomLeft: GPoint = {x: this.x, y: this.y + this.height};
        const topRight: GPoint = {x: this.x + this.width, y: this.y};
        gfx.fillStyle(0x000000, .5);
        gfx.fillRect(bottomLeft.x + SHADOW_WIDTH, bottomLeft.y, this.width, SHADOW_WIDTH);
        gfx.fillRect(topRight.x, topRight.y + SHADOW_WIDTH, SHADOW_WIDTH, this.height - SHADOW_WIDTH);
    }

    private createTitle(text: string) {
        this.titleText = this.scene.add.text(0, 0, text, {
            color: '#aaaaaa',
            fontFamily: 'dyonisius',
            fontSize: '32px'
        }).setOrigin(0, 0);
        this.components.push(this.titleText);
        this.positioner.addRule(this.titleText, 'top', this, 'top', MARGIN);
        this.positioner.addRule(this.titleText, 'ctrX', this, 'ctrX');

        // Increase minimum size:
        this.minWidth = Math.max(this.minWidth, this.titleText.width + (MARGIN * 2));
        this.minHeight += this.titleText.height + CONTENT_SPACER;
    }

    private createBody(text: string) {
        this.bodyText = this.scene.add.text(0, 0, text, {
            color: '#aaaaaa',
            fontFamily: 'dyonisius',
            fontSize: '18px',
            lineSpacing: 4
        }).setOrigin(0, 0);
        this.components.push(this.bodyText);
        this.positioner.addRule(this.bodyText, 'top', this.titleText, 'bottom', CONTENT_SPACER);
        this.positioner.addRule(this.bodyText, 'left', this, 'left', MARGIN);

        // Determine wordwrap/width:
        const needWordWrap: boolean = this.bodyText.width >= MAX_WIDTH - (MARGIN * 2);
        if (needWordWrap) {
            this.bodyText.setWordWrapWidth(MAX_WIDTH - (MARGIN * 2));
        }

        // Increase minimum size:
        this.minWidth = Math.max(this.minWidth, this.bodyText.width + (MARGIN * 2));
        this.minHeight += this.bodyText.height + CONTENT_SPACER;
    }

    private createAmenButton() {
        const amenButton: GTextButton = new GTextButton(this.scene, 0, 0, 'Amen!', () => {
            this.close();
        });
        amenButton.setCustomClickSound('amen');
        this.defaultButton = amenButton;
        this.buttons.push(amenButton);
        this.components.push(amenButton);
        this.positioner.addRule(amenButton, 'top', this.bodyText, 'bottom', CONTENT_SPACER);
        this.positioner.addRule(amenButton, 'ctrX', this, 'ctrX');

        // Increase minimum size:
        this.minWidth = Math.max(this.minWidth, amenButton.width + (MARGIN * 2));
        this.minHeight += amenButton.height + MARGIN;
    }

    private createOptionButtons(options: GActionableOption[]) {
        this.buttonDistributor = new GDistributionContainer(this.scene, 0, 0, 'horizontal');
        this.scene.add.existing(this.buttonDistributor);
        let totalButtonWidths: number = 0;
        options.forEach(o => {
            const button = new GTextButton(this.scene, 0, 0, o.option, () => {
                this.onClose(o.action);
                this.close();
            }, o.hotkey);
            this.buttons.push(button);
            this.buttonDistributor.add(button);
            totalButtonWidths += button.width;
        });
        this.components.push(this.buttonDistributor);

        this.positioner.addRule(this.buttonDistributor, 'top', this.bodyText, 'bottom', CONTENT_SPACER);
        this.positioner.addRule(this.buttonDistributor, 'left', this, 'left', MARGIN);

        // Increase minimum size:
        this.minWidth = Math.max(this.minWidth, totalButtonWidths + (MARGIN * 2));
        this.minHeight += this.buttons[0].height + MARGIN;
    }

    private createMiniTitle(text: string) {
        this.miniTitleText = this.scene.add.text(0, 0, text, {
            color: '#aaaaaa',
            fontFamily: 'dyonisius',
            fontSize: '18px'
        }).setOrigin(0, 0);
        this.components.push(this.miniTitleText);
        this.positioner.addRule(this.miniTitleText, 'top', this, 'top', MARGIN);
        this.positioner.addRule(this.miniTitleText, 'ctrX', this, 'ctrX');

        // Increase minimum size:
        this.minWidth = Math.max(this.minWidth, this.miniTitleText.width + (MARGIN * 2));
        this.minHeight += this.miniTitleText.height + CONTENT_SPACER;
    }

    private createItemImage(imageName: string) {
        this.itemImage = this.scene.add.image(0, 0, imageName).setOrigin(0, 0);
        this.components.push(this.itemImage);
        this.positioner.addRule(this.itemImage, 'ctrY', this, 'ctrY');
        this.positioner.addRule(this.itemImage, 'left', this, 'left', MARGIN);

        // Increase minimum size:
        this.minWidth = Math.max(this.minWidth, this.itemImage.width + (MARGIN * 2));
    }

    private createItemTitle(text: string) {
        this.titleText = this.scene.add.text(0, 0, text, {
            color: '#aaaaaa',
            fontFamily: 'dyonisius',
            fontSize: '32px'
        }).setOrigin(0, 0);
        this.components.push(this.titleText);
        this.positioner.addRule(this.titleText, 'top', this.miniTitleText, 'bottom', CONTENT_SPACER);
        this.positioner.addRule(this.titleText, 'left', this.itemImage, 'right', MARGIN);

        // Increase minimum size:
        this.minWidth = Math.max(this.minWidth, this.titleText.width + this.itemImage.width + (MARGIN * 3));
        this.minHeight += this.titleText.height + MARGIN;
    }

    private createItemBody(text: string) {
        this.bodyText = this.scene.add.text(0, 0, text, {
            color: '#aaaaaa',
            fontFamily: 'dyonisius',
            fontSize: '18px',
            lineSpacing: 4
        }).setOrigin(0, 0);
        this.components.push(this.bodyText);
        this.positioner.addRule(this.bodyText, 'top', this.titleText, 'bottom', MARGIN);
        this.positioner.addRule(this.bodyText, 'left', this.itemImage, 'right', MARGIN);

        // Determine wordwrap/width:
        const allowedSpace: number = MAX_WIDTH - this.itemImage.width - (MARGIN * 3);
        const needWordWrap: boolean = this.bodyText.width >= allowedSpace;
        if (needWordWrap) {
            this.bodyText.setWordWrapWidth(allowedSpace);
        }

        // Increase minimum size:
        this.minWidth = Math.max(this.minWidth, this.bodyText.width + this.itemImage.width + (MARGIN * 3));
        this.minHeight += this.bodyText.height + CONTENT_SPACER;
    }

    public sendKey(key: string) {
        switch(key) {
            case 'Enter':
                if (this.defaultButton !== null) {
                    this.defaultButton.onClick();
                }
                break;
            default:
                this.buttons.forEach(b => {
                    const hotkey: string|undefined = b.getHotkey();
                    if (hotkey !== undefined && hotkey === key) {
                        b.onClick();
                        return;
                    }
                });
        }
    }

    public onClose(closeFunction: Function) {
        this.closeFunction = closeFunction;
    }

    public close() {
        GFF.AdventureContent.clearPopup(this.closeFunction);
        this.components.forEach(c => {
            c.destroy();
        });
        this.destroy();
    }

    /**
     * A simple popup has a title, some body text, and an Amen! button to close it.
     * It is used for presenting basic information which the player should confirm.
     *
     * @param body Text of the body; can be multiline, and will be wrapped as needed
     * @param title Text of the title; should be kept short
     */
    public static createSimplePopup(body: string, title: string): GPopup {
        const popup: GPopup = new GPopup();
        GFF.AdventureUI.add.existing(popup);
        popup.createTitle(title);
        popup.createBody(body);
        popup.createAmenButton();
        popup.sizeAndCenter(popup.minWidth, popup.minHeight);
        popup.createBorder();
        popup.positioner.arrangeAll();
        return popup;
    }

    /**
     * A choice popup has a title, some body text, and multiple choice buttons.
     * It is used for letting the player make a decision outside of a conversation.
     *
     * @param body Text of the body; can be multiline, and will be wrapped as needed
     * @param title Text of the title; should be kept short
     * @param options Array of actionable options, for which buttons will be created
     */
    public static createChoicePopup(body: string, title: string, options: GActionableOption[]): GPopup {
        const popup: GPopup = new GPopup();
        GFF.AdventureUI.add.existing(popup);
        popup.createTitle(title);
        popup.createBody(body);
        popup.createOptionButtons(options);
        popup.sizeAndCenter(popup.minWidth, popup.minHeight);
        popup.createBorder();
        popup.positioner.arrangeAll();
        popup.buttonDistributor.arrange(popup.width - (MARGIN * 2));
        return popup;
    }

    /**
     * An item popup has a title, an item image, some side-body text, and an Amen! button.
     * It is used for announcing when the player obtains a new item, such as when opening
     * a treasure chest.
     *
     * @param itemName name of the item entry to be pulled from the glossary
     */
    public static createItemPopup(itemName: string): GPopup {
        const entry: GGlossaryEntry = GGlossary.lookupEntry(itemName) as GGlossaryEntry;
        const popup: GPopup = new GPopup();
        GFF.AdventureUI.add.existing(popup);
        popup.createMiniTitle('God hath been gracious unto thee, for thou hast obtained:');
        popup.createItemImage(entry.image);
        popup.createItemTitle(entry.title);
        popup.createItemBody(entry.text);
        popup.createAmenButton();
        popup.sizeAndCenter(popup.minWidth, popup.minHeight);
        popup.createBorder();
        popup.positioner.arrangeAll();

        // Play a fanfare when we get an item!
        GFF.AdventureUI.getSound().playSound('fanfare');
        return popup;
    }

}