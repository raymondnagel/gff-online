import 'phaser';
import { GFF } from '../../main';
import { GSceneryDef } from '../../types';
import { DEPTH } from '../../depths';

/**
 * GForegroundAnimatedDecoration is the animated version of GForegroundDecoration,
 * based on Sprite instead of Image. It is added to the scene as an object, and is
 * therefore sorted by its bottom. Characters can move in front of or behind it,
 * rather than walking over the top of it like background decorations.
 *
 * The major difference between a foreground decoration and an obstacle
 * is that foreground decorations do not have a physical body, and they
 * don't obstruct movement.
 *
 * Foreground decorations sometimes appear in front of the player,
 * and sometimes behind the player, depending on the player's
 * Y position.
 */
export class GForegroundAnimatedDecoration extends Phaser.Physics.Arcade.Sprite {

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

        // Set depth to bottom:
        this.setDepth(this.y + this.height);

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