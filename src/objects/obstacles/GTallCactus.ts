import { SCENERY } from "../../scenery";
import { GObstacleStatic } from "./GObstacleStatic";

export class GTallCactus extends GObstacleStatic{

    constructor(x: number, y: number) {
        super(
            SCENERY.TALL_CACTUS_DEF,
            x,
            y
        );
    }
}