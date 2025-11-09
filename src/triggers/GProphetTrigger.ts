import { GFF } from "../main";
import { GProphetSprite } from "../objects/chars/GProphetSprite";
import { PLAYER } from "../player";
import { GPoint2D } from "../types";
import { GEventTrigger } from "./GEventTrigger";

export class GProphetTrigger extends GEventTrigger {

    private triggerPoint: GPoint2D;

    constructor(x: number, y: number) {
        super('prophet encounter', 1);
        this.triggerPoint = { x, y };
    }

    protected condition(): boolean {
        return Phaser.Math.Distance.BetweenPoints(this.triggerPoint, PLAYER.getSprite().getPhysicalCenter()) < 120;
    }

    protected action(): void {
        GFF.AdventureContent.getPersons().find((char) => char instanceof GProphetSprite)!.standUp();
    }

}