import { GFF } from "../../../main";
import { GSceneryDef } from "../../../types";
import { GObstacleStatic } from "../GObstacleStatic";

export class GWallSouth extends GObstacleStatic{

    constructor(wallDef: GSceneryDef) {
        super(
            wallDef,
            GFF.LEFT_BOUND,
            GFF.BOTTOM_BOUND - 128
        );
    }
}