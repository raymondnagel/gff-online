import { SCENERY } from "../../scenery";
import { GObstacleSprite } from "./GObstacleSprite";

export class GCampfire extends GObstacleSprite{

    constructor(x: number, y: number) {
        super(
            SCENERY.CAMPFIRE_DEF,
            x,
            y,
            7,
            10
        );
    }
}