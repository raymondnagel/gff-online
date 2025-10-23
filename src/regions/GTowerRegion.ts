import { GRoom } from "../GRoom";
import { RANDOM } from "../random";
import { SCENERY } from "../scenery";
import { GStrongholdRegion } from "./GStrongholdRegion";

export class GTowerRegion extends GStrongholdRegion{

    protected furnishStairsRoom(room: GRoom, stairsKey: string): void {
        if (stairsKey === 'stairs_down') {
            super.furnishStairsRoom(room, stairsKey);
            return;
        }
        // Create 4 staircases that appear to go up; only one will actually go up,
        // and the others will be "false" staircases that take the player back down.
        const trueStairsIndex = RANDOM.randInt(0, 3);

        // #1
        room.planPositionedScenery(SCENERY.def(trueStairsIndex === 0 ? 'stairs_up' : 'stairs_up_false'), 356, 276, .5, .5);
        // #2
        room.planPositionedScenery(SCENERY.def(trueStairsIndex === 1 ? 'stairs_up' : 'stairs_up_false'), 668, 276, .5, .5);
        // #3
        room.planPositionedScenery(SCENERY.def(trueStairsIndex === 2 ? 'stairs_up' : 'stairs_up_false'), 356, 428, .5, .5);
        // #4
        room.planPositionedScenery(SCENERY.def(trueStairsIndex === 3 ? 'stairs_up' : 'stairs_up_false'), 668, 428, .5, .5);
    }
}
