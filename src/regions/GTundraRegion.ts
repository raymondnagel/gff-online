import { GRoom } from "../GRoom";
import { SCENERY } from "../scenery";
import { GRect } from "../types";
import { GRegion } from "./GRegion";

export class GTundraRegion extends GRegion{

    constructor(){
        super(
            'Tundra',
            'tundra_bg',
            'tundra_enc_bg',
            'map_tundra'
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
        room.planZonedScenery(SCENERY.BOULDER_DEF, 5, zoneRects, objectBounds);
    }
}
