import { SCENERY } from "../../scenery";
import { GForegroundDecoration } from "./GForegroundDecoration";

export class GBigFlower extends GForegroundDecoration{

    constructor(x: number, y: number) {
        super(
            SCENERY.BIG_FLOWER_DEF,
            x,
            y
        );
    }
}