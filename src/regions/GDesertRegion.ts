import { RANDOM } from "../random";
import { GRoom } from "../GRoom";
import { SCENERY } from "../scenery";
import { Dir9, GRect, GSceneryDef } from "../types";
import { GOutsideRegion } from "./GOutsideRegion";

const WALLS: Record<Dir9, GSceneryDef|null> = {
    [Dir9.N]: SCENERY.DESERT_WALL_N_DEF,
    [Dir9.E]: SCENERY.DESERT_WALL_E_DEF,
    [Dir9.S]: SCENERY.DESERT_WALL_S_DEF,
    [Dir9.W]: SCENERY.DESERT_WALL_W_DEF,
    [Dir9.NE]: SCENERY.DESERT_WALL_NE_DEF,
    [Dir9.SE]: SCENERY.DESERT_WALL_SE_DEF,
    [Dir9.SW]: SCENERY.DESERT_WALL_SW_DEF,
    [Dir9.NW]: SCENERY.DESERT_WALL_NW_DEF,
    [Dir9.NONE]: null,
};

export class GDesertRegion extends GOutsideRegion{

    constructor(){
        super(
            'Desert',
            'desert_bg',
            'desert_enc_bg',
            'map_desert'
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
            SCENERY.def('barrel_cactus'),
            SCENERY.def('paddle_cactus'),
            SCENERY.def('spines_rocks'),
            SCENERY.def('rock_column'),
            SCENERY.def('desert_boulder')
        ]);

        // Desert type:
        switch (RANDOM.randInt(1, 3)) {
            case 1:
                // Tall Cactus: 100% chance to add 1-3
                room.planSceneryChanceForBatch(SCENERY.def('tall_cactus'), 1.0, 1, 3, objectBounds, zoneRects);
                break;
            case 2:
                // Palm Trees: 100% chance to add 1-3
                room.planSceneryChanceForBatch(SCENERY.def('palm_tree'), 1.0, 1, 3, objectBounds, zoneRects);
                break;
            case 3:
                // Tall Cactus: 75% chance to add 1-3
                room.planSceneryChanceForBatch(SCENERY.def('tall_cactus'), .75, 1, 3, objectBounds, zoneRects);
                // Palm Trees: 75% chance to add 1-3
                room.planSceneryChanceForBatch(SCENERY.def('palm_tree'), .75, 1, 3, objectBounds, zoneRects);
                break;
        }

        // Barrel Cactus: 40% chance to add 1-2
        room.planSceneryChanceForBatch(SCENERY.def('barrel_cactus'), .4, 1, 2, objectBounds, zoneRects);

        // Paddle Cactus: 40% chance to add 1-2
        room.planSceneryChanceForBatch(SCENERY.def('paddle_cactus'), .4, 1, 2, objectBounds, zoneRects);

        // Spines/Rocks: 40% chance to add 1-3
        room.planSceneryChanceForBatch(SCENERY.def('spines_rocks'), .3, 1, 3, objectBounds, zoneRects);

        // Rock Column: 40% chance each to add up to 4
        room.planSceneryChanceForEach(SCENERY.def('rock_column'), .4, 4, objectBounds, zoneRects);

        // Desert Boulders: 30% chance to add 1-5
        room.planSceneryChanceForBatch(SCENERY.def('desert_boulder'), .3, 1, 5, objectBounds, zoneRects);

        // Steer Skull: 20% chance to add 1
        room.planSceneryChanceForEach(SCENERY.def('steer_skull'), .2, 1, objectBounds, zoneRects);
    }
}
