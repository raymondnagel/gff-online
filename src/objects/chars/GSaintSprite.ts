import 'phaser';
import { COLOR } from "../../colors";
import { DEPTH } from "../../depths";
import { DIRECTION } from "../../direction";
import { GFF } from "../../main";
import { Dir9, GGender, GPoint2D } from "../../types";

type SaintAnimation = 'idle'|'crown_idle'|'kneel'|'raisehands'|'castcrown';
const FLOAT_TEXT_SPACE: number = 10;
const FLOAT_TEXT_HOLD_TIME: number = 450;
const FLOAT_TEXT_FADE_OUT_TIME: number = 450;

export class GSaintSprite extends Phaser.GameObjects.Sprite {

    private spriteKeyPrefix: string;
    private direction: Dir9 = Dir9.S;

    constructor(gender: GGender, x: number, y: number) {
        const spriteKeyPrefix = `saint_${gender}`;
        super(GFF.AdventureContent, x, y, `${spriteKeyPrefix}_idle_s`);

        this.spriteKeyPrefix = spriteKeyPrefix;
        this.setOrigin(0, 0);
        GFF.AdventureContent.add.existing(this);
        this.createAnimations();
        this.crownIdle(Dir9.S);
    }

    public getDirection(): Dir9 {
        return this.direction;
    }

    public faceDirection(direction: Dir9, setIdle: boolean = false): void {
        if (direction !== Dir9.NONE) {
            this.direction = direction;
            if (setIdle) {
                this.idle(direction);
            }
        }
    }

    public idle(direction?: Dir9): void {
        this.playDirectionalAnimation('idle', direction);
    }

    public crownIdle(direction?: Dir9): void {
        this.playDirectionalAnimation('crown_idle', direction);
    }

    public kneel(direction?: Dir9): void {
        this.playDirectionalAnimation('kneel', direction);
    }

    public raiseHands(direction?: Dir9): void {
        this.playDirectionalAnimation('raisehands', direction);
    }

    public castCrown(direction?: Dir9, onComplete?: Function): void {
        this.playDirectionalAnimation('castcrown', direction);
        if (onComplete !== undefined) {
            this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                onComplete.call(this);
            });
        }
    }

    public centerPhysically(point: GPoint2D): void {
        this.setPosition(
            point.x - GFF.CHAR_BODY_X_OFF - (GFF.CHAR_BODY_W / 2),
            point.y - GFF.CHAR_BODY_Y_OFF - (GFF.CHAR_BODY_H / 2)
        );
    }

    public showFloatingText(text: string, timeScope: 'info'|'word'|'phrase' = 'info'): void {
        let appearTime: number;
        switch (timeScope) {
            case 'info':
                appearTime = 180;
                break;
            case 'word':
                appearTime = 220;
                break;
            case 'phrase':
                appearTime = 300;
                break;
        }

        const point = this.getFloatingTextAnchor();
        const floatText = GFF.AdventureContent.add.text(point.x, point.y - FLOAT_TEXT_SPACE, text, {
            fontFamily: 'oxygen',
            fontSize: '14px',
            color: COLOR.GOLD_2.str(),
        })
            .setLetterSpacing(1)
            .setShadow(1, 1, '#333333', 1, false, true)
            .setOrigin(.5, 1)
            .setDepth(DEPTH.FLOAT_TEXT)
            .setScale(.2, .2)
            .setAlpha(.2);

        GFF.AdventureContent.tweens.chain({
            targets: floatText,
            tweens: [
                {
                    duration: appearTime,
                    scaleX: 1,
                    scaleY: 1,
                    alpha: 1,
                    onUpdate: () => {
                        const point = this.getFloatingTextAnchor();
                        floatText.setPosition(point.x, point.y - FLOAT_TEXT_SPACE);
                    }
                },
                {
                    duration: FLOAT_TEXT_HOLD_TIME,
                    scaleX: 1.5,
                    scaleY: 1.5,
                    alpha: 1,
                    onUpdate: () => {
                        const point = this.getFloatingTextAnchor();
                        floatText.setPosition(point.x, point.y - FLOAT_TEXT_SPACE);
                    }
                },
                {
                    duration: FLOAT_TEXT_FADE_OUT_TIME,
                    scaleX: 2,
                    scaleY: 2,
                    alpha: 0,
                    onUpdate: () => {
                        const point = this.getFloatingTextAnchor();
                        floatText.setPosition(point.x, point.y - FLOAT_TEXT_SPACE);
                    },
                    onComplete: () => {
                        floatText.destroy();
                    }
                },
            ]
        });
    }

    private getFloatingTextAnchor(): GPoint2D {
        return {
            x: this.x + (this.displayWidth / 2),
            y: this.y
        };
    }

    private playDirectionalAnimation(animName: SaintAnimation, dir?: Dir9): void {
        const direction = dir ?? this.direction;
        this.faceDirection(direction);
        const dirText = DIRECTION.dir9Texts()[this.direction];
        this.play(`${this.spriteKeyPrefix}_${animName}_${dirText}`, true);
    }

    private createAnimations(): void {
        this.createDirectionalAnimations('idle');
        this.createDirectionalAnimations('crown_idle');
        this.createDirectionalAnimations('kneel');
        this.createDirectionalAnimations('raisehands');
        this.createDirectionalAnimations('castcrown', 0);
    }

    private createDirectionalAnimations(animName: SaintAnimation, repeats: number = -1): void {
        DIRECTION.dir8Texts().forEach(direction => {
            const key = `${this.spriteKeyPrefix}_${animName}_${direction}`;
            if (this.anims.exists(key)) {
                return;
            }

            this.anims.create({
                key,
                frames: this.anims.generateFrameNumbers(key),
                frameRate: 10,
                repeat: repeats
            });
        });
    }
}
