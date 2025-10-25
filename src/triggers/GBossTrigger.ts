import { ENEMY } from "../enemy";
import { GFF } from "../main";
import { GDevilStatue } from "../objects/obstacles/GDevilStatue";
import { PLAYER } from "../player";
import { REGISTRY } from "../registry";
import { GPoint2D, GSpirit } from "../types";
import { GEventTrigger } from "./GEventTrigger";

export class GBossTrigger extends GEventTrigger {

    private triggerPoint: GPoint2D;
    private bossSpirit: GSpirit;

    /**
     * The boss encounter can only be triggered once; if the player wins,
     * the boss is gone forever. If the player loses, he will be teleported
     * outside the stronghold, so he won't be able to re-trigger it immediately.
     * When the room is re-entered, the trigger will be re-added to the chest,
     * and the player can try again.
     */
    private alreadyTriggered: boolean = false;

    constructor(bossSpirit: GSpirit, x: number, y: number) {
        super('boss encounter');
        this.triggerPoint = { x, y };
        this.bossSpirit = bossSpirit;
    }

    protected condition(): boolean {
        return !this.alreadyTriggered
            && (REGISTRY.get('bossDefeated_' + this.bossSpirit.name) !== true)
            && Phaser.Math.Distance.BetweenPoints(this.triggerPoint, PLAYER.getSprite().getPhysicalCenter()) < 100;
    }

    protected action(): void {
        this.alreadyTriggered = true;
        GFF.AdventureContent.encounterBoss(this.bossSpirit);
    }

}