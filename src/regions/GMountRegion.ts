import { GRoom } from "../GRoom";
import { RANDOM } from "../random";
import { SCENERY } from "../scenery";
import { Dir9, GRect, GSceneryDef } from "../types";
import { GOutsideRegion } from "./GOutsideRegion";

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
                SCENERY.def('pine_tree')
            ]);
        }

        if (internalObjects) {
            // Peak: 100% chance to add 1-7
            room.planSceneryChanceForBatch(SCENERY.def('peak'), 1.0, 1, 7, objectBounds, zoneRects);
        }
    }
}
