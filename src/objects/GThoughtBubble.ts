import Phaser from 'phaser';
import { GFF } from '../main';
import { GCharSprite } from './chars/GCharSprite';
import { GBubble, GPoint2D } from '../types';
import { RANDOM } from '../random';
import { DEPTH } from '../depths';
import { REGISTRY } from '../registry';

const SPEAKX_ADJUST: number = 10;
const SCREEN_EDGE_SPACE: number = 10;
const CHAR_HEAD_SPACE: number = 30;
const CHAR_HEAD_ADJUST: number = 10;
const DEFAULT_SPACE: number = 4;
const BUBBLE_CORNER_RADIUS: number = 10;
const TEXT_SIZE: number = 14;
const TEXT_HEIGHT: number = TEXT_SIZE + 2;
const TAIL_HEIGHT: number = 60;
const TAIL_POS_PCT_THRESH: number = .2;
const MAX_LINE_PIXELS: number = 256;
const WORDS_PER_SECOND: number = 16;
const PUFF_MIN_RADIUS: number = 10;
const PUFF_MAX_RADIUS: number = 16;
const PUFF_SPREAD: number = 13;
const MORPH_AMT: number = .07;
const SHADOW_OUTLINE: number = 2;

type TextLine = Phaser.GameObjects.Text[];

export class GThoughtBubble extends Phaser.GameObjects.Container implements GBubble {

    private thinker: GCharSprite;
    private bubbleGraphics: Phaser.GameObjects.Graphics;
    private shadowGraphics: Phaser.GameObjects.Graphics;
    private words: Phaser.GameObjects.Text[] = [];
    private lines: TextLine[] = [];
    private puffs: Phaser.GameObjects.Arc[] = [];
    private longestLinePixels: number = 0;
    private currentWordIndex: number = 0;

    private bubbleLoc: GPoint2D
    private bubbleWidth: number;
    private bubbleHeight: number;

    private actualSpeed: number;
    private startTime: number;
    private wordsThought: number = 0;
    private complete: boolean = false;

    constructor(thinker: GCharSprite, text: string) {
        super(GFF.AdventureContent);
        this.thinker = thinker;
        GFF.AdventureContent.add.existing(this);
        this.setDepth(DEPTH.CONV_BUBBLE);

        // Create graphics objects for the bubble shape and its shadow:
        this.bubbleGraphics = GFF.AdventureContent.add.graphics();
        this.shadowGraphics = GFF.AdventureContent.add.graphics();

        // Parse the text into lines of Text objects:
        this.parseIntoLines(text);

        // Justify each line by adding padding to the objects:
        this.justifyLines();

        // Get pixel count of the longest line:
        this.longestLinePixels = this.getLongestLinePixels();

        // Set the actual speed based on the talk speed option:
        this.actualSpeed = WORDS_PER_SECOND * REGISTRY.getNumber('talkSpeed');

        // Create the bubble:
        this.createBubble();

        // Start the timer for words:
        this.startTime = Date.now();

        // Say initial "hmm..." sound:
        GFF.AdventureContent.getSound().playSound('think', 1.0);
    }

