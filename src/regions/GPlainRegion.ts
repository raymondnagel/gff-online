import { GRandom } from "../GRandom";
import { GRoom } from "../GRoom";
import { SCENERY } from "../scenery";
import { GRect } from "../types";
import { GOutsideRegion } from "./GOutsideRegion";

export class GPlainRegion extends GOutsideRegion{

    constructor(){
        super(
            'Plain',
            'plain_bg',
            'plain_enc_bg',
            'map_plain'
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
            SCENERY.def('boulder'),
            SCENERY.def('tree_stump'),
            SCENERY.def('bush'),
            SCENERY.def('shrub'),
            SCENERY.def('wonky_tree')
        ]);

        // Grass Tuft: 100% chance to add 5-10;
        room.planSceneryChanceForBatch(SCENERY.def('grass_tuft'), 1, 5, 10, objectBounds);
        // Field Grass: 100% chance to add 5-10;
        room.planSceneryChanceForBatch(SCENERY.def('field_grass'), 1, 5, 10, objectBounds);

        // Flower Patch 1: 30% chance to add 1-5;
        room.planSceneryChanceForBatch(SCENERY.def('flower_patch_1'), .3, 1, 5, objectBounds);
        // Flower Patch 2: 30% chance to add 1-5;
        room.planSceneryChanceForBatch(SCENERY.def('flower_patch_2'), .3, 1, 5, objectBounds);
        // Big Flower: 30% chance to add 1-3;
        room.planSceneryChanceForBatch(SCENERY.def('big_flower'), .3, 1, 5, objectBounds);

        // Boulders: 20% chance to add 1-4
        room.planSceneryChanceForBatch(SCENERY.def('boulder'), .2, 1, 4, objectBounds, zoneRects);
        // Tree Stumps: 20% chance to add 1-4
        room.planSceneryChanceForBatch(SCENERY.def('tree_stump'), .2, 1, 4, objectBounds, zoneRects);
        // Bushes: 20% chance to add 1-4
        room.planSceneryChanceForBatch(SCENERY.def('bush'), .2, 1, 4, objectBounds, zoneRects);
        // Shrubs: 20% chance to add 1-4
        room.planSceneryChanceForBatch(SCENERY.def('shrub'), .2, 1, 4, objectBounds, zoneRects);

        // Occasionally add a tree or two:
        switch (GRandom.randInt(1, 3)) {
            case 1:
                // Oak Trees: 10% chance to add 1-2
                room.planSceneryChanceForBatch(SCENERY.def('oak_tree'), .2, 1, 2, objectBounds, zoneRects);
                break;
            case 2:
                // Pine Trees: 10% chance to add 1-2
                room.planSceneryChanceForBatch(SCENERY.def('pine_tree'), .2, 1, 2, objectBounds, zoneRects);
                break;
            case 3:
                // Wonky Trees: 10% chance to add 1-2
                room.planSceneryChanceForBatch(SCENERY.def('wonky_tree'), .2, 1, 2, objectBounds, zoneRects);
                break;
        }
    }
}
