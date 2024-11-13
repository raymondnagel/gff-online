import Phaser from 'phaser';
import { GFF } from '../main';
import { GCharSprite } from './chars/GCharSprite';
import { GBubble, GPoint } from '../types';

const SPEAKX_ADJUST: number = 10;
const SCREEN_EDGE_SPACE: number = 4;
const CHAR_HEAD_SPACE: number = 30;
const CHAR_HEAD_ADJUST: number = 10;
const DEFAULT_SPACE: number = 4;
const BUBBLE_PADDING: number = 7;
const BUBBLE_CORNER_RADIUS: number = 10;
const TEXT_SIZE: number = 14;
const TEXT_HEIGHT: number = TEXT_SIZE + 2;
const TAIL_WIDTH_PCT: number = .2;
const TAIL_HEIGHT: number = 60;
const TAIL_POS_PCT_THRESH: number = .2;
const MAX_LINE_PIXELS: number = 256;
const WORDS_PER_SECOND: number = 8;

type TextLine = Phaser.GameObjects.Text[];

export class GSpeechBubble extends Phaser.GameObjects.Container implements GBubble {

    private speaker: GCharSprite;
    private bubbleGraphics: Phaser.GameObjects.Graphics;
    private lines: TextLine[] = [];
    private longestLinePixels: number = 0;
    private currentWordIndex: number = 0;

    private startTime: number;
    private wordsSpoken: number = 0;

    constructor(speaker: GCharSprite, text: string) {
        super(GFF.AdventureContent);
        this.speaker = speaker;
        GFF.AdventureContent.add.existing(this);
        this.setDepth(9999);

        // Create graphics object for the bubble shape:
        this.bubbleGraphics = GFF.AdventureContent.add.graphics();
        this.add(this.bubbleGraphics);

        // Parse the text into lines of Text objects:
        this.parseIntoLines(text);

        // Justify each line by adding padding to the objects:
        this.justifyLines();

        // Get pixel count of the longest line:
        this.longestLinePixels = this.getLongestLinePixels();

        // Create the bubble:
        this.createBubble();

        // Start the timer for words:
        this.startTime = Date.now();
    }

