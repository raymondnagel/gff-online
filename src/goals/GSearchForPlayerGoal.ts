import { GGoal } from "./GGoal";
import { GFF } from "../main";
import { GImpSprite } from "../objects/chars/GImpSprite";
import { GPlayerSprite } from "../objects/chars/GPlayerSprite";
import { PLAYER } from "../player";
import { GChasePlayerGoal } from "./GChasePlayerGoal";

const SIGHT_RANGE: number = 240;
const CHASE_TIMEOUT: number = 6000;

export class GSearchForPlayerGoal extends GGoal {

    private targetX: number;
    private targetY: number;
    private range: number;

    constructor(char: GImpSprite, x: number, y: number, range: number, timeOut: number) {
        super('search-for-player', char, timeOut);
        this.targetX = x;
        this.targetY = y;
        this.range = range;

        char.setChasing(false);
    }

    public doStep(): void {
        // With each step, evaluate whether the player has been spotted:
        let player: GPlayerSprite = PLAYER.getSprite();
        let playerCtr = player.getBottomCenter();
        let myCtr = this.char.getBottomCenter();

        const distance = Phaser.Math.Distance.Between(
            myCtr.x,
            myCtr.y,
            playerCtr.x,
            playerCtr.y
        );
        if (PLAYER.getFaith() > 0 && distance <= SIGHT_RANGE && !GFF.AdventureContent.isConversationActive()) {
            this.char.setGoal(new GChasePlayerGoal(this.char, CHASE_TIMEOUT));
            return;
        }

        // Player was not spotted; continue on course
        this.walkToward(this.targetX, this.targetY);
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