import { GRoom } from "../GRoom";
import { RANDOM } from "../random";
import { SCENERY } from "../scenery";
import { Dir9, GRect, GSceneryDef } from "../types";
import { GOutsideRegion, GParkNaturalSceneryContext, GYardScenery } from "./GOutsideRegion";

const STOCK_REGIONS = [
    { name: 'Golan', adjective: 'Golanite' },
    { name: 'Hermon', adjective: 'Hermonian' },
    { name: 'Abarim', adjective: 'Abarimite' },
    { name: 'Carmel', adjective: 'Carmelite' },
    { name: 'Sinai', adjective: 'Sinaitic' },
    { name: 'Ephraim', adjective: 'Ephraimite' },
    { name: 'Seir', adjective: 'Seirite' },
    { name: 'Hor', adjective: 'Horite' },
    { name: 'Moriah', adjective: 'Moriahite' },
    { name: 'Ararat', adjective: 'Araratian' },
    { name: 'Gerizim', adjective: 'Gerizimite' },
    { name: 'Ebal', adjective: 'Ebalite' },
];

export class GMountRegion extends GOutsideRegion{

    constructor() {
        super(
            'mountains',
            'mount_bg',
            'mount_enc_bg',
            'map_mountain'
        );
    }

    protected getGenericNounForName(): string {
        return RANDOM.randElement([
            'Mountains',
            'Highlands',
            'Heights',
            'Range',
            'Peaks',
            'Ridges',
            'Cliffs',
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
            [Dir9.N]: SCENERY.def('mount_wall_n'),
            [Dir9.E]: SCENERY.def('mount_wall_e'),
            [Dir9.S]: SCENERY.def('mount_wall_s'),
            [Dir9.W]: SCENERY.def('mount_wall_w'),
            [Dir9.NE]: SCENERY.def('mount_wall_ne'),
            [Dir9.SE]: SCENERY.def('mount_wall_se'),
            [Dir9.SW]: SCENERY.def('mount_wall_sw'),
            [Dir9.NW]: SCENERY.def('mount_wall_nw'),
            [Dir9.NONE]: null,
        };
    }

    public getTemperature(): number {
        return RANDOM.randInt(-10, 10); // Mountains are cold, especially at higher elevations.
    }

    public getYardScenery(): GYardScenery {
        return {
            border: ['bush', 'shrub', 'boulder', 'small_pine'],
            adjacent: [],
            middle: ['swimming_pool', 'clothesline', 'small_pine', 'crag', 'camp_tent'],
            edge: ['bush', 'shrub', 'boulder', 'small_pine'],
        };
    }

    public addNaturalParkScenery(context: GParkNaturalSceneryContext): void {
        this.addParkEdgeScenery(context, ['small_pine', 'boulder', 'bush', 'shrub'], 1, 6, 9);
        this.addParkCornerScenery(context, ['crag', 'small_pine'], .65, 1, 3);
        this.addParkSparseScenery(context, ['flower_patch_1', 'flower_patch_2'], .35, 1, 3);
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
                SCENERY.def('boulder'),
                SCENERY.def('small_pine')
            ]);
        }

        if (internalObjects) {
            // Mountain scene type:
            switch (RANDOM.randInt(1, 7)) {
                case 1:
                case 2:
                case 3:
                    // Peaks are HUGE - only place one if the room doesn't have a special feature, since we will ignore zones for this.
                    if (!room.hasSpecialFeature()) {
                        // Mountain Peak:
                        // Peak: 100% chance to add 1 (in a custom center zone)
                        room.planSceneryChanceForEach(SCENERY.def('peak'), 1.0, 1, objectBounds, SCENERY.getSceneryZoneTemplate('center'));
                    }
                    break;
                case 4:
                case 5:
                case 6:
                    // Craggy Mountains:
                    // Crag: 100% chance to add 3-4
                    room.planSceneryChanceForBatch(SCENERY.def('crag'), 1.0, 3, 4, objectBounds, SCENERY.getSceneryZoneTemplate('widecenter'));
                    break;
                case 7:
                    // Volcanic Area:
                    // Volcano: 100% chance to add 1-3
                    room.planSceneryChanceForBatch(SCENERY.def('volcano'), 1.0, 1, 3, objectBounds, SCENERY.getSceneryZoneTemplate('widecenter'));
                    // Lava Crack: 100% chance to add 2-4
                    room.planSceneryChanceForBatch(SCENERY.def('lava_crack'), 1.0, 2, 4, objectBounds);
                    break;
            }

            // Crag: 100% chance to add 2-4
            room.planSceneryChanceForBatch(SCENERY.def('crag'), 1.0, 2, 4, objectBounds, zoneRects);
            // Small Pine: 50% chance to add 2-5
            room.planSceneryChanceForBatch(SCENERY.def('small_pine'), 0.5, 2, 8, objectBounds, zoneRects);
            // Earthy Pit: 15% chance each to add 1-2
            room.planSceneryChanceForEach(SCENERY.def('earthy_pit'), .15, 2, objectBounds, zoneRects);
            // Campfire: 10% chance each to add 1
            room.planSceneryChanceForEach(SCENERY.def('campfire'), .1, 1, objectBounds, zoneRects);
            // Boulders: 30% chance to add 1-4
            room.planSceneryChanceForBatch(SCENERY.def('boulder'), .3, 1, 4, objectBounds, zoneRects);
            // Flower Patch 1: 15% chance to add 1-3;
            room.planSceneryChanceForBatch(SCENERY.def('flower_patch_1'), .15, 1, 3, objectBounds);
            // Flower Patch 2: 15% chance to add 1-3;
            room.planSceneryChanceForBatch(SCENERY.def('flower_patch_2'), .15, 1, 3, objectBounds);
        }
    }
}
