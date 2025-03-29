import { DEPTH } from "../../../depths";
import { GFF } from "../../../main";
import { GSceneryDef } from "../../../types";
import { GObstacleStatic } from "../GObstacleStatic";

/**
 * A version of south wall, meant to be used inside building
 * interior regions, only 64 pixels high instead of the standard 128.
 */
export class GWallSouthInside extends GObstacleStatic{

    constructor(wallDef: GSceneryDef) {
        super(
            wallDef,
            GFF.LEFT_BOUND,
            GFF.BOTTOM_BOUND - 64
        );
        this.setDepth(DEPTH.WALL_SOUTH);
    }
}