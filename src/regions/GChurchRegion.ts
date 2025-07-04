import { GRoom } from "../GRoom";
import { RANDOM } from "../random";
import { SCENERY } from "../scenery";
import { Dir9, GSceneryDef } from "../types";
import { GInsideRegion } from "./GInsideRegion";

const WALLS: Record<Dir9, GSceneryDef|null> = {
    [Dir9.N]: SCENERY.CHURCH_WALL_N_DEF,
    [Dir9.E]: SCENERY.CHURCH_WALL_E_DEF,
    [Dir9.S]: SCENERY.CHURCH_WALL_S_DEF,
    [Dir9.W]: SCENERY.CHURCH_WALL_W_DEF,
    [Dir9.NE]: SCENERY.CHURCH_WALL_NE_DEF,
    [Dir9.SE]: SCENERY.CHURCH_WALL_SE_DEF,
    [Dir9.SW]: SCENERY.CHURCH_WALL_SW_DEF,
    [Dir9.NW]: SCENERY.CHURCH_WALL_NW_DEF,
    [Dir9.NONE]: null,
};

export class GChurchRegion extends GInsideRegion{

    constructor(){
        super(
            'Church',
            'church_bg',
            '', // No encounters ever happen in churches!
            'map_floor'
        );
    }

    public getWalls(): Record<Dir9, GSceneryDef|null> {
        return WALLS;
    }

    public getTemperature(): number {
        return 20; // Comfortable temperature for a church. It probably has AC on :)
    }

    protected _furnishRoom(room: GRoom) {
        // Churches are organized: no random scenery objects.
        room.planChurchInterior();
    }
}
