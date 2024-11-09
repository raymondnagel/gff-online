import 'phaser';
import { GFF } from '../../main';
import { GSceneryDef } from '../../types';

/**
 * GForegroundDecoration is a decoration as a game object.
 * It is added to the scene as an object, and is therefore sorted
 * by its bottom. Characters can move in front of or behind it,
 * rather than walking over the top of it like background decorations.
 *
 * The major difference between a foreground decoration and an obstacle
 * is that foreground decorations do not have a physical body, and they
 * don't obstruct movement.
 */
export class GForegroundDecoration extends Phaser.GameObjects.Image {

    private sceneryDef: GSceneryDef;

    constructor(
        sceneryDef: GSceneryDef,
        x: number,
        y: number
    ) {
        super(GFF.AdventureContent, x, y, sceneryDef.key);
        this.sceneryDef = sceneryDef;
        this.setOrigin(0, 0);

        // Add to scene:
        GFF.AdventureContent.add.existing(this);

        // Set depth to bottom:
        this.setDepth(this.y + this.height);
    }

    public toString() {
        return this.sceneryDef.key;
    }
}