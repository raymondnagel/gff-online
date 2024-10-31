import { GRoom } from "../GRoom";
import { SCENERY } from "../scenery";
import { GRect } from "../types";
import { GOutsideRegion } from "./GOutsideRegion";

export class GDesertRegion extends GOutsideRegion{

    constructor(){
        super(
            'Desert',
            'desert_bg',
            'desert_enc_bg',
            'map_desert'
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

        // Tall Cactus: 40% chance to add 1-3
        room.planSceneryChanceForBatch(SCENERY.TALL_CACTUS_DEF, .4, 1, 3, objectBounds, zoneRects);

        // Barrel Cactus: 40% chance to add 1-2
        room.planSceneryChanceForBatch(SCENERY.BARREL_CACTUS_DEF, .4, 1, 2, objectBounds, zoneRects);

        // Paddle Cactus: 40% chance to add 1-2
        room.planSceneryChanceForBatch(SCENERY.PADDLE_CACTUS_DEF, .4, 1, 2, objectBounds, zoneRects);

        // Spines/Rocks: 40% chance to add 1-3
        room.planSceneryChanceForBatch(SCENERY.SPINES_ROCKS_DEF, .3, 1, 3, objectBounds, zoneRects);

        // Rock Column: 40% chance each to add up to 4
        room.planSceneryChanceForEach(SCENERY.ROCK_COLUMN_DEF, .4, 4, objectBounds, zoneRects);

        // Desert Boulders: 30% chance to add 1-5
        room.planSceneryChanceForBatch(SCENERY.DESERT_BOULDER_DEF, .3, 1, 5, objectBounds, zoneRects);

        // Steer Skull: 20% chance to add 1
        room.planSceneryChanceForEach(SCENERY.STEER_SKULL_DEF, .2, 1, objectBounds, zoneRects);
    }
}
