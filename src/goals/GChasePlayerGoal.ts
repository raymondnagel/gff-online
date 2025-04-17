import { GGoal } from "./GGoal";
import { GFF } from "../main";
import { GImpSprite } from "../objects/chars/GImpSprite";
import { GPlayerSprite } from "../objects/chars/GPlayerSprite";
import { PLAYER } from "../player";
import { PHYSICS } from "../physics";
import { GPoint } from "../types";

export class GChasePlayerGoal extends GGoal {

    constructor(timeOut: number) {
        super('chase-player', timeOut);
    }

    public start(): void {
        const char: GImpSprite = this.char as GImpSprite;
        char.setChasing(true);
        char.showFloatingText('Grrr!');
        GFF.AdventureContent.getSound().playSound('imp_growl');
    }

    public doStep(_time: number, _delta: number): void {
        let player: GPlayerSprite = PLAYER.getSprite();
        let playerCtr: GPoint = player.getPhysicalCenter();
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