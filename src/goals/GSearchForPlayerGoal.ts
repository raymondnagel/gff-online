import { GGoal } from "./GGoal";
import { GFF } from "../main";
import { GImpSprite } from "../objects/chars/GImpSprite";
import { GPlayerSprite } from "../objects/chars/GPlayerSprite";
import { PLAYER } from "../player";
import { GChasePlayerGoal } from "./GChasePlayerGoal";
import { PHYSICS } from "../physics";
import { GPoint2D } from "../types";

const SIGHT_RANGE: number = 240;
const CHASE_TIMEOUT: number = 6000;

export class GSearchForPlayerGoal extends GGoal {

    private targetX: number;
    private targetY: number;
    private range: number;

    constructor(x: number, y: number, range: number, timeOut: number) {
        super('search-for-player', timeOut);
        this.targetX = x;
        this.targetY = y;
        this.range = range;
    }

    public start(): void {
        (this.char as GImpSprite).setChasing(false);
    }

    public doStep(time: number, delta: number): void {
        // With each step, evaluate whether the player has been spotted:
        let player: GPlayerSprite = PLAYER.getSprite();
        let playerCtr: GPoint2D = player.getPhysicalCenter();
        let myCtr: GPoint2D = this.char.getPhysicalCenter();

        const distance = Phaser.Math.Distance.Between(
            myCtr.x,
            myCtr.y,
            playerCtr.x,
            playerCtr.y
        );
        if (PLAYER.getFaith() > 0 && distance <= SIGHT_RANGE && !GFF.AdventureContent.isConversationOrCutsceneActive()) {
            this.char.setGoal(new GChasePlayerGoal(CHASE_TIMEOUT));
            return;
        }

        // Player was not spotted; continue on course
        this.walkTo(this.targetX, this.targetY, time, delta);
    }

    public isAchieved(): boolean {
        const distance = Phaser.Math.Distance.Between(
            this.char.x,
            this.char.y,
            this.targetX,
            this.targetY
        );
        return distance <= this.range;
    }
}