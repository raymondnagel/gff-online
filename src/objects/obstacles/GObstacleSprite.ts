import 'phaser';
import { GAdventureContent } from '../../scenes/GAdventureContent';
import { GSceneryDef } from '../../types';
import { GFF } from '../../main';

/**
 * This class should be used directly, since obstacles have no real features
 * or functionality apart from the common physics provided in this class.
 * The only diversification is in arguments provided to the constructor.
 */
export class GObstacleSprite extends Phaser.Physics.Arcade.Sprite {

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

        // Configure physical properites:
        GFF.AdventureContent.physics.add.existing(this);
        if (this.body !== null) {
            this.body.setSize(sceneryDef.body.width, sceneryDef.body.height);
            this.body.setOffset(sceneryDef.body.x, sceneryDef.body.y);
            this.body.immovable = true;
            this.body.updateFromGameObject();
            this.setDepth(this.body.y + this.body.height);
        }

        // Add to the scene as an obstacle:
        GFF.AdventureContent.addObstacle(this);

        // Create animation:
        this.createSingleAnimation(this.sceneryDef.key, frames, frameRate);
        this.play(this.sceneryDef.key);
    }

    public getBody(): Phaser.Physics.Arcade.Body {
        return this.body as Phaser.Physics.Arcade.Body;
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