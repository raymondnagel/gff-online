import { DEPTH } from "../../../depths";
import { GFF } from "../../../main";
import { GSceneryDef } from "../../../types";

export class GWallSW extends Phaser.GameObjects.Image {

    constructor(wallDef: GSceneryDef) {
        super(
            GFF.AdventureContent,
            GFF.LEFT_BOUND,
            GFF.BOTTOM_BOUND,
            wallDef.key
        );
        this.setOrigin(0, 1);
        GFF.AdventureContent.add.existing(this);
        this.setDepth(DEPTH.WALL_S_CORNER);
    }
}