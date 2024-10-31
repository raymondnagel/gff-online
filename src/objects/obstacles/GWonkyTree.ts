import { SCENERY } from "../../scenery";
import { GObstacleStatic } from "./GObstacleStatic";

export class GWonkyTree extends GObstacleStatic{

    constructor(x: number, y: number) {
        super(
            SCENERY.WONKY_TREE_DEF,
            x,
            y
        );
    }
}