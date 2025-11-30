import { GRoom } from "../GRoom";
import { RANDOM } from "../random";
import { SCENERY } from "../scenery";
import { GStrongholdRegion } from "./GStrongholdRegion";

export class GTowerRegion extends GStrongholdRegion{

    protected furnishEntranceRoom(room: GRoom): void {
        // First call the base method to place the entrance mat:
        super.furnishEntranceRoom(room);
        // Place the emblem of deception in the center of the mat:
        room.planPositionedScenery(SCENERY.def('emblem_deception'), 512, 576, .5, 1);
    }

    protected furnishStairsRoom(room: GRoom, stairsKey: string): void {
        if (stairsKey === 'stairs_down') {
            super.furnishStairsRoom(room, stairsKey);
            return;
        }
        // Create 4 staircases that appear to go up; only one will actually go up,
        // and the others will be "false" staircases that take the player back down.
        const trueStairsIndex = RANDOM.randInt(0, 3);

        // Get scenery defs:
        const trueDef = SCENERY.def('stairs_up');
        // The false staircase uses the same graphics as the true one, but the key must be set for planning:
        const falseDef = structuredClone(trueDef);
        falseDef.key = 'stairs_up_false';

        // #1
        room.planPositionedScenery(trueStairsIndex === 0 ? trueDef : falseDef, 356, 276, .5, .5);
        // #2
        room.planPositionedScenery(trueStairsIndex === 1 ? trueDef : falseDef, 668, 276, .5, .5);
        // #3
        room.planPositionedScenery(trueStairsIndex === 2 ? trueDef : falseDef, 356, 428, .5, .5);
        // #4
        room.planPositionedScenery(trueStairsIndex === 3 ? trueDef : falseDef, 668, 428, .5, .5);
    }
}
