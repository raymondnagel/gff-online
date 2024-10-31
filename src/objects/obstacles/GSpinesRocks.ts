import { SCENERY } from "../../scenery";
import { GObstacleStatic } from "./GObstacleStatic";

export class GSpinesRocks extends GObstacleStatic{

    constructor(x: number, y: number) {
        super(
            SCENERY.SPINES_ROCKS_DEF,
            x,
            y
        );
    }
}