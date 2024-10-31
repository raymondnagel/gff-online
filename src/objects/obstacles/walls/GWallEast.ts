import { GFF } from "../../../main";
import { GSceneryDef } from "../../../types";
import { GObstacleStatic } from "../GObstacleStatic";

export class GWallEast extends GObstacleStatic{

    constructor(wallDef: GSceneryDef) {
        super(
            wallDef,
            GFF.RIGHT_BOUND - wallDef.body.width,
            GFF.TOP_BOUND
        );
    }
}