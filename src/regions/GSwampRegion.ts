import { GRandom } from "../GRandom";
import { GRoom } from "../GRoom";
import { SCENERY } from "../scenery";
import { Dir9, GRect, GSceneryDef } from "../types";
import { GOutsideRegion } from "./GOutsideRegion";

const WALLS: Record<Dir9, GSceneryDef|null> = {
    [Dir9.N]: SCENERY.SWAMP_WALL_N_DEF,
    [Dir9.E]: SCENERY.SWAMP_WALL_E_DEF,
    [Dir9.S]: SCENERY.SWAMP_WALL_S_DEF,
    [Dir9.W]: SCENERY.SWAMP_WALL_W_DEF,
    [Dir9.NE]: SCENERY.SWAMP_WALL_NE_DEF,
    [Dir9.SE]: SCENERY.SWAMP_WALL_SE_DEF,
    [Dir9.SW]: SCENERY.SWAMP_WALL_SW_DEF,
    [Dir9.NW]: SCENERY.SWAMP_WALL_NW_DEF,
    [Dir9.NONE]: null,
};

export class GSwampRegion extends GOutsideRegion{

    constructor(){
        super(
            'Swamp',
            'swamp_bg',
            'swamp_enc_bg',
            'map_swamp'
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
            SCENERY.def('cypress_tree'),
            SCENERY.def('willow_tree'),
            SCENERY.def('palm_tree'),
            SCENERY.def('wonky_tree'),
            SCENERY.def('shrub'),
            SCENERY.def('bush'),
            SCENERY.def('boulder')
        ]);

        // Cattails: 100% chance to add 10-20;
        room.planSceneryChanceForBatch(SCENERY.def('cattails'), 1, 10, 20, objectBounds);
        // Mushrooms: 50% chance to add 1-5;
        room.planSceneryChanceForBatch(SCENERY.def('mushrooms'), .5, 1, 5, objectBounds);

        // Cypress Trees: 20% chance to add 1-4
        room.planSceneryChanceForBatch(SCENERY.def('cypress_tree'), .2, 1, 4, objectBounds, zoneRects);
        // Willow Trees: 20% chance to add 1-4
        room.planSceneryChanceForBatch(SCENERY.def('willow_tree'), .2, 1, 4, objectBounds, zoneRects);
        // Palm Trees: 20% chance to add 1-2
        room.planSceneryChanceForBatch(SCENERY.def('palm_tree'), .2, 1, 2, objectBounds, zoneRects);
        // Wonky Trees: 20% chance to add 1-4
        room.planSceneryChanceForBatch(SCENERY.def('wonky_tree'), .2, 1, 4, objectBounds, zoneRects);
        // Boulders: 10% chance each to add up to 3
        room.planSceneryChanceForEach(SCENERY.def('boulder'), .1, 3, objectBounds, zoneRects);
    }
}
