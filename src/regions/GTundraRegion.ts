import { RANDOM } from "../random";
import { GRoom } from "../GRoom";
import { SCENERY } from "../scenery";
import { Dir9, GRect, GSceneryDef } from "../types";
import { GOutsideRegion } from "./GOutsideRegion";

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
        return {
            [Dir9.N]: SCENERY.def('tundra_wall_n'),
            [Dir9.E]: SCENERY.def('tundra_wall_e'),
            [Dir9.S]: SCENERY.def('tundra_wall_s'),
            [Dir9.W]: SCENERY.def('tundra_wall_w'),
            [Dir9.NE]: SCENERY.def('tundra_wall_ne'),
            [Dir9.SE]: SCENERY.def('tundra_wall_se'),
            [Dir9.SW]: SCENERY.def('tundra_wall_sw'),
            [Dir9.NW]: SCENERY.def('tundra_wall_nw'),
            [Dir9.NONE]: null,
        };
    }

    public getTemperature(): number {
        return RANDOM.randInt(-20, 0); // Tundras are cold, often below freezing.
    }

    protected _furnishRoom(room: GRoom) {
        // If room contains a stronghold, we don't want to add random scenery
        if (room.getStronghold() !== null) {
            return;
        }

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
