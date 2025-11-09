import { GStrongholdArea } from "../../areas/GStrongholdArea";
import { BIBLE } from "../../bible";
import { BOOKS } from "../../books";
import { GLOSSARY } from "../../glossary";
import { GRoom } from "../../GRoom";
import { GFF } from "../../main";
import { PLAYER } from "../../player";
import { GActionableOption, GBookEntry, GGlossaryEntry, GPoint2D } from "../../types";
import { GDistributionContainer } from "./GDistributionContainer";
import { GDynamicPositioner } from "./GDynamicPositioner";
import { GTextButton } from "./GTextButton";

const SHADOW_WIDTH: number = 4;
const MARGIN: number = 20;
const CONTENT_SPACER: number = MARGIN * 2;
const MAX_WIDTH = 512;
const MAX_HEIGHT = 300;

const LIGHT_GREY: number = 0xaaaaaa;

const PUNCTUATION = new Set([
  ',', '.', ':', ';', '-', '—', '?', '!', '"', "'", '(', ')', '[', ']'
]);

type TextLine = Phaser.GameObjects.Text[];

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

    private lockFgImage: Phaser.GameObjects.Image;
    private lockBgImage: Phaser.GameObjects.Image;
    private keyHandleImage: Phaser.GameObjects.Image;
    private keyShaftImage: Phaser.GameObjects.Image;
    private keyTeethImage: Phaser.GameObjects.Image;
    private unlockTextBox: Phaser.GameObjects.Rectangle;
    private unlockLines: TextLine[] = [];
    private unlockCharacters: Phaser.GameObjects.Text[] = [];
    private unlockCursor: Phaser.GameObjects.Image;
    private unlockCursorIndex: number = 0;
    private hasKey: boolean = false;

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
        const bottomLeft: GPoint2D = {x: this.x, y: this.y + this.height};
        const topRight: GPoint2D = {x: this.x + this.width, y: this.y};
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

    private createUnlockImages() {
        this.lockBgImage = this.scene.add.image(0, 0, 'lock_bg').setOrigin(0, 0);
        this.keyTeethImage = this.scene.add.image(0, 0, 'key_teeth').setOrigin(.5, .18).setVisible(this.hasKey);
        this.keyShaftImage = this.scene.add.image(0, 0, 'key_shaft').setOrigin(0, 0).setVisible(this.hasKey);
        this.lockFgImage = this.scene.add.image(0, 0, 'lock_fg').setOrigin(0, 0);
        this.keyHandleImage = this.scene.add.image(0, 0, 'key_handle').setOrigin(.5, .5).setVisible(this.hasKey);
        this.components.push(this.lockBgImage, this.keyTeethImage, this.keyShaftImage, this.lockFgImage, this.keyHandleImage);

        this.positioner.addRule(this.lockBgImage, 'left', this, 'left', MARGIN);
        this.positioner.addRule(this.lockBgImage, 'top', this.miniTitleText, 'bottom', CONTENT_SPACER);
        this.positioner.addRule(this.lockFgImage, 'left', this.lockBgImage, 'left');
        this.positioner.addRule(this.lockFgImage, 'top', this.lockBgImage, 'top');
        this.positioner.addRule(this.keyTeethImage, 'left', this.lockBgImage, 'left', 65);
        this.positioner.addRule(this.keyTeethImage, 'top', this.lockBgImage, 'top', 64);
        this.positioner.addRule(this.keyShaftImage, 'left', this.lockBgImage, 'left', 62);
        this.positioner.addRule(this.keyShaftImage, 'top', this.lockBgImage, 'top', 47);
        this.positioner.addRule(this.keyHandleImage, 'left', this.lockBgImage, 'left', 85);
        this.positioner.addRule(this.keyHandleImage, 'top', this.lockBgImage, 'top', 67);
    }

    private createUnlockTitle(text: string) {
        this.titleText = this.scene.add.text(0, 0, text, {
            color: '#aaaaaa',
            fontFamily: 'dyonisius',
            fontSize: '32px'
        }).setOrigin(0, 0);
        this.components.push(this.titleText);
        this.positioner.addRule(this.titleText, 'top', this.miniTitleText, 'bottom', CONTENT_SPACER);
        this.positioner.addRule(this.titleText, 'left', this.lockBgImage, 'right', MARGIN);
    }

    private createUnlockTextBox() {
        const textBoxHeight = this.lockBgImage.height - (MARGIN + this.titleText.height);
        this.unlockTextBox = this.scene.add.rectangle(0, 0, 400, textBoxHeight, 0x000000).setOrigin(0, 0).setVisible(false);
        this.components.push(this.unlockTextBox);
        this.positioner.addRule(this.unlockTextBox, 'top', this.titleText, 'bottom', MARGIN);
        this.positioner.addRule(this.unlockTextBox, 'left', this.lockBgImage, 'right', MARGIN);
    }

    private createUnlockCancelButton() {
        const cancelButton: GTextButton = new GTextButton(this.scene, 0, 0, 'Cancel', () => {
            this.close();
        });
        this.defaultButton = cancelButton;
        this.buttons.push(cancelButton);
        this.components.push(cancelButton);
        this.positioner.addRule(cancelButton, 'top', this.unlockTextBox, 'bottom', CONTENT_SPACER);
        this.positioner.addRule(cancelButton, 'ctrX', this, 'ctrX');
    }

    private createUnlockText(verseText: string) {
        const maxWidth: number = this.unlockTextBox.width;
        const lineSpacing: number = 18;
        const charSpacing: number = 1;

        const chars: string[] = verseText.split('');
        // Create a text object for each character:
        chars.forEach((char: string) => {
            const charText: Phaser.GameObjects.Text = this.scene.add.text(0, 0, char, {
                color: '#ffffff',
                fontFamily: 'averia_serif',
                fontSize: '16px'
            }).setOrigin(0, 0);
            this.unlockCharacters.push(charText);
            this.components.push(charText);
        });

        // Arrange the characters into lines
        let lineWidth: number = 0;
        let wordWidth: number = 0;
        let currentLine: TextLine = [];
        let currentWord: TextLine = [];
        for (const charText of this.unlockCharacters) {
            // Add character to current word
            currentWord.push(charText);
            wordWidth += (charText.width + charSpacing);
            console.log(`Word: "${currentWord.map(c => c.text).join('')}", wordWidth: ${wordWidth}`);

            // If we encounter a space, we finalize the current word
            if (charText.text === ' ') {
                console.log(`Line width: ${lineWidth} + word width: ${wordWidth} = ${lineWidth + wordWidth}`);
                if (lineWidth + wordWidth > maxWidth) {
                    // If adding the word exceeds max width, finalize the current line
                    this.unlockLines.push(currentLine);
                    lineWidth = 0;
                    currentLine = [];
                }

                // Add the current word to the line
                currentLine = currentLine.concat(currentWord);
                lineWidth += wordWidth;

                // Reset current word
                wordWidth = 0;
                currentWord = [];
            }
        }

        // Add any remaining word to the line
        if (currentWord.length > 0) {
            if (lineWidth + wordWidth > maxWidth) {
                this.unlockLines.push(currentLine);
                currentLine = currentWord;
            } else {
                currentLine = currentLine.concat(currentWord);
            }
        }
        if (currentLine.length > 0) {
            this.unlockLines.push(currentLine);
        }

        // Get total height of all lines for vertical centering
        const totalTextHeight: number = this.unlockLines.length * lineSpacing;
        console.log(`Total text height: ${totalTextHeight}`);
        const excessGap: number =  (this.unlockTextBox.height - totalTextHeight) / 2;
        console.log(`Excess gap: ${excessGap}, Margin: ${MARGIN}`);
        const offsetY: number = Math.max(MARGIN, excessGap);

        // Position the characters
        let cursorY: number = this.titleText.getBottomCenter().y + offsetY;
        this.unlockLines.forEach(line => {
            let cursorX: number = this.unlockTextBox.x;
            line.forEach(charText => {
                charText.setPosition(cursorX, cursorY);
                cursorX += charText.width + charSpacing;
            });
            cursorY += lineSpacing;
        });

        this.unlockCharacters.forEach(c => c.setAlpha(0));
    }

    public sendKey(key: string) {
        switch(key) {
            case 'Enter':
                if (this.defaultButton !== null) {
                    this.defaultButton.onClick();
                }
                break;
            default:
                // If there is a lock image and player has a key, keypresses will be used to enter the verse text.
                if (this.lockBgImage && this.unlockCursorIndex < this.unlockCharacters.length) {
                    if (this.hasKey && this.enterUnlockCharacter(key)) {
                        // Verse complete: use a key and close the popup
                        const room: GRoom = GFF.AdventureContent.getCurrentRoom() as GRoom;
                        const area: GStrongholdArea = room.getArea() as GStrongholdArea;
                        PLAYER.changeKeys(area.getStrongholdIndex(), -1);
                        // Close the popup after 1 second delay to let the player see the completed verse
                        this.scene.time.delayedCall(1000, () => {
                            this.close();
                        });
                    }
                } else {
                    // Otherwise, see if any button has this hotkey:
                    this.buttons.forEach(b => {
                        const hotkey: string|undefined = b.getHotkey();
                        if (hotkey !== undefined && hotkey === key) {
                            b.onClick();
                            return;
                        }
                    });
                }
        }
    }

    private positionUnlockCursor() {
        const charText: Phaser.GameObjects.Text = this.unlockCharacters[this.unlockCursorIndex];
        this.unlockCursor.setPosition(
            charText.x + (charText.width / 2),
            charText.y + charText.height + 2
        );
    }

    private rotateKey() {
        const startX: number = 320.5;
        const pct = this.unlockCursorIndex / this.unlockCharacters.length;
        const angle = pct * 90;
        this.keyHandleImage.setAngle(angle);
        this.keyTeethImage.setAngle(angle);

        this.keyHandleImage.setX(startX - (pct * 20));
    }

    private enterUnlockCharacter(char: string): boolean {
        let charText: Phaser.GameObjects.Text = this.unlockCharacters[this.unlockCursorIndex];
        do {
            // Determine if the character at the current cursor position matches the input character
            // Don't be case-sensitive
            if (charText.text.toUpperCase() !== char.toUpperCase()) {
                // Incorrect character; do nothing
                return false;
            }

            // Reveal the character at the current cursor position
            this.scene.tweens.add({
                targets: charText,
                alpha: 1,
                duration: 100
            });

            // Advance to next character position
            this.unlockCursorIndex++;
            if (this.unlockCursorIndex >= this.unlockCharacters.length) {
                // All characters have been entered - unlock complete!
                this.scene.sound.play('success');
                return true;
            }
            this.positionUnlockCursor();
            this.rotateKey();

            // Get the next character; if it's punctuation, fill it in automatically
            charText = this.unlockCharacters[this.unlockCursorIndex];
            char = charText.text;
        } while (PUNCTUATION.has(char));

        // Play sound effect
        this.scene.sound.play('type_key');
        return false;
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
        const wickedTreasure = itemName === 'wicked_treasure';
        const title: string = wickedTreasure
            ? 'The Lord reprove thee, for thou hast taken:'
            : 'God hath been gracious unto thee, for thou hast obtained:';
        const entry: GGlossaryEntry = GLOSSARY.lookupEntry(itemName) as GGlossaryEntry;
        const popup: GPopup = new GPopup();
        GFF.AdventureUI.add.existing(popup);
        popup.createMiniTitle(title);
        popup.createItemImage(entry.image);
        popup.createItemTitle(entry.title);

        if (itemName === 'travel_pass') {
            popup.createItemBody('An Unlimited Travel Pass from Spirit Travel! Simply present this pass to a travel agent, and you will be able to take any available flights. Where will the Spirit take you next?');
        } else {
            popup.createItemBody(entry.text);
        }
        popup.createAmenButton();
        popup.sizeAndCenter(popup.minWidth, popup.minHeight);
        popup.createBorder();
        popup.positioner.arrangeAll();

        // Play a fanfare when we get an item!
        if (wickedTreasure) {
            GFF.AdventureUI.getSound().playSound('bad_item');
        } else {
            GFF.AdventureUI.getSound().playSound('fanfare');
        }
        return popup;
    }

    /**
     * A book popup is identical to an item popup, but looks up a book entry instead
     * of a regular glossary entry.
     *
     * @param bookName name of the book entry to be pulled from BOOKS list
     */
    public static createBookPopup(bookName: string): GPopup {
        const entry: GBookEntry = BOOKS.lookupEntry(bookName) as GBookEntry;
        const popup: GPopup = new GPopup();
        GFF.AdventureUI.add.existing(popup);
        popup.createMiniTitle('God hath been gracious unto thee, for thou hast obtained:');
        popup.createItemImage('book');
        popup.createItemTitle(entry.name);
        popup.createItemBody(entry.title); // TODO: Should be replaced with description when available
        popup.createAmenButton();
        popup.sizeAndCenter(popup.minWidth, popup.minHeight);
        popup.createBorder();
        popup.positioner.arrangeAll();

        // Play a fanfare when we get a book!
        GFF.AdventureUI.getSound().playSound('fanfare');
        return popup;
    }

    /**
     * An unlock popup is used for the key verse minigame.
     * It has a title, an verse text body, animated key/lock image,
     * and a Cancel button.
     */
    public static createUnlockPopup(verseRef: string, hasKey: boolean): GPopup {
        const verseText: string = BIBLE.getVerseTextByRef(verseRef)!;
        const popup: GPopup = new GPopup();
        GFF.AdventureUI.add.existing(popup);
        popup.hasKey = hasKey;
        popup.createMiniTitle('Enter verse text to open the lock:');
        popup.createUnlockImages();
        popup.createUnlockTitle(verseRef);
        popup.createUnlockTextBox();
        popup.createUnlockCancelButton();

        popup.minWidth = (MARGIN * 3) + popup.lockBgImage.width + 400;
        popup.minHeight = (MARGIN * 2) + (CONTENT_SPACER * 2) + popup.miniTitleText.height + popup.lockBgImage.height + popup.buttons[0].height;

        popup.sizeAndCenter(popup.minWidth, popup.minHeight);
        popup.createBorder();
        popup.positioner.arrangeAll();

        // Do this at the end, since it needs the final unlockTextBox position
        // (otherwise we would need to position every character)
        popup.createUnlockText(verseText);

        // Add the unlock cursor:
        popup.unlockCursor = popup.scene.add.image(0, 0, 'char_entry_cursor').setOrigin(0.5, 1).setVisible(popup.hasKey);
        popup.components.push(popup.unlockCursor);
        popup.positionUnlockCursor();

        return popup;
    }

}