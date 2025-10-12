import { RANDOM } from "../random";
import { GRoom } from "../GRoom";
import { SCENERY } from "../scenery";
import { Dir9, GRect, GSceneryDef } from "../types";
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

    public getWalls(): Record<Dir9, GSceneryDef|null> {
        return {
            [Dir9.N]: SCENERY.def('forest_wall_n'),
            [Dir9.E]: SCENERY.def('forest_wall_e'),
            [Dir9.S]: SCENERY.def('forest_wall_s'),
            [Dir9.W]: SCENERY.def('forest_wall_w'),
            [Dir9.NE]: SCENERY.def('forest_wall_ne'),
            [Dir9.SE]: SCENERY.def('forest_wall_se'),
            [Dir9.SW]: SCENERY.def('forest_wall_sw'),
            [Dir9.NW]: SCENERY.def('forest_wall_nw'),
            [Dir9.NONE]: null,
        };
    }

    public getTemperature(): number {
        return RANDOM.randInt(10, 20); // Forests are generally temperate and shaded.
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
            SCENERY.def('oak_tree'),
            SCENERY.def('pine_tree'),
            SCENERY.def('tree_stump'),
            SCENERY.def('bush'),
            SCENERY.def('shrub'),
            SCENERY.def('wonky_tree')
        ]);

        // Forest type:
        switch (RANDOM.randInt(1, 3)) {
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

        // Tree Stumps: 30% chance to add 1-3
        room.planSceneryChanceForBatch(SCENERY.def('tree_stump'), .3, 1, 3, objectBounds, zoneRects);
        // Wonky Trees: 20% chance each to add up to 3
        room.planSceneryChanceForEach(SCENERY.def('wonky_tree'), .2, 3, objectBounds, zoneRects);
        // Boulders: 20% chance each to add up to 3
        room.planSceneryChanceForEach(SCENERY.def('boulder'), .2, 3, objectBounds, zoneRects);
        // Campfire: 10% chance each to add 1
        room.planSceneryChanceForEach(SCENERY.def('campfire'), .1, 1, objectBounds, zoneRects);
    }
}
