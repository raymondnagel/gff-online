import { GRoom } from "../GRoom";
import { SCENERY } from "../scenery";
import { GRect } from "../types";
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
            SCENERY.def('boulder'),
            SCENERY.def('pine_tree'),
            SCENERY.def('wonky_tree')
        ]);
    }
}
