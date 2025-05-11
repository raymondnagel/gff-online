import { GGoal } from "./GGoal";
import { GFF } from "../main";
import { GPlayerSprite } from "../objects/chars/GPlayerSprite";
import { PLAYER } from "../player";
import { GPoint2D } from "../types";

const CLOSE_ENOUGH: number = 64;

export class GFollowPlayerGoal extends GGoal {

    constructor(timeOut: number) {
        super('follow-player', timeOut);
    }

    public doStep(time: number, delta: number): void {
        let player: GPlayerSprite = PLAYER.getSprite();
        let playerCtr: GPoint2D = player.getPhysicalCenter();
        this.walkTowardForTime(playerCtr.x, playerCtr.y, time, delta);
    }

    public isAchieved(): boolean {
        // The companion's goal is only to be near the player;
        // if he is close enough, the goal is achieved.
        return PLAYER.getSprite().getDistanceToChar(this.char) < CLOSE_ENOUGH;
    }
}