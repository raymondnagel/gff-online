import { DEPTH } from "../../../depths";
import { GFF } from "../../../main";
import { GSceneryDef } from "../../../types";
import { GForegroundDecoration } from "../../decorations/GForegroundDecoration";
import { GBuildingExit } from "../../touchables/GBuildingExit";
import { GObstacleStatic } from "../GObstacleStatic";

/**
 * A version of south wall, meant to be used inside building
 * interior regions where there is an exit to the world map.
 *
 * It consists of three sections; the left and right parts are
 * solid walls, while the middle part is a doorway.
 */
export class GWallSouthWithDoor{

    constructor(leftWallDef: GSceneryDef, rightWallDef: GSceneryDef, doorwayDef: GSceneryDef) {

        const leftWall: GObstacleStatic = new GObstacleStatic(leftWallDef, GFF.LEFT_BOUND, GFF.BOTTOM_BOUND);
        leftWall.setOrigin(0, 1);
        leftWall.setDepth(DEPTH.WALL_SOUTH);

        const rightWall: GObstacleStatic = new GObstacleStatic(rightWallDef, GFF.RIGHT_BOUND, GFF.BOTTOM_BOUND);
        rightWall.setOrigin(1, 1);
        rightWall.setDepth(DEPTH.WALL_SOUTH);

        const doorway: GForegroundDecoration = new GForegroundDecoration(doorwayDef, 483, GFF.BOTTOM_BOUND);
        doorway.setOrigin(0, 1);
        doorway.setDepth(DEPTH.WALL_SOUTH);

        const exit: GBuildingExit = new GBuildingExit(GFF.ROOM_X + (GFF.ROOM_W / 2) - 36, 703);
    }
}