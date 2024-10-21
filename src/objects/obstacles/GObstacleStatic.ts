import 'phaser';
import { GAdventureContent } from '../../scenes/GAdventureContent';

export abstract class GObstacleStatic extends Phaser.Physics.Arcade.Image {

    private imageKey: string;

    constructor(
        scene: GAdventureContent,
        imageKey: string,
        x: number,
        y: number,
        bodyOffsetX: number,
        bodyOffsetY: number,
        bodyWidth: number,
        bodyHeight: number
    ) {
        super(scene, x, y, imageKey);
        this.imageKey = imageKey;
        this.setOrigin(0, 0);

        // Add to scene:
        scene.add.existing(this);

        // Configure physical properites:
        scene.physics.add.existing(this);
        if (this.body !== null) {
            this.body.setSize(bodyWidth, bodyHeight);
            this.body.setOffset(bodyOffsetX, bodyOffsetY);
            this.body.immovable = true;
            this.body.updateFromGameObject();
            this.setDepth(this.body.bottom);
        }
        this.setCollideWorldBounds(true);

        // Add to the scene as an obstacle:
        scene.addObstacle(this);
    }

    public toString() {
        return this.imageKey;
    }
}