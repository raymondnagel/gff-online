import { SCENERY } from "../../scenery";
import { GObstacleStatic } from "./GObstacleStatic";

export class GTreeStump extends GObstacleStatic{

    constructor(x: number, y: number) {
        super(
            SCENERY.TREE_STUMP_DEF,
            x,
            y
        );
    }
}