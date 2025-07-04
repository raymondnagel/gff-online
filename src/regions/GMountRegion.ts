import { GRoom } from "../GRoom";
import { RANDOM } from "../random";
import { SCENERY } from "../scenery";
import { Dir9, GRect, GSceneryDef } from "../types";
import { GOutsideRegion } from "./GOutsideRegion";

const WALLS: Record<Dir9, GSceneryDef|null> = {
    [Dir9.N]: SCENERY.MOUNT_WALL_N_DEF,
    [Dir9.E]: SCENERY.MOUNT_WALL_E_DEF,
    [Dir9.S]: SCENERY.MOUNT_WALL_S_DEF,
    [Dir9.W]: SCENERY.MOUNT_WALL_W_DEF,
    [Dir9.NE]: SCENERY.MOUNT_WALL_NE_DEF,
    [Dir9.SE]: SCENERY.MOUNT_WALL_SE_DEF,
    [Dir9.SW]: SCENERY.MOUNT_WALL_SW_DEF,
    [Dir9.NW]: SCENERY.MOUNT_WALL_NW_DEF,
    [Dir9.NONE]: null,
};

export class GMountRegion extends GOutsideRegion{

    constructor(){
        super(
            'Mountain',
            'mount_bg',
            'mount_enc_bg',
            'map_mountain'
        );
    }

    public getWalls(): Record<Dir9, GSceneryDef|null> {
        return WALLS;
    }

    public getTemperature(): number {
        return RANDOM.randInt(-10, 10); // Mountains are cold, especially at higher elevations.
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
            SCENERY.def('boulder'),
            SCENERY.def('pine_tree')
        ]);

        // Peak: 100% chance to add 1-7
        room.planSceneryChanceForBatch(SCENERY.def('peak'), 1.0, 1, 7, objectBounds, zoneRects);
    }
}
