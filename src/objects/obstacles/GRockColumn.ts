import { SCENERY } from "../../scenery";
import { GObstacleStatic } from "./GObstacleStatic";

export class GRockColumn extends GObstacleStatic{

    constructor(x: number, y: number) {
        super(
            SCENERY.ROCK_COLUMN_DEF,
            x,
            y
        );
    }
}