import { GRandom } from "../GRandom";
import { GRoom } from "../GRoom";
import { SCENERY } from "../scenery";
import { GRect } from "../types";
import { GRegion } from "./GRegion";

export class GPlainRegion extends GRegion{

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

        // Pedestal: 50% chance to add 10-20;
        room.planSceneryChanceForBatch(SCENERY.SHRINE_PEDESTAL_DEF, .5, 10, 20, objectBounds);
        // Boulders: 20% chance to add 1-4
        room.planSceneryChanceForBatch(SCENERY.BOULDER_DEF, .2, 1, 4, objectBounds, zoneRects);
        // Oak Trees: 20% chance to add 1-2
        room.planSceneryChanceForBatch(SCENERY.OAK_TREE_DEF, .2, 1, 2, objectBounds, zoneRects);
        // Pine Trees: 20% chance to add 1-2
        room.planSceneryChanceForBatch(SCENERY.PINE_TREE_DEF, .2, 1, 2, objectBounds, zoneRects);
    }
}
