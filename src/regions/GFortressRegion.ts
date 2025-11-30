import { GRoom } from "../GRoom";
import { RANDOM } from "../random";
import { SCENERY } from "../scenery";
import { GStrongholdRegion } from "./GStrongholdRegion";

export class GFortressRegion extends GStrongholdRegion {

    protected _furnishRoom(room: GRoom): void {
        // Call the parent method for common stronghold furnishing:
        super._furnishRoom(room);

        // if (!room.hasSpecialFeature()) {
        //     // Add devil statues randomly:
        //     for (let i = 0; i < 5; i++) {
        //         const x = RANDOM.randInt(2, 13);
        //         const y = RANDOM.randInt(2, 8);
        //         room.planTileScenery('devil_statue', x, y);
        //     }
        // }
    }

    protected furnishEntranceRoom(room: GRoom): void {
        // First call the base method to place the entrance mat:
        super.furnishEntranceRoom(room);
        // Place the emblem of enmity in the center of the mat:
        room.planPositionedScenery(SCENERY.def('emblem_enmity'), 512, 576, .5, 1);
    }
}
