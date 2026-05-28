import Phaser from 'phaser';
import { DEPTH } from '../depths';
import { GPoint2D } from '../types';
import type { GBattleContent } from '../scenes/GBattleContent';

const SPEAKX_ADJUST: number = 10;
const SCREEN_EDGE_SPACE: number = 4;
const BUBBLE_PADDING: number = 7;
const BUBBLE_CORNER_RADIUS: number = 10;
const TEXT_SIZE: number = 14;
const TAIL_WIDTH_PCT: number = .2;
const TAIL_HEIGHT: number = 60;
const MAX_LINE_PIXELS: number = 180;

export type BattleSpeechBubbleTailSide = 'left'|'right';

export class GBattleSpeechBubble extends Phaser.GameObjects.Container {

    private bubbleGraphics: Phaser.GameObjects.Graphics;
    private textObj: Phaser.GameObjects.Text;
    private onComplete?: Function;

    constructor(
        scene: GBattleContent,
        speakX: number,
        speakY: number,
        text: string,
        tailSide: BattleSpeechBubbleTailSide,
        onComplete?: Function
    ) {
        super(scene);
        this.onComplete = onComplete;
        scene.add.existing(this);
        this.setDepth(DEPTH.CONV_BUBBLE);

        this.bubbleGraphics = scene.add.graphics();
        this.add(this.bubbleGraphics);

        this.textObj = scene.add.text(0, 0, text, {
            fontSize: TEXT_SIZE + 'px',
            fontFamily: 'oxygen',
            color: '#000000',
            wordWrap: {
                width: MAX_LINE_PIXELS,
                useAdvancedWrap: true
            }
        });
        this.add(this.textObj);

        this.createBubble(speakX, speakY, tailSide);
        this.onComplete?.();
        this.setAlpha(0);
        scene.tweens.add({
            targets: this,
            alpha: 1,
            duration: 150,
            ease: 'Linear'
        });
    }

    private createBubble(speakX: number, speakY: number, tailSide: BattleSpeechBubbleTailSide): void {
        const bubbleWidth = Math.min(this.textObj.width, MAX_LINE_PIXELS) + (BUBBLE_PADDING * 2);
        const bubbleHeight = this.textObj.height + (BUBBLE_PADDING * 2);
        const bubbleLoc: GPoint2D = this.getBestBubbleSpace(speakX, speakY, bubbleWidth, bubbleHeight);

        this.bubbleGraphics.setPosition(bubbleLoc.x, bubbleLoc.y);

        const bubbleCtrX: number = bubbleLoc.x + (bubbleWidth / 2);
        if (bubbleCtrX <= speakX) {
            speakX -= SPEAKX_ADJUST;
        } else {
            speakX += SPEAKX_ADJUST;
        }

        speakX -= bubbleLoc.x;
        speakY -= bubbleLoc.y;

        const tailLoc: GPoint2D = this.getTailAttachPoint(tailSide, speakY, bubbleWidth, bubbleHeight);
        const tailWidth: number = TAIL_WIDTH_PCT * bubbleWidth;
        const pt1X: number = tailLoc.x - (tailWidth / 2);
        const pt1Y: number = tailLoc.y;
        const pt2X: number = tailLoc.x + (tailWidth / 2);
        const pt2Y: number = tailLoc.y;
        const pt3X: number = speakX;
        const pt3Y: number = speakY + (tailLoc.y < speakY ? -10 : 10);

        this.bubbleGraphics.lineStyle(3, 0x565656, 1);
        this.bubbleGraphics.lineBetween(pt2X, pt2Y + 1, pt3X, pt3Y);
        this.bubbleGraphics.lineBetween(pt1X, pt1Y + 1, pt3X, pt3Y);

        this.bubbleGraphics.lineStyle(4, 0x565656, 1);
        this.bubbleGraphics.fillStyle(0xffffff, 1);
        this.bubbleGraphics.strokeRoundedRect(0, 0, bubbleWidth, bubbleHeight, BUBBLE_CORNER_RADIUS);
        this.bubbleGraphics.fillRoundedRect(0, 0, bubbleWidth, bubbleHeight, BUBBLE_CORNER_RADIUS);
        this.bubbleGraphics.fillTriangle(pt1X, pt1Y, pt2X, pt2Y, pt3X, pt3Y);

        this.textObj.setPosition(bubbleLoc.x + BUBBLE_PADDING, bubbleLoc.y + BUBBLE_PADDING);
    }

    private getBestBubbleSpace(speakX: number, speakY: number, bubbleWidth: number, bubbleHeight: number): GPoint2D {
        let bubbleX: number = speakX - (bubbleWidth / 2);
        let bubbleY: number = speakY - (bubbleHeight + TAIL_HEIGHT);

        if (bubbleX < SCREEN_EDGE_SPACE) {
            bubbleX = SCREEN_EDGE_SPACE;
        } else if (bubbleX + bubbleWidth > this.scene.scale.width - SCREEN_EDGE_SPACE) {
            bubbleX = this.scene.scale.width - SCREEN_EDGE_SPACE - bubbleWidth;
        }

        if (bubbleY < 0) {
            bubbleY = speakY + TAIL_HEIGHT;
        }

        return { x: bubbleX, y: bubbleY };
    }

    private getTailAttachPoint(
        tailSide: BattleSpeechBubbleTailSide,
        speakY: number,
        bubbleWidth: number,
        bubbleHeight: number
    ): GPoint2D {
        const bubbleQtr: number = bubbleWidth / 4;
        const tailX: number = tailSide === 'left' ? bubbleQtr : bubbleWidth - bubbleQtr;
        const tailY: number = speakY >= 0 ? bubbleHeight : 0;
        return { x: tailX, y: tailY };
    }

    public fadeOutAndDestroy(duration: number = 150): void {
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            duration,
            ease: 'Linear',
            onComplete: () => {
                this.destroy();
            }
        });
    }
}
