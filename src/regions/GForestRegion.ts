import { GRandom } from "../GRandom";
import { GRoom } from "../GRoom";
import { SCENERY } from "../scenery";
import { GRect } from "../types";
import { GOutsideRegion } from "./GOutsideRegion";

export class GForestRegion extends GOutsideRegion{

    constructor(){
        super(
            'Forest',
            'forest_bg',
            'forest_enc_bg',
            'map_forest'
        );
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
