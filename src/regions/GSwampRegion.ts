import { RANDOM } from "../random";
import { GRoom } from "../GRoom";
import { SCENERY } from "../scenery";
import { Dir9, GRect, GSceneryDef } from "../types";
import { GOutsideRegion } from "./GOutsideRegion";

const STOCK_REGIONS = [
    { name: 'Siddim', adjective: 'Siddimite' },
    { name: 'Zoan', adjective: 'Zoanite' },
    { name: 'Shittim', adjective: 'Shittimite' },
    { name: 'Zered', adjective: 'Zeredite' },
    { name: 'Jordan', adjective: 'Jordanite' },
    { name: 'Hinnom', adjective: 'Hinnomite' },
    { name: 'Sukkoth', adjective: 'Sukkothite' },
    { name: 'Aroer', adjective: 'Aroerite' },
    { name: 'Besor', adjective: 'Besorite' },
    { name: 'Gihon', adjective: 'Gihonite' },
];

export class GSwampRegion extends GOutsideRegion{

    constructor() {
        super(
            'swamp',
            'swamp_bg',
            'swamp_enc_bg',
            'map_swamp'
        );
    }

    protected getGenericNounForName(): string {
        return RANDOM.randElement([
            'Swamp',
            'Marsh',
            'Bog',
            'Fens',
            'Mire',
            'Wetlands',
            'Reeds',
            'Slough',
            'Quagmire',
        ]);
    }

    protected getStockRegionName(): string {
        return RANDOM.randElement(STOCK_REGIONS).name;
    }
    protected getStockRegionAdjective(): string {
        return RANDOM.randElement(STOCK_REGIONS).adjective;
    }

    public getWalls(): Record<Dir9, GSceneryDef|null> {
        return {
            [Dir9.N]: SCENERY.def('swamp_wall_n'),
            [Dir9.E]: SCENERY.def('swamp_wall_e'),
            [Dir9.S]: SCENERY.def('swamp_wall_s'),
            [Dir9.W]: SCENERY.def('swamp_wall_w'),
            [Dir9.NE]: SCENERY.def('swamp_wall_ne'),
            [Dir9.SE]: SCENERY.def('swamp_wall_se'),
            [Dir9.SW]: SCENERY.def('swamp_wall_sw'),
            [Dir9.NW]: SCENERY.def('swamp_wall_nw'),
            [Dir9.NONE]: null,
        };
    }

    public getTemperature(): number {
        return RANDOM.randInt(20, 30); // Swamps are generally warm and humid.
    }

    protected _furnishRoom(room: GRoom, partialWalls: boolean = true, internalObjects: boolean = true) {
        // Essential objects, like shrines and entrances, should be placed first.

        // Get a zone to use:
        const zoneRects: GRect[] = SCENERY.getRandomSceneryZoneTemplate();

        // Start with no object bounds;
        // we'll append to this as scenery is planned, ensuring that scenery doesn't overlap
        const objectBounds: GRect[] = [];

        // Call methods to add any quantity of any desired scenery:

        // Walls:
        if (partialWalls) {
            room.planPartialWallScenery([
                SCENERY.def('cypress_tree'),
                SCENERY.def('willow_tree'),
                SCENERY.def('palm_tree'),
                SCENERY.def('wonky_tree'),
                SCENERY.def('shrub'),
                SCENERY.def('bush'),
                SCENERY.def('boulder')
            ]);
        }

        if (internalObjects) {
            // Cattails: 100% chance to add 10-20;
            room.planSceneryChanceForBatch(SCENERY.def('cattails'), 1, 10, 20, objectBounds);
            // Mushrooms: 50% chance to add 1-5;
            room.planSceneryChanceForBatch(SCENERY.def('mushrooms'), .5, 1, 5, objectBounds);

            // Cypress Trees: 20% chance to add 1-4
            room.planSceneryChanceForBatch(SCENERY.def('cypress_tree'), .2, 1, 4, objectBounds, zoneRects);
            // Willow Trees: 20% chance to add 1-4
            room.planSceneryChanceForBatch(SCENERY.def('willow_tree'), .2, 1, 4, objectBounds, zoneRects);
            // Palm Trees: 20% chance to add 1-2
            room.planSceneryChanceForBatch(SCENERY.def('palm_tree'), .2, 1, 2, objectBounds, zoneRects);
            // Wonky Trees: 20% chance to add 1-4
            room.planSceneryChanceForBatch(SCENERY.def('wonky_tree'), .2, 1, 4, objectBounds, zoneRects);
            // Boulders: 10% chance each to add up to 3
            room.planSceneryChanceForEach(SCENERY.def('boulder'), .1, 3, objectBounds, zoneRects);
        }
    }
}