    private createBubble(): void {

        let speakX: number = this.thinker.getTopCenter().x;
        let speakY: number = this.thinker.y + CHAR_HEAD_SPACE;

        this.bubbleWidth = Math.min(this.longestLinePixels, MAX_LINE_PIXELS);
        this.bubbleHeight = (this.lines.length * TEXT_HEIGHT);

        // Get best location to place the bubble:
        this.bubbleLoc = this.getBestBubbleSpace(speakX, speakY, this.bubbleWidth, this.bubbleHeight);

        // Now we know where the bubble is going; set position for the bubble graphics:
        this.shadowGraphics.setPosition(this.bubbleLoc.x, this.bubbleLoc.y);
        this.bubbleGraphics.setPosition(this.bubbleLoc.x, this.bubbleLoc.y);

        // Adjust speakX to either side:
        const bubbleCtrX: number = this.bubbleLoc.x + (this.bubbleWidth / 2);
        if (bubbleCtrX <= speakX) {
            // Bubble is centered or left of center:
            speakX -= SPEAKX_ADJUST;
        } else {
            // Bubble is right of center:
            speakX += SPEAKX_ADJUST;
        }

        // Translate speakX and speakY into the relative bubble space:
        speakX -= this.bubbleLoc.x;
        speakY -= this.bubbleLoc.y;

        // Add graphics object for shadow; it needs to be first/lowest:
        this.add(this.shadowGraphics);

        // Get location for where the tail attaches to the bubble:
        const tailLoc: GPoint2D = this.getBestTailAttachPoint(speakX, speakY, 0, 0, this.bubbleWidth, this.bubbleHeight);
        const speakLoc: GPoint2D = {x: speakX, y: speakY};
        // const tailLength = Phaser.Math.Distance.BetweenPoints(tailLoc, speakLoc);

        // Tail puff data:
        const tp1Radius: number = 5;
        const pt1X: number = speakX;
        const pt1Y: number = speakY + (tailLoc.y < speakY ? -CHAR_HEAD_ADJUST : CHAR_HEAD_ADJUST);

        const xTailLength: number = tailLoc.x - pt1X;
        const yTailLength: number = tailLoc.y - pt1Y;

        const tp2Radius: number = 7;
        const pt2X: number = pt1X + (xTailLength / 4);
        const pt2Y: number = pt1Y + (yTailLength / 4);

        const tp3Radius: number = 9;
        const pt3X: number = pt2X + (xTailLength / 3);
        const pt3Y: number = pt2Y + (yTailLength / 3);

        // Tail puffs:
        this.bubbleGraphics.lineStyle(SHADOW_OUTLINE, 0x565656);
        this.bubbleGraphics.fillStyle(0xffffff, 1);

        this.bubbleGraphics.fillCircle(pt1X, pt1Y, tp1Radius);
        this.bubbleGraphics.strokeCircle(pt1X, pt1Y, tp1Radius);

        this.bubbleGraphics.fillCircle(pt2X, pt2Y, tp2Radius);
        this.bubbleGraphics.strokeCircle(pt2X, pt2Y, tp2Radius);

        this.bubbleGraphics.fillCircle(pt3X, pt3Y, tp3Radius);
        this.bubbleGraphics.strokeCircle(pt3X, pt3Y, tp3Radius);

        // Cloudy puffs around edge of bubble:
        this.createCloudyPuffs(this.bubbleLoc.x, this.bubbleLoc.y, this.bubbleWidth, this.bubbleHeight);

        // Bubble:
        this.add(this.bubbleGraphics);
        this.bubbleGraphics.fillStyle(0xffffff, 1);
        this.bubbleGraphics.fillRoundedRect(0, 0, this.bubbleWidth, this.bubbleHeight, BUBBLE_CORNER_RADIUS);

        // Arrange the Text objects in order over the bubble:
        this.arrangeTextObjs(this.bubbleLoc.x, this.bubbleLoc.y, TEXT_HEIGHT);
    }

    private refreshRectWithShadow() {
        this.shadowGraphics.clear();
        this.shadowGraphics.fillStyle(0x565656, 1);
        this.puffs.forEach(p => {
            this.shadowGraphics.fillCircle(
                p.getCenter().x - this.bubbleLoc.x,
                p.getCenter().y - this.bubbleLoc.y,
                p.radius + SHADOW_OUTLINE);
        });
        this.shadowGraphics.fillRoundedRect(
            -SHADOW_OUTLINE,
            -SHADOW_OUTLINE,
            this.bubbleWidth + (SHADOW_OUTLINE * 2),
            this.bubbleHeight + (SHADOW_OUTLINE * 2),
            BUBBLE_CORNER_RADIUS
        );
    }

    private createCloudyPuffs(bubbleX: number, bubbleY: number, bubbleWidth: number, bubbleHeight: number) {
        const ctrX: number = bubbleX + (bubbleWidth / 2);
        const ctrY: number = bubbleY + (bubbleHeight / 2);
        let x: number;
        let y: number;

        // Top/Bottom edges (horizontal):
        this.makePuff(ctrX, bubbleY, RANDOM.randInt(PUFF_MIN_RADIUS, PUFF_MAX_RADIUS));
        this.makePuff(ctrX, bubbleY + bubbleHeight, RANDOM.randInt(PUFF_MIN_RADIUS, PUFF_MAX_RADIUS));

        for (x = PUFF_SPREAD; x < bubbleWidth / 2; x += PUFF_SPREAD) {
            y = bubbleY;
            this.makePuff(ctrX + x, y, RANDOM.randInt(PUFF_MIN_RADIUS, PUFF_MAX_RADIUS));
            this.makePuff(ctrX - x, y, RANDOM.randInt(PUFF_MIN_RADIUS, PUFF_MAX_RADIUS));
            y = bubbleY + bubbleHeight;
            this.makePuff(ctrX + x, y, RANDOM.randInt(PUFF_MIN_RADIUS, PUFF_MAX_RADIUS));
            this.makePuff(ctrX - x, y, RANDOM.randInt(PUFF_MIN_RADIUS, PUFF_MAX_RADIUS));
        }
        // Left/Right edges (vertical):
        this.makePuff(bubbleX, ctrY, RANDOM.randInt(PUFF_MIN_RADIUS, PUFF_MAX_RADIUS));
        this.makePuff(bubbleX + bubbleWidth, ctrY, RANDOM.randInt(PUFF_MIN_RADIUS, PUFF_MAX_RADIUS));

        for (y = PUFF_SPREAD; y < bubbleHeight / 2; y += PUFF_SPREAD) {
            x = bubbleX;
            this.makePuff(x, ctrY + y, RANDOM.randInt(PUFF_MIN_RADIUS, PUFF_MAX_RADIUS));
            this.makePuff(x, ctrY - y, RANDOM.randInt(PUFF_MIN_RADIUS, PUFF_MAX_RADIUS));
            x = bubbleX + bubbleWidth;
            this.makePuff(x, ctrY + y, RANDOM.randInt(PUFF_MIN_RADIUS, PUFF_MAX_RADIUS));
            this.makePuff(x, ctrY - y, RANDOM.randInt(PUFF_MIN_RADIUS, PUFF_MAX_RADIUS));
        }
    }

