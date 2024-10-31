import { SCENERY } from "../../scenery";
import { GForegroundDecoration } from "./GForegroundDecoration";

export class GFieldGrass extends GForegroundDecoration{

    constructor(x: number, y: number) {
        super(
            SCENERY.FIELD_GRASS_DEF,
            x,
            y
        );
    }
}