import 'phaser';
import { GAdventureContent } from '../../scenes/GAdventureContent';

export abstract class GObstacleSprite extends Phaser.Physics.Arcade.Sprite {

    private spriteKey: string;

    constructor(
        scene: GAdventureContent,
        spriteKey: string,
        frames: number,
        frameRate: number,
        x: number,
        y: number,
        bodyOffsetX: number,
        bodyOffsetY: number,
        bodyWidth: number,
        bodyHeight: number
    ) {
        super(scene, x, y, spriteKey);
        this.spriteKey = spriteKey;
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
            this.setDepth(this.body.y + this.body.height);
        }
        this.setCollideWorldBounds(true);

        // Add to the scene as an obstacle:
        scene.addObstacle(this);

        // Create animation:
        this.createSingleAnimation(spriteKey, frames, frameRate);
        this.play(spriteKey);
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
        return this.spriteKey;
    }
}