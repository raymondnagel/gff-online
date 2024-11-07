import { GFF } from "../../../main";
import { GSceneryDef } from "../../../types";
import { GObstacleStatic } from "../GObstacleStatic";

export class GWallWest extends GObstacleStatic{

    constructor(wallDef: GSceneryDef) {
        super(
            wallDef,
            GFF.LEFT_BOUND,
            GFF.TOP_BOUND
        );
        this.setDepth(1);
    }
}