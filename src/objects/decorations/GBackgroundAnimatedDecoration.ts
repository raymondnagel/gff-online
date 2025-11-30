import 'phaser';
import { GFF } from '../../main';
import { GSceneryDef } from '../../types';
import { DEPTH } from '../../depths';

/**
 * GBackgroundAnimatedDecoration is the animated version of GBackgroundDecoration.
 * However, unlike GBackgroundDecoration, which is rendered to a RenderTexture,
 * GBackgroundAnimatedDecoration is a game object (Sprite) added to the scene,
 * containing its own animation. It exists in the background and has a static depth,
 * making it appear behind all characters and foreground decorations, and has no
 * physical body, so characters can walk "over" it.
 */
export class GBackgroundAnimatedDecoration extends Phaser.Physics.Arcade.Sprite {

    private sceneryDef: GSceneryDef;

    constructor(
        sceneryDef: GSceneryDef,
        x: number,
        y: number,
        frames: number,
        frameRate: number
    ) {
        super(GFF.AdventureContent, x, y, sceneryDef.key);
        this.sceneryDef = sceneryDef;
        this.setOrigin(0, 0);

        // Add to scene:
        GFF.AdventureContent.add.existing(this);

        // Set depth to standard for background sub-decorations.
        // Sometimes we'll want to animate something under background decor;
        // for example, water under a bridge.
        this.setDepth(DEPTH.BG_SUBDECOR);

        // Create animation:
        this.createSingleAnimation(this.sceneryDef.key, frames, frameRate);
        this.play(this.sceneryDef.key);
    }

    protected createSingleAnimation(spriteKey: string, frames: number, frameRate: number) {
        this.anims.create({
            key: spriteKey,
            frames: this.anims.generateFrameNumbers(
                spriteKey,
                { start: 0, end: frames - 1 }
            ),
            frameRate: frameRate,
            repeat: -1 // Infinite loop
        });
    }

    public toString() {
        return this.sceneryDef.key;
    }
}