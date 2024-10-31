import { SCENERY } from "../../scenery";
import { GObstacleStatic } from "./GObstacleStatic";

export class GPaddleCactus extends GObstacleStatic{

    constructor(x: number, y: number) {
        super(
            SCENERY.PADDLE_CACTUS_DEF,
            x,
            y
        );
    }
}