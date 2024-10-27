import { SCENERY } from "../../scenery";
import { GAdventureContent } from "../../scenes/GAdventureContent";
import { GObstacleStatic } from "./GObstacleStatic";

export class GBoulder extends GObstacleStatic{

    constructor(x: number, y: number) {
        super(
            SCENERY.BOULDER_DEF,
            x,
            y
        );
    }
}