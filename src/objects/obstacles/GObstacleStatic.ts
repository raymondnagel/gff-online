import 'phaser';
import { GFF } from '../../main';
import { GSceneryDef } from '../../types';

export abstract class GObstacleStatic extends Phaser.Physics.Arcade.Image {

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
        this.setCollideWorldBounds(true);

        // Add to the scene as an obstacle:
        GFF.AdventureContent.addObstacle(this);
    }

    public toString() {
        return this.sceneryDef.key;
    }
}