import { GChurchArea } from "./areas/GChurchArea";
import { GStrongholdArea } from "./areas/GStrongholdArea";
import { GWorldArea } from "./areas/GWorldArea";
import { DIRECTION } from "./direction";
import { GRoom } from "./GRoom";
import { GPoint2D } from "./types";

export namespace AREA {
    export let WORLD_AREA: GWorldArea;
    export let CHURCH_AREAS: GChurchArea[];
    export let TOWER_AREA: GStrongholdArea;
    export let DUNGEON_AREA: GStrongholdArea;
    export let KEEP_AREA: GStrongholdArea;
    export let FORTRESS_AREA: GStrongholdArea;
    export let CASTLE_AREA: GStrongholdArea;

    // Get a textual representation of the distance/direction between 2 rooms on the same floor
    export function describeDistanceBetweenRooms(originRoom: GRoom, otherRoom: GRoom) {
        const origin2D: GPoint2D = {x: originRoom.getX(), y: originRoom.getY()};
        const target2D: GPoint2D = {x: otherRoom.getX(), y: otherRoom.getY()};
        const direction: string = DIRECTION.dir9FullTexts()[DIRECTION.getDirectionOf(origin2D, target2D)];
        const distance: number = Phaser.Math.Distance.BetweenPoints(origin2D, target2D);

        let distanceText: string;
        if (distance < 2) {
            distanceText = `very near to the ${direction}`;
        } else if (distance <= 3) {
            distanceText = `a short distance to the ${direction}`;
        } else if (distance <= 4) {
            distanceText = `not far to the ${direction}`;
        } else if (distance <= 5) {
            distanceText = `some way to the ${direction}`;
        } else if (distance <= 6) {
            distanceText = `a good way off to the ${direction}`;
        } else if (distance <= 6) {
            distanceText = `quite a long way to the ${direction}`;
        } else {
            distanceText = `very far away to the ${direction}`;
        }
        return distanceText;
    }
}