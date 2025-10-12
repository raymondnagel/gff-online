import 'phaser';
import { GFF } from '../../main';
import { GSceneryDef } from '../../types';
import { DEPTH } from '../../depths';

/**
 * GOverheadAnimatedDecoration is the animated version of GOverheadDecoration,
 * based on Sprite instead of Image.
 */
export class GOverheadAnimatedDecoration extends Phaser.Physics.Arcade.Sprite {

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

        // Set depth to standard for overhead decorations:
        this.setDepth(DEPTH.OH_DECOR);

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