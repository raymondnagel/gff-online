import 'phaser';
import { GFF } from '../../main';
import { GSceneryDef } from '../../types';
import { DEPTH } from '../../depths';

/**
 * GOverheadDecoration is a decoration as a game object.
 * It is added to the scene as an object, and is therefore sorted
 * by its bottom. It's like the opposite of a background decoration:
 * characters always appear behind (under) it.
 *
 * The difference between a foreground decoration and an overhead decoration
 * is that foreground decorations exist at the player's level, so they
 * can appear in front of or behind the player, depending on the player's
 * Y position. Overhead decorations always appear in front of the player,
 * because they are above the player's level.
 */
export class GOverheadDecoration extends Phaser.GameObjects.Image {

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

        // Set depth to standard for overhead decorations:
        this.setDepth(DEPTH.OH_DECOR);
    }

    public toString() {
        return this.sceneryDef.key;
    }
}