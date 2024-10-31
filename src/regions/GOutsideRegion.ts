import { GDirection } from "../GDirection";
import { SCENERY } from "../scenery";
import { GSceneryDef } from "../types";
import { GRegion } from "./GRegion";

const WALLS: Record<GDirection.Dir9, GSceneryDef|null> = {
    [GDirection.Dir9.N]: SCENERY.ROCK_WALL_N_DEF,
    [GDirection.Dir9.E]: SCENERY.ROCK_WALL_E_DEF,
    [GDirection.Dir9.S]: SCENERY.ROCK_WALL_S_DEF,
    [GDirection.Dir9.W]: SCENERY.ROCK_WALL_W_DEF,
    [GDirection.Dir9.NE]: SCENERY.ROCK_WALL_NE_DEF,
    [GDirection.Dir9.SE]: SCENERY.ROCK_WALL_SE_DEF,
    [GDirection.Dir9.SW]: SCENERY.ROCK_WALL_SW_DEF,
    [GDirection.Dir9.NW]: SCENERY.ROCK_WALL_NW_DEF,
    [GDirection.Dir9.NONE]: null,
};

export abstract class GOutsideRegion extends GRegion{
    public getWalls(): Record<GDirection.Dir9, GSceneryDef|null> {
        return WALLS;
    }
}
