import { SCENERY } from "../../scenery";
import { GObstacleStatic } from "./GObstacleStatic";

export class GOakTree extends GObstacleStatic{

    constructor(x: number, y: number) {
        super(
            SCENERY.OAK_TREE_DEF,
            x,
            y
        );
    }
}