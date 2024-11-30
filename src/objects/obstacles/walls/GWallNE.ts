import { DEPTH } from "../../../depths";
import { GFF } from "../../../main";
import { GSceneryDef } from "../../../types";

export class GWallNE extends Phaser.GameObjects.Image {

    constructor(wallDef: GSceneryDef) {
        super(
            GFF.AdventureContent,
            GFF.RIGHT_BOUND,
            GFF.TOP_BOUND,
            wallDef.key
        );
        this.setOrigin(1, 0);
        GFF.AdventureContent.add.existing(this);
        this.setDepth(DEPTH.WALL_N_CORNER);
    }
}