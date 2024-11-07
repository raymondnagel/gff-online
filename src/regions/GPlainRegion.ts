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

        room.planPartialWallScenery([
            SCENERY.BOULDER_DEF,
            SCENERY.TREE_STUMP_DEF,
            SCENERY.OAK_TREE_DEF,
            SCENERY.PINE_TREE_DEF,
            SCENERY.WONKY_TREE_DEF
        ]);

        // Grass Tuft: 100% chance to add 5-10;
        room.planSceneryChanceForBatch(SCENERY.GRASS_TUFT_DEF, 1, 5, 10, objectBounds);
        // Field Grass: 100% chance to add 5-10;
        room.planSceneryChanceForBatch(SCENERY.FIELD_GRASS_DEF, 1, 5, 10, objectBounds);

        // Flower Patch 1: 30% chance to add 1-5;
        room.planSceneryChanceForBatch(SCENERY.FLOWER_PATCH_1_DEF, .3, 1, 5, objectBounds);
        // Flower Patch 2: 30% chance to add 1-5;
        room.planSceneryChanceForBatch(SCENERY.FLOWER_PATCH_2_DEF, .3, 1, 5, objectBounds);
        // Big Flower: 30% chance to add 1-3;
        room.planSceneryChanceForBatch(SCENERY.BIG_FLOWER_DEF, .3, 1, 5, objectBounds);

        // Boulders: 20% chance to add 1-4
        room.planSceneryChanceForBatch(SCENERY.BOULDER_DEF, .2, 1, 4, objectBounds, zoneRects);
        // Tree Stumps: 20% chance to add 1-4
        room.planSceneryChanceForBatch(SCENERY.TREE_STUMP_DEF, .2, 1, 4, objectBounds, zoneRects);

        // Occasionally add a tree or two:
        switch (GRandom.randInt(1, 3)) {
            case 1:
                // Oak Trees: 20% chance to add 1-2
                room.planSceneryChanceForBatch(SCENERY.OAK_TREE_DEF, .2, 1, 2, objectBounds, zoneRects);
                break;
            case 2:
                // Pine Trees: 20% chance to add 1-2
                room.planSceneryChanceForBatch(SCENERY.PINE_TREE_DEF, .2, 1, 2, objectBounds, zoneRects);
                break;
            case 3:
                // Wonky Trees: 20% chance to add 1-2
                room.planSceneryChanceForBatch(SCENERY.WONKY_TREE_DEF, .2, 1, 2, objectBounds, zoneRects);
                break;
        }
    }
}
