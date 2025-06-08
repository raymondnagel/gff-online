import 'phaser';
import { GStatusUI } from '../../scenes/GStatusUI';
import { DIRECTION } from '../../direction';
import { Dir9 } from '../../types';

const SPRITE_KEY_PREFIX: string = 'adam';

const ANIMATION_SEQUENCE: string[] = [
    'idle_s',
    'wave_s',
    'walk_s',
    'run_s',
    'run_sw',
    'walk_sw',
    'idle_sw',
    'bullhorn_sw',
    'preach_sw',
    'nobullhorn_sw',
    'idle_w',
    'walk_w',
    'run_w',
    'run_nw',
    'walk_nw',
    'idle_nw',
    'idle_n',
    'walk_n',
    'run_n',
    'run_ne',
    'walk_ne',
    'idle_ne',
    'kneel_ne',
    'idle_e',
    'walk_e',
    'run_e',
    'run_se',
    'walk_se',
    'idle_se',
    'rejoice_s',
];

/**
 * The player avatar for the status screen.
 * This is a simplified version of the player sprite
 * that is only meant to play animations, not to interact
 * with the game world or objects.
 */

export class GStatusAvatar extends Phaser.GameObjects.Sprite {

    private currentAnimationIndex: number = 0;

    constructor(scene: GStatusUI, x:number, y: number) {
        super(scene, x, y, SPRITE_KEY_PREFIX);
        scene.add.existing(this);

        const avatar: GStatusAvatar = this;
        this.on(Phaser.Animations.Events.ANIMATION_COMPLETE, function () {
            avatar.nextAnimation();
        }, this);

        this.createDirectionalAnimations('idle');
        this.createDirectionalAnimations('walk');
        this.createDirectionalAnimations('run');
        this.createSingleAnimation('kneel_ne');
        this.createSingleAnimation('rejoice_s');
        this.createSingleAnimation('wave_s');
        this.createSingleAnimation('bullhorn_sw');
        this.createSingleAnimation('nobullhorn_sw');
        this.createSingleAnimation('preach_sw');

        this.playSingleAnimation(ANIMATION_SEQUENCE[this.currentAnimationIndex]);
    }

    private nextAnimation() {
        this.currentAnimationIndex++;
        if (this.currentAnimationIndex >= ANIMATION_SEQUENCE.length) {
            this.currentAnimationIndex = 0;
        }
        this.playSingleAnimation(ANIMATION_SEQUENCE[this.currentAnimationIndex]);
    }

    private playSingleAnimation(animName: string) {
        this.play(`${SPRITE_KEY_PREFIX}_${animName}`, false);
    }

    // private playDirectionalAnimation(animName: string, dir: Dir9) {
    //     let dirText = DIRECTION.dir9Texts()[dir];
    //     this.play(`${SPRITE_KEY_PREFIX}_${animName}_${dirText}`, false);
    // }

    private createSingleAnimation(animName: string) {
        this.anims.create({
            key: `${SPRITE_KEY_PREFIX}_${animName}`,
            frames: this.anims.generateFrameNumbers(
                `${SPRITE_KEY_PREFIX}_${animName}`,
                { start: 0, end: 6 }
            ),
            frameRate: 10
        });
    }

    private createDirectionalAnimations(animName: string) {
        DIRECTION.dir8Texts().forEach(direction => {
            this.anims.create({
                key: `${SPRITE_KEY_PREFIX}_${animName}_${direction}`,
                frames: this.anims.generateFrameNumbers(
                    `${SPRITE_KEY_PREFIX}_${animName}_${direction}`,
                    { start: 0, end: 6 }
                ),
                frameRate: 10
            });
        });
    }
}