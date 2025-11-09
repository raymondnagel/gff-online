import { GGoal } from "./GGoal";
import { GFF } from "../main";
import { GImpSprite } from "../objects/chars/GImpSprite";
import { GPlayerSprite } from "../objects/chars/GPlayerSprite";
import { PLAYER } from "../player";
import { GPoint2D } from "../types";

export class GChasePlayerGoal extends GGoal {

    constructor(timeOut: number) {
        super('chase-player', timeOut);
    }

    public start(): void {
        const char: GImpSprite = this.char as GImpSprite;
        char.setChasing(true);
        char.showFloatingText('Grrr!', 'word');
        GFF.AdventureContent.getSound().playSound('imp_growl');
    }

    public doStep(time: number, delta: number): void {
        let player: GPlayerSprite = PLAYER.getSprite();
        let playerCtr: GPoint2D = player.getPhysicalCenter();
        this.walkTowardForTime(playerCtr.x, playerCtr.y, time, delta);
    }

    public isAchieved(): boolean {
        // The enemy's goal is not really to achieve anything;
        // if he gets close enough, the collision will trigger a battle.
        // Usually the chase will timeout, though it should also
        // end if the player has no faith or there is a conversation going on:
        return PLAYER.getFaith() <= 0 || GFF.AdventureContent.isConversationOrCutsceneActive();
    }
}