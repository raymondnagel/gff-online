import 'phaser';
import { GFF } from '../../main';
import { GSceneryDef } from '../../types';

/**
 * This class should be used directly, since obstacles have no real features
 * or functionality apart from the common physics provided in this class.
 * The only diversification is in arguments provided to the constructor.
 */
export class GObstacleStatic extends Phaser.Physics.Arcade.Image {

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

        // Configure physical properites:
        GFF.AdventureContent.physics.add.existing(this);
        if (this.body !== null) {
            this.body.setSize(sceneryDef.body.width, sceneryDef.body.height);
            this.body.setOffset(sceneryDef.body.x, sceneryDef.body.y);
            this.body.immovable = true;
            this.body.updateFromGameObject();
            this.setDepth(this.body.bottom);
        }

        // Add to the scene as an obstacle:
        GFF.AdventureContent.addObstacle(this);
    }

    public toString() {
        return this.sceneryDef.key;
    }
}