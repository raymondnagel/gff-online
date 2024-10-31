import { GFF } from "../../../main";
import { GSceneryDef } from "../../../types";

export class GWallSE extends Phaser.GameObjects.Image {

    constructor(wallDef: GSceneryDef) {
        super(
            GFF.AdventureContent,
            GFF.RIGHT_BOUND,
            GFF.BOTTOM_BOUND,
            wallDef.key
        );
        this.setOrigin(1, 1);
        GFF.AdventureContent.add.existing(this);
        this.setDepth(1000);
    }
}