
import { DIRECTION } from "../../direction";
import { GFF } from "../../main";
import { PLAYER } from "../../player";
import { SCENERY } from "../../scenery";
import { GTouchable } from "./GTouchable";


export class GBuildingExit extends GTouchable {

    constructor(x: number, y: number) {
        super(SCENERY.def('building_exit'), x, y);
        this.setOrigin(0, 0);
    }

    public canTouch(): boolean {
        // Can exit only if facing a southward direction
        return DIRECTION.getVertInc(PLAYER.getSprite().getDirection()) > 0;
    }

    public doTouch() {
        GFF.AdventureContent.playerExitBuilding();
    }
}