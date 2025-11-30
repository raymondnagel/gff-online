import { GRoom } from "../GRoom";
import { RANDOM } from "../random";
import { SCENERY } from "../scenery";
import { GStrongholdRegion } from "./GStrongholdRegion";

export class GDungeonRegion extends GStrongholdRegion {

    protected _furnishRoom(room: GRoom): void {
        // Call the parent method for common stronghold furnishing:
        super._furnishRoom(room);

        // For the Dungeon of Doubt, add some illusionary blocks if
        // the room already contains regular wall blocks:
        if (room.hasPlanKey('wall_block')) {
            // Add illusionary blocks randomly:
            for (let i = 5; i < 15; i++) {
                const x = RANDOM.randInt(2, 13);
                const y = RANDOM.randInt(2, 8);
                room.planTileScenery('illusionary_block', x, y);
            }
        }
    }

    protected furnishEntranceRoom(room: GRoom): void {
        // First call the base method to place the entrance mat:
        super.furnishEntranceRoom(room);
        // Place the emblem of doubt in the center of the mat:
        room.planPositionedScenery(SCENERY.def('emblem_doubt'), 512, 576, .5, 1);
    }
}
