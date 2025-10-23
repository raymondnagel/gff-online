
import { DIRECTION } from "../../direction";
import { GFF } from "../../main";
import { PLAYER } from "../../player";
import { SCENERY } from "../../scenery";
import { GTouchable } from "./GTouchable";


export class GFalseStaircaseThreshold extends GTouchable {

    constructor(x: number, y: number) {
        super(SCENERY.def('threshold'), x, y);
        this.setOrigin(0, 0);
    }

    public canTouch(): boolean {
        // Can enter only if facing a northward direction
        return DIRECTION.getVertInc(PLAYER.getSprite().getDirection()) < 0;
    }

    public doTouch() {
        GFF.AdventureContent.playerSentToLowerFloor();
    }
}