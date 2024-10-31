import { SCENERY } from "../../scenery";
import { GObstacleStatic } from "./GObstacleStatic";

export class GBarrelCactus extends GObstacleStatic{

    constructor(x: number, y: number) {
        super(
            SCENERY.BARREL_CACTUS_DEF,
            x,
            y
        );
    }
}