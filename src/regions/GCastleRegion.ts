import { GRoom } from "../GRoom";
import { SCENERY } from "../scenery";
import { GStrongholdRegion } from "./GStrongholdRegion";

export class GCastleRegion extends GStrongholdRegion{

    protected furnishEntranceRoom(room: GRoom): void {
        // First call the base method to place the entrance mat:
        super.furnishEntranceRoom(room);
        // Place the emblem of perdition in the center of the mat:
        room.planPositionedScenery(SCENERY.def('emblem_perdition'), 512, 576, .5, 1);
    }
}
