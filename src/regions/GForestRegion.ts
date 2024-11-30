import { GRandom } from "../GRandom";
import { GRoom } from "../GRoom";
import { SCENERY } from "../scenery";
import { Dir9, GRect, GSceneryDef } from "../types";
import { GOutsideRegion } from "./GOutsideRegion";

const WALLS: Record<Dir9, GSceneryDef|null> = {
    [Dir9.N]: SCENERY.FOREST_WALL_N_DEF,
    [Dir9.E]: SCENERY.FOREST_WALL_E_DEF,
    [Dir9.S]: SCENERY.FOREST_WALL_S_DEF,
    [Dir9.W]: SCENERY.FOREST_WALL_W_DEF,
    [Dir9.NE]: SCENERY.FOREST_WALL_NE_DEF,
    [Dir9.SE]: SCENERY.FOREST_WALL_SE_DEF,
    [Dir9.SW]: SCENERY.FOREST_WALL_SW_DEF,
    [Dir9.NW]: SCENERY.FOREST_WALL_NW_DEF,
    [Dir9.NONE]: null,
};

export class GForestRegion extends GOutsideRegion{

    constructor(){
        super(
            'Forest',
            'forest_bg',
            'forest_enc_bg',
            'map_forest'
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
            SCENERY.def('oak_tree'),
            SCENERY.def('pine_tree'),
            SCENERY.def('tree_stump'),
            SCENERY.def('bush'),
            SCENERY.def('shrub'),
            SCENERY.def('wonky_tree')
        ]);

        // Forest type:
        switch (GRandom.randInt(1, 3)) {
            case 1:
                // Oak Trees: 100% chance to add 10-20
                room.planSceneryChanceForBatch(SCENERY.def('oak_tree'), 1, 10, 20, objectBounds, zoneRects);
                break;
            case 2:
                // Pine Trees: 100% chance to add 10-20
                room.planSceneryChanceForBatch(SCENERY.def('pine_tree'), 1, 10, 20, objectBounds, zoneRects);
                break;
            case 3:
                // Oak Trees: 100% chance to add 5-10
                room.planSceneryChanceForBatch(SCENERY.def('oak_tree'), 1, 5, 10, objectBounds, zoneRects);
                // Pine Trees: 100% chance to add 5-10
                room.planSceneryChanceForBatch(SCENERY.def('pine_tree'), 1, 5, 10, objectBounds, zoneRects);
                break;
        }

        // Wonky Trees: 20% chance each to add up to 3
        room.planSceneryChanceForEach(SCENERY.def('wonky_tree'), .2, 3, objectBounds, zoneRects);
        // Tree Stumps: 30% chance each to add up to 3
        room.planSceneryChanceForBatch(SCENERY.def('tree_stump'), .3, 1, 3, objectBounds, zoneRects);
        // Boulders: 10% chance each to add up to 3
        room.planSceneryChanceForEach(SCENERY.def('boulder'), .2, 3, objectBounds, zoneRects);
        // Campfire: 10% chance each to add 1
        room.planSceneryChanceForEach(SCENERY.def('campfire'), .1, 1, objectBounds, zoneRects);
    }
}
