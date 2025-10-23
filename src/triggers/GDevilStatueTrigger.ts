import { GDevilStatue } from "../objects/obstacles/GDevilStatue";
import { PLAYER } from "../player";
import { GPoint2D } from "../types";
import { GEventTrigger } from "./GEventTrigger";

export class GDevilStatueTrigger extends GEventTrigger {

    private triggerPoint: GPoint2D;
    private statue: GDevilStatue;
    private isBurst: boolean = false;

    constructor(statue: GDevilStatue, x: number, y: number) {
        super('devil statue burst');
        this.triggerPoint = { x, y };
        this.statue = statue;
    }

    protected condition(): boolean {
        return (!this.isBurst)
            && PLAYER.getFaith() < PLAYER.getMaxFaith()
            && Phaser.Math.Distance.BetweenPoints(this.triggerPoint, PLAYER.getSprite().getPhysicalCenter()) < 150;
    }

    protected action(): void {
        this.isBurst = true;
        this.statue.burst();
    }

}