    private makePuff(x: number, y: number, radius: number) {
        const puff: Phaser.GameObjects.Arc = this.scene.add.circle(x, y, radius, 0xffffff, 1);
        this.puffs.push(puff);
        this.add(puff);
        puff.setData('morph', MORPH_AMT);
    }

    private getBestBubbleSpace(speakX: number, speakY: number, bubbleWidth: number, bubbleHeight: number): GPoint2D {
        // The best space is directly above the thinker, if possible
        let bubbleX: number = speakX - (bubbleWidth / 2);
        let bubbleY: number = speakY - (bubbleHeight + TAIL_HEIGHT);

        // Adjust X if needed to keep the bubble on the screen:
        if (bubbleX < GFF.LEFT_BOUND + SCREEN_EDGE_SPACE) {
            bubbleX = GFF.LEFT_BOUND + SCREEN_EDGE_SPACE;
        } else if (bubbleX + bubbleWidth > GFF.RIGHT_BOUND - SCREEN_EDGE_SPACE) {
            bubbleX = GFF.RIGHT_BOUND - SCREEN_EDGE_SPACE - bubbleWidth;
        }

        // Adjust Y if needed to keep the bubble on the screen.
        // We don't want to just shift the bubble down and cover up the thinker.
        // The orientation of the bubble will have to be flipped to be under the thinker,
        // and the tail will end up pointing up toward the thinker.
        if (bubbleY < GFF.TOP_BOUND) {
            bubbleY = speakY + TAIL_HEIGHT;
        }

        return {x: bubbleX, y: bubbleY};
    }

    private getBestTailAttachPoint(speakX: number, speakY: number, bubbleX: number, bubbleY: number, bubbleWidth: number, bubbleHeight: number): GPoint2D {

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
            // Bubble is above thinker; attach tail to bottom edge:
            tailY = bubbleY + bubbleHeight;
        } else {
            // Bubble is below thinker; attach tail to top edge:
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
                wordObj.setPosition(x + xOff, y);
                xOff += wordObj.width;
                this.add(wordObj);
                this.words.push(wordObj);
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
            fontStyle: 'italic',
            color: '#000000'
        });
        wordObj.visible = false;
        return wordObj;
    }

    public update(): void {
        // The update happens in two parts:

        // The cloudy edge should always "morph":
        this.refreshRectWithShadow();
        this.puffs.forEach(p => {
            p.setRadius(p.radius + parseFloat(p.getData('morph')));
            if (p.radius <= PUFF_MIN_RADIUS) {
                p.setData('morph', MORPH_AMT);
            } else if (p.radius >= PUFF_MAX_RADIUS) {
                p.setData('morph', -MORPH_AMT);
            }
        });

        // But the rest should only happen if not completed:
        if (!this.isComplete()) {
            let timeElapsed: number = Date.now() - this.startTime;
            let wordsToMoment: number = (timeElapsed / 1000) * this.actualSpeed;
            // Think another word if the time is right and there are more words to think:
            while (this.wordsThought < wordsToMoment && this.thinkNextWord()) {
                this.wordsThought++;
            }
        }
    }

    public isComplete(): boolean {
        if (this.complete) {
            return true;
        } else {
            this.complete = this.currentWordIndex >= this.words.length;
            if (this.complete) {
                this.onComplete();
            }
            return this.complete;
        }
    }

    private onComplete() {
        GFF.AdventureUI.showPrompt('Press Enter to continue...');
    }

    private thinkNextWord(): boolean {
        if (this.isComplete()) {
            return false;
        } else {
            (this.words[this.currentWordIndex++] as Phaser.GameObjects.Text).visible = true;
            return true;
        }
    }
}