    private createBubble(): void {

        let speakX: number = this.speaker.getTopCenter().x;
        let speakY: number = this.speaker.y + CHAR_HEAD_SPACE;

        const bubbleWidth = Math.min(this.longestLinePixels, MAX_LINE_PIXELS) + (BUBBLE_PADDING * 2);
        const bubbleHeight = (this.lines.length * TEXT_HEIGHT) + (BUBBLE_PADDING * 2);

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

        // Arrange the Text objects in order over the bubble:
        this.arrangeTextObjs(bubbleLoc.x + BUBBLE_PADDING, bubbleLoc.y + BUBBLE_PADDING, TEXT_HEIGHT);
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

    private parseIntoLines(text: string) {

        let textLine: Phaser.GameObjects.Text[] = [];
        let linePixelCount: number = 0;
        let newline: boolean = false;
        const words: string[] = text.replaceAll('\n', ' \n ').split(' ');

        words.forEach(word => {
            if (word === '\n') {
                // Actually it's a newline char, so we'll start a new line:
                newline = true;
                this.lines.push(textLine);
                textLine = [];
                linePixelCount = 0;

            } else {
                // It's a regular word, so we'll create an object for it:
                // Create and measure with default padding, to make sure we have enough room for justification later:
                const wordObj: Phaser.GameObjects.Text = this.createWordObj(word).setPadding(0, 0, DEFAULT_SPACE, 0);
                if (linePixelCount + wordObj.width <= MAX_LINE_PIXELS) {
                    // Word fits on the current line, so add it:
                    wordObj.setText(word);
                    if (newline) {
                        wordObj.setState('newline');
                        newline = false;
                    }
                    textLine.push(wordObj);
                    linePixelCount += wordObj.width;

                } else if (word.includes('-')) {
                    // Word which doesn't fit actually has a hyphen;
                    // break it on the hyphen and see if the first part will fit.
                    let compound: string[] = word.split('-');
                    let part1: string = compound[0] + '-';
                    let part2: string = word.replace(part1, '');
                    wordObj.setText(part1);
                    if (linePixelCount + wordObj.width <= MAX_LINE_PIXELS) {
                        // If the first part fits, add it and start a new line with the remainder:
                        wordObj.setText(part1);
                        textLine.push(wordObj);
                        this.lines.push(textLine);
                        const wordObj2: Phaser.GameObjects.Text = this.createWordObj(part2).setPadding(0, 0, DEFAULT_SPACE, 0);
                        textLine = [wordObj2];
                        linePixelCount = wordObj2.width;
                    }

                } else {
                    // Create a new line and add it there:
                    this.lines.push(textLine);
                    textLine = [wordObj];
                    linePixelCount = wordObj.width;
                }
            }
        });

        // Push up the last line:
        this.lines.push(textLine);
    }

    private justifyLines() {
        for (let i = 0; i < this.lines.length; i++) {
            this.justifyLine(i);
        }
    }

    private justifyLine(index: number) {
        // Determine if we can skip justification for this line:
        if (
            this.lines.length < 3 // Don't justify if there are less than 3 lines.
            || index === this.lines.length - 1 // Don't justify the last line
            || this.lines[index + 1][0].text === '' // Don't justify if the next line is empty
            || this.lines[index + 1][0].state === 'newline' // Don't justify if the next line had a \n
        ) {
            return;
        }

        let widthWithoutSpaces: number = 0;
        const line = this.lines[index];
        line.forEach(wordObj => {
            wordObj.setPadding(0, 0, 0, 0);
            widthWithoutSpaces += wordObj.width;
        });

        const spaceToDistribute = MAX_LINE_PIXELS - widthWithoutSpaces;
        const eachSpace = spaceToDistribute / (line.length - 1);
        line.forEach((wordObj, index, array) => {
            wordObj.setPadding(0, 0, index < array.length-1 ? eachSpace : 0, 0);
        });

        line[line.length-1].setPadding(0, 0, 0, 0);
    }

    private arrangeTextObjs(x: number, y: number, textHeight: number) {
        this.lines.forEach(line => {
            let xOff: number = 0;
            line.forEach(wordObj => {
                this.add(wordObj);
                wordObj.setPosition(x + xOff, y);
                xOff += wordObj.width;
            });
            y += textHeight;
        });
    }

    private getLongestLinePixels(): number {
        let longest: number = 0;
        this.lines.forEach(line => {
            let pixelCount: number = 0;
            line.forEach(wordObj => {
                pixelCount += wordObj.width;
            });
            longest = Math.max(longest, pixelCount);
        });
        return longest;
    }

    private createWordObj(text: string): Phaser.GameObjects.Text {
        const wordObj = this.scene.add.text(0, 0, text, {
            fontSize: TEXT_SIZE + 'px',
            fontFamily: 'oxygen',
            color: '#000000'
        });
        wordObj.visible = false;
        this.add(wordObj);
        return wordObj;
    }

    public update(): void {
        if (!this.isComplete()) {
            let timeElapsed: number = Date.now() - this.startTime;
            let wordsToMoment: number = (timeElapsed / 1000) * WORDS_PER_SECOND;
            let wordWasSpoken: boolean = false;
            // Say another word if the time is right and there are more words to say:
            while (this.wordsSpoken < wordsToMoment && this.sayNextWord()) {
                this.wordsSpoken++;
                // We don't want to play a speech sound more than once per step,
                // so only call pronounce if a word was not already spoken:
                if (!wordWasSpoken) {
                    this.speaker.pronounceWord();
                    wordWasSpoken = true;
                }
            }
        }
    }

    public isComplete(): boolean {
        return this.currentWordIndex >= this.length;
    }

    private sayNextWord(): boolean {
        if (this.isComplete()) {
            return false;
        } else {
            (this.getAt(this.currentWordIndex++) as Phaser.GameObjects.Text).visible = true;
            return true;
        }
    }
}