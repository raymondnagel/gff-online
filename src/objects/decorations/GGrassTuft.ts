import { SCENERY } from "../../scenery";
import { GForegroundDecoration } from "./GForegroundDecoration";

export class GGrassTuft extends GForegroundDecoration{

    constructor(x: number, y: number) {
        super(
            SCENERY.GRASS_TUFT_DEF,
            x,
            y
        );
    }
}