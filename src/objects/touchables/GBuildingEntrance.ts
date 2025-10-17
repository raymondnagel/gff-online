
import { DIRECTION } from "../../direction";
import { GFF } from "../../main";
import { PLAYER } from "../../player";
import { SCENERY } from "../../scenery";
import { GTouchable } from "./GTouchable";


export class GBuildingEntrance extends GTouchable {

    constructor(x: number, y: number) {
        super(SCENERY.def('threshold'), x, y);
        this.setOrigin(0, 0);
    }

    public canTouch(): boolean {
        // Can enter only if player has faith, and if facing a northward direction
        return PLAYER.getFaith() > 0
            && DIRECTION.getVertInc(PLAYER.getSprite().getDirection()) < 0;
    }

    public doTouch() {
        GFF.AdventureContent.playerEnterBuilding();
    }
}