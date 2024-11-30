import Phaser from 'phaser';
import { GFF } from '../main';
import { GCharSprite } from './chars/GCharSprite';
import { COption, GBubble, GPoint } from '../types';
import { DEPTH } from '../depths';

const SPEAKX_ADJUST: number = 10;
const SCREEN_EDGE_SPACE: number = 4;
const CHAR_HEAD_SPACE: number = 30;
const CHAR_HEAD_ADJUST: number = 10;
const BUBBLE_PADDING: number = 7;
const BUBBLE_CORNER_RADIUS: number = 10;
const TEXT_SIZE: number = 14;
const TEXT_HEIGHT: number = TEXT_SIZE + 2;
const TAIL_WIDTH_PCT: number = .2;
const TAIL_HEIGHT: number = 60;
const TAIL_POS_PCT_THRESH: number = .2;
const MAX_LINE_PIXELS: number = 256;

export class GChoiceBubble extends Phaser.GameObjects.Container implements GBubble {

    private speaker: GCharSprite;
    private bubbleGraphics: Phaser.GameObjects.Graphics;
    private optionLines: Phaser.GameObjects.Text[] = [];
    private optionResultIds: string[] = [];
    private longestLinePixels: number = 0;
    private selectedOptionIndex: number = 0;

    constructor(speaker: GCharSprite, options: COption[]) {
        super(GFF.AdventureContent);
        this.speaker = speaker;
        GFF.AdventureContent.add.existing(this);
        this.setDepth(DEPTH.CONV_BUBBLE);

        // Create graphics object for the bubble shape:
        this.bubbleGraphics = GFF.AdventureContent.add.graphics();
        this.add(this.bubbleGraphics);

        // Create a Text object for each option:
        this.createOptionLines(options);

        // Get pixel count of the longest line:
        this.longestLinePixels = this.getLongestLinePixels();

        // Create the bubble:
        this.createBubble();
    }

    private createBubble(): void {

        let speakX: number = this.speaker.getTopCenter().x;
        let speakY: number = this.speaker.y + CHAR_HEAD_SPACE;

        const bubbleWidth = Math.min(this.longestLinePixels, MAX_LINE_PIXELS) + (BUBBLE_PADDING * 2);
        const bubbleHeight = (this.optionLines.length * TEXT_HEIGHT) + (BUBBLE_PADDING * 2);

        // Get best location to place the bubble:
        const bubbleLoc: GPoint = this.getBestBubbleSpace(speakX, speakY, bubbleWidth, bubbleHeight);

        // Now we know where the bubble is going; set position for the bubble graphics:
        this.bubbleGraphics.setPosition(bubbleLoc.x, bubbleLoc.y);

        // Adjust speakX to either side:
        const bubbleCtrX: number = bubbleLoc.x + (bubbleWidth / 2);
        if (bubbleCtrX <= speakX) {
            // Bubble is centered or left of center:
            speakX -= SPEAKX_ADJUST;
        } else {
            // Bubble is right of center:
            speakX += SPEAKX_ADJUST;
        }

        // Translate speakX and speakY into the relative bubble space:
        speakX -= bubbleLoc.x;
        speakY -= bubbleLoc.y;

        // Get location for where the tail attaches to the bubble:
        const tailLoc: GPoint = this.getBestTailAttachPoint(speakX, speakY, 0, 0, bubbleWidth, bubbleHeight);

        // Tail points:
        const tailWidth: number = TAIL_WIDTH_PCT * bubbleWidth;
        const pt1X: number = tailLoc.x - (tailWidth / 2);
        const pt1Y: number = tailLoc.y;
        const pt2X: number = tailLoc.x + (tailWidth / 2);
        const pt2Y: number = tailLoc.y;
        const pt3X: number = speakX;
        const pt3Y: number = speakY + (tailLoc.y < speakY ? -CHAR_HEAD_ADJUST : CHAR_HEAD_ADJUST);

        // Tail outline:
        this.bubbleGraphics.lineStyle(3, 0x565656, 1);
        this.bubbleGraphics.lineBetween(pt2X, pt2Y+1, pt3X, pt3Y);
        this.bubbleGraphics.lineBetween(pt1X, pt1Y+1, pt3X, pt3Y);

        // Bubble:
        this.bubbleGraphics.lineStyle(4, 0x565656, 1);
        this.bubbleGraphics.fillStyle(0xffffff, 1);
        this.bubbleGraphics.strokeRoundedRect(0, 0, bubbleWidth, bubbleHeight, BUBBLE_CORNER_RADIUS);
        this.bubbleGraphics.fillRoundedRect(0, 0, bubbleWidth, bubbleHeight, BUBBLE_CORNER_RADIUS);

        // Fill tail last, to paint over outline and make it look like one shape:
        this.bubbleGraphics.fillTriangle(pt1X, pt1Y, pt2X, pt2Y, pt3X, pt3Y);

        // Arrange the Line objects in order over the bubble:
        this.arrangeLineObjs(bubbleLoc.x + BUBBLE_PADDING, bubbleLoc.y + BUBBLE_PADDING, TEXT_HEIGHT);
    }

    private getBestBubbleSpace(speakX: number, speakY: number, bubbleWidth: number, bubbleHeight: number): GPoint {
        // The best space is directly above the speaker, if possible
        let bubbleX: number = speakX - (bubbleWidth / 2);
        let bubbleY: number = speakY - (bubbleHeight + TAIL_HEIGHT);

        // Adjust X if needed to keep the bubble on the screen:
        if (bubbleX < GFF.LEFT_BOUND + SCREEN_EDGE_SPACE) {
            bubbleX = GFF.LEFT_BOUND + SCREEN_EDGE_SPACE;
        } else if (bubbleX + bubbleWidth > GFF.RIGHT_BOUND - SCREEN_EDGE_SPACE) {
            bubbleX = GFF.RIGHT_BOUND - SCREEN_EDGE_SPACE - bubbleWidth;
        }

        // Adjust Y if needed to keep the bubble on the screen.
        // We don't want to just shift the bubble down and cover up the speaker.
        // The orientation of the bubble will have to be flipped to be under the speaker,
        // and the tail will end up pointing up toward the speaker.
        if (bubbleY < GFF.TOP_BOUND) {
            bubbleY = speakY + TAIL_HEIGHT;
        }

        return {x: bubbleX, y: bubbleY};
    }

    private getBestTailAttachPoint(speakX: number, speakY: number, bubbleX: number, bubbleY: number, bubbleWidth: number, bubbleHeight: number): GPoint {

        const bubbleCtrX: number = bubbleX + (bubbleWidth / 2);
        const xDiff: number = bubbleCtrX - speakX;
        const attachCtr: boolean = Math.abs(xDiff) > TAIL_POS_PCT_THRESH * bubbleWidth;
        const bubbleQtr: number = bubbleWidth / 4;

        let tailX: number;
        let tailY: number;
        if (bubbleCtrX >= speakX) {
            // Bubble is centered or right of center:
            tailX = attachCtr ? bubbleCtrX : bubbleX + bubbleQtr;
        } else {
            // Bubble is left of center:
            tailX = attachCtr ? bubbleCtrX : (bubbleX + bubbleWidth) - bubbleQtr;
        }

        if (bubbleY <= speakY) {
            // Bubble is above speaker; attach tail to bottom edge:
            tailY = bubbleY + bubbleHeight;
        } else {
            // Bubble is below speaker; attach tail to top edge:
            tailY = bubbleY;
        }

        return {x: tailX, y: tailY};
    }

    private createOptionLines(options: COption[]) {
        options.forEach(o => {
            this.optionLines.push(this.createLineObj(o.choiceText));
            this.optionResultIds.push(o.resultId);
        });
    }

    private arrangeLineObjs(x: number, y: number, textHeight: number) {
        this.optionLines.forEach(line => {
            line.setPosition(x, y);
            y += textHeight;
        });
    }

    private getLongestLinePixels(): number {
        let longest: number = 0;
        this.optionLines.forEach(line => {
            let pixelCount: number = line.width;
            longest = Math.max(longest, pixelCount);
        });
        return longest;
    }

    private createLineObj(optionText: string): Phaser.GameObjects.Text {
        const lineObj = this.scene.add.text(0, 0, optionText, {
            fontSize: TEXT_SIZE + 'px',
            fontFamily: 'oxygen',
            color: '#000000'
        });
        this.add(lineObj);
        return lineObj;
    }

    public changeSelection(direction: 'Up'|'Down') {
        if (direction === 'Up') {
            this.selectedOptionIndex--;
            if (this.selectedOptionIndex < 0) {
                this.selectedOptionIndex = this.optionLines.length - 1;
            }
        } else {
            this.selectedOptionIndex++;
            if (this.selectedOptionIndex >= this.optionLines.length) {
                this.selectedOptionIndex = 0;
            }
        }
    }

    public getSelectedOption(): string {
        return this.optionResultIds[this.selectedOptionIndex];
    }

    public update(): void {
        this.optionLines.forEach((o, i) => {
            if (i === this.selectedOptionIndex) {
                // Put a highlight around the option
                o.setBackgroundColor('#f7ff03');
            } else {
                // Clear any highlight
                o.setBackgroundColor('transparent');
            }
        });
    }

    public isComplete(): boolean {
        // For choice bubbles, there's nothing to "complete".
        // The bubble begins with a selection, and can change it with arrow keys.
        // The selection will be finalized when we use [Enter] to advance.
        return true;
    }
}