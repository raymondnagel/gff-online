import { GFF } from "../../main";
import { GSceneryDef } from "../../types";

export abstract class GTouchable extends Phaser.Physics.Arcade.Image {

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

        // Add to the scene as a touchable:
        GFF.AdventureContent.addTouchable(this);
    }

    public getBody(): Phaser.Physics.Arcade.Body {
        return this.body as Phaser.Physics.Arcade.Body;
    }

    public abstract canTouch(): boolean;

    public abstract doTouch(): void;

    public toString() {
        return this.sceneryDef.key;
    }
}