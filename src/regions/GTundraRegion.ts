import { GRoom } from "../GRoom";
import { SCENERY } from "../scenery";
import { Dir9, GRect, GSceneryDef } from "../types";
import { GOutsideRegion } from "./GOutsideRegion";

const WALLS: Record<Dir9, GSceneryDef|null> = {
    [Dir9.N]: SCENERY.TUNDRA_WALL_N_DEF,
    [Dir9.E]: SCENERY.TUNDRA_WALL_E_DEF,
    [Dir9.S]: SCENERY.TUNDRA_WALL_S_DEF,
    [Dir9.W]: SCENERY.TUNDRA_WALL_W_DEF,
    [Dir9.NE]: SCENERY.TUNDRA_WALL_NE_DEF,
    [Dir9.SE]: SCENERY.TUNDRA_WALL_SE_DEF,
    [Dir9.SW]: SCENERY.TUNDRA_WALL_SW_DEF,
    [Dir9.NW]: SCENERY.TUNDRA_WALL_NW_DEF,
    [Dir9.NONE]: null,
};

export class GTundraRegion extends GOutsideRegion{

    constructor(){
        super(
            'Tundra',
            'tundra_bg',
            'tundra_enc_bg',
            'map_tundra'
        );
    }

    public getWalls(): Record<Dir9, GSceneryDef|null> {
        return WALLS;
    }

    protected _furnishRoom(room: GRoom) {
        // Essential objects, like shrines and entrances, should be placed first.

        // Get a zone to use:
        const zoneRects: GRect[] = SCENERY.getRandomSceneryZoneTemplate();

        // Start with no object bounds;
        // we'll append to this as scenery is planned, ensuring that scenery doesn't overlap
        const objectBounds: GRect[] = [];

        // Call methods to add any quantity of any desired scenery:

        // Walls:
        room.planPartialWallScenery([
            SCENERY.def('pine_tree'),
            SCENERY.def('tree_stump'),
            SCENERY.def('boulder')
        ]);
    }
}
