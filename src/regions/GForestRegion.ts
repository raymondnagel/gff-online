import { GRandom } from "../GRandom";
import { GRoom } from "../GRoom";
import { SCENERY } from "../scenery";
import { GRect } from "../types";
import { GRegion } from "./GRegion";

export class GForestRegion extends GRegion{

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

        // Boulders: 10% chance each to add up to 3
        room.planSceneryChanceForEach(SCENERY.BOULDER_DEF, .2, 3, objectBounds, zoneRects);

        // Forest type:
        switch (GRandom.randInt(1, 3)) {
            case 1:
                // Oak Trees: 100% chance to add 6-10
                room.planSceneryChanceForBatch(SCENERY.OAK_TREE_DEF, 1, 6, 10, objectBounds, zoneRects);
                break;
            case 2:
                // Pine Trees: 100% chance to add 6-10
                room.planSceneryChanceForBatch(SCENERY.PINE_TREE_DEF, 1, 6, 10, objectBounds, zoneRects);
                break;
            case 3:
                // Oak Trees: 100% chance to add 3-5
                room.planSceneryChanceForBatch(SCENERY.OAK_TREE_DEF, 1, 3, 5, objectBounds, zoneRects);
                // Pine Trees: 100% chance to add 3-5
                room.planSceneryChanceForBatch(SCENERY.PINE_TREE_DEF, 1, 3, 5, objectBounds, zoneRects);
                break;
        }
    }
}
