import { SCENERY } from "../../scenery";
import { GObstacleStatic } from "./GObstacleStatic";

export class GDesertBoulder extends GObstacleStatic{

    constructor(x: number, y: number) {
        super(
            SCENERY.DESERT_BOULDER_DEF,
            x,
            y
        );
    }
}