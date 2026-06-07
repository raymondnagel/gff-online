import 'phaser';
import { DIRECTION } from "../../direction";
import { GFF } from "../../main";
import { Dir9, GGender, GPoint2D } from "../../types";

type SaintAnimation = 'idle'|'kneel'|'raise_hands'|'cast_crown';

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
        this.idle(Dir9.S);
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

    public kneel(direction?: Dir9): void {
        this.playDirectionalAnimation('kneel', direction);
    }

    public raiseHands(direction?: Dir9): void {
        this.playDirectionalAnimation('raise_hands', direction);
    }

    public castCrown(direction?: Dir9, onComplete?: Function): void {
        this.playDirectionalAnimation('cast_crown', direction);
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

    private playDirectionalAnimation(animName: SaintAnimation, dir?: Dir9): void {
        const direction = dir ?? this.direction;
        this.faceDirection(direction);
        const dirText = DIRECTION.dir9Texts()[this.direction];
        this.play(`${this.spriteKeyPrefix}_${animName}_${dirText}`, true);
    }

    private createAnimations(): void {
        this.createDirectionalAnimations('idle');
        this.createDirectionalAnimations('kneel');
        this.createDirectionalAnimations('raise_hands');
        this.createDirectionalAnimations('cast_crown', 0);
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
