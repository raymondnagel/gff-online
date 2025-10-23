import { GRoom } from "../GRoom";
import { RANDOM } from "../random";
import { GStrongholdRegion } from "./GStrongholdRegion";

export class GFortressRegion extends GStrongholdRegion {

    protected _furnishRoom(room: GRoom): void {
        // Call the parent method for common stronghold furnishing:
        super._furnishRoom(room);

        // Add devil statues randomly:
        for (let i = 0; i < 5; i++) {
            const x = RANDOM.randInt(1, 14);
            const y = RANDOM.randInt(1, 9);
            room.planTileScenery('devil_statue', x, y);
        }
    }
}
