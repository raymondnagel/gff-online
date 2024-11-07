import { GGoal } from "./GGoal";
import { GFF } from "../main";
import { GCharSprite } from "../objects/chars/GCharSprite";
import { GImpSprite } from "../objects/chars/GImpSprite";
import { GPlayerSprite } from "../objects/chars/GPlayerSprite";
import { PLAYER } from "../player";
import { GBaseScene } from "../scenes/GBaseScene";

const DIAGONAL_THRESHOLD: number = 2.0;

export class GChasePlayerGoal extends GGoal {

    constructor(char: GCharSprite, timeOut: number) {
        super('chase-player', char, timeOut);
        (char as GImpSprite).setChasing(true);
        (this.char.scene as GBaseScene).getSound().playSound('imp_growl');
    }

    public doStep(): void {
        let player: GPlayerSprite = PLAYER.getSprite();
        let playerCtr = player.getBottomCenter();
        this.walkTowardForTime(playerCtr.x, playerCtr.y);
    }

    public isAchieved(): boolean {
        // The enemy's goal is not really to achieve anything;
        // if he gets close enough, the collision will trigger a battle.
        // Usually the chase will timeout, though it should also
        // end if the player has no faith or there is a conversation going on:
        return PLAYER.getFaith() <= 0 || GFF.AdventureContent.isConversationActive();
    }
}