import { DEPTH } from "../depths";
import { EFFECTS } from "../effects";
import { GFF } from "../main";
import { GOverheadDecoration } from "../objects/decorations/GOverheadDecoration";
import { PHYSICS } from "../physics";
import { PLAYER } from "../player";
import { GPoint2D, GRect } from "../types";
import { GEventTrigger } from "./GEventTrigger";

export class GStrongholdNorthArchTrigger extends GEventTrigger {

    private triggerArea: GRect;
    private arch: GOverheadDecoration;

    constructor(arch: GOverheadDecoration) {
        super('stronghold north arch flip');
        this.arch = arch;
        this.triggerArea = { x: 412, y: 0, width: 200, height: 100 };
    }

    protected condition(): boolean {
        return PHYSICS.isCenterWithin(PLAYER.getSprite(), this.triggerArea);
    }

    protected action(): void {
        if (PLAYER.getSprite().getBody().top < this.arch.y + this.arch.height) {
            this.arch.setDepth(DEPTH.OH_DECOR);
        } else {
            this.arch.setDepth(DEPTH.WALL_NORTH);
        }
    }

}