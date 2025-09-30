import { SCENERY } from "../../scenery";
import { GObstacleStatic } from "./GObstacleStatic";

export class GChurchHouse extends GObstacleStatic {

    constructor(x: number, y: number) {
        super(SCENERY.def('church_front'), x, y);
        this.setOrigin(0, 0);
    }

}