import { RANDOM } from "../random";
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
            SCENERY.def('snowy_pine_tree'),
            SCENERY.def('snowy_dead_tree'),
            SCENERY.def('snowy_tree_stump'),
            SCENERY.def('snowy_boulder')
        ]);

        // Forest type:
        switch (RANDOM.randInt(1, 3)) {
            case 1:
                // Dead Trees: 100% chance to add 1-5
                room.planSceneryChanceForBatch(SCENERY.def('snowy_dead_tree'), 1, 1, 5, objectBounds, zoneRects);
                break;
            case 2:
                // Pine Trees: 100% chance to add 1-5
                room.planSceneryChanceForBatch(SCENERY.def('snowy_pine_tree'), 1, 1, 5, objectBounds, zoneRects);
                break;
            case 3:
                // Dead Trees: 100% chance to add 1-3
                room.planSceneryChanceForBatch(SCENERY.def('snowy_dead_tree'), 1, 1, 3, objectBounds, zoneRects);
                // Pine Trees: 100% chance to add 1-3
                room.planSceneryChanceForBatch(SCENERY.def('snowy_pine_tree'), 1, 1, 3, objectBounds, zoneRects);
                break;
        }

        // Tree Stumps: 30% chance to add 1-3
        room.planSceneryChanceForBatch(SCENERY.def('snowy_tree_stump'), .3, 1, 3, objectBounds, zoneRects);
        // Pit: 20% chance each to add up to 3
        room.planSceneryChanceForEach(SCENERY.def('snowy_pit'), .2, 3, objectBounds, zoneRects);
        // Boulders: 20% chance each to add up to 3
        room.planSceneryChanceForEach(SCENERY.def('snowy_boulder'), .2, 3, objectBounds, zoneRects);
        // Snowman: 10% chance each to add up to 3
        room.planSceneryChanceForEach(SCENERY.def('snowman'), .1, 3, objectBounds, zoneRects);
        // Campfire: 10% chance each to add 1
        room.planSceneryChanceForEach(SCENERY.def('campfire'), .1, 1, objectBounds, zoneRects);
    }
}
