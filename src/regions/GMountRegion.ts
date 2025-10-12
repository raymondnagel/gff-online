import { GRoom } from "../GRoom";
import { RANDOM } from "../random";
import { SCENERY } from "../scenery";
import { Dir9, GRect, GSceneryDef } from "../types";
import { GOutsideRegion } from "./GOutsideRegion";

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
