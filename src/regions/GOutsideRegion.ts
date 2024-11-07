import { GDirection } from "../GDirection";
import { SCENERY } from "../scenery";
import { Dir9, GSceneryDef } from "../types";
import { GRegion } from "./GRegion";

const WALLS: Record<Dir9, GSceneryDef|null> = {
    [Dir9.N]: SCENERY.ROCK_WALL_N_DEF,
    [Dir9.E]: SCENERY.ROCK_WALL_E_DEF,
    [Dir9.S]: SCENERY.ROCK_WALL_S_DEF,
    [Dir9.W]: SCENERY.ROCK_WALL_W_DEF,
    [Dir9.NE]: SCENERY.ROCK_WALL_NE_DEF,
    [Dir9.SE]: SCENERY.ROCK_WALL_SE_DEF,
    [Dir9.SW]: SCENERY.ROCK_WALL_SW_DEF,
    [Dir9.NW]: SCENERY.ROCK_WALL_NW_DEF,
    [Dir9.NONE]: null,
};

export abstract class GOutsideRegion extends GRegion{
    public getWalls(): Record<Dir9, GSceneryDef|null> {
        return WALLS;
    }
}
