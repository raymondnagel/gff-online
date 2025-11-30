import { GRoom } from "../GRoom";
import { SCENERY } from "../scenery";
import { GStrongholdRegion } from "./GStrongholdRegion";

export class GKeepRegion extends GStrongholdRegion{

    protected furnishEntranceRoom(room: GRoom): void {
        // First call the base method to place the entrance mat:
        super.furnishEntranceRoom(room);
        // Place the emblem of wickedness in the center of the mat:
        room.planPositionedScenery(SCENERY.def('emblem_wickedness'), 512, 576, .5, 1);
    }
}
