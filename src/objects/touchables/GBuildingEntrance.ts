
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
        /**
         * The threshold must extend 1 pixel past the bottom edge of the building,
         * so the player can collide with it instead of the building itself.
         * There's a small chance the player could collide with the threshold moving
         * west or east; if that happens, we don't want to stop the player when he
         * hits an invisible object; but we also don't want to allow entering while
         * facing any direction except north.
         * Instead, if facing west or east, we'll just gently slide him down 1 pixel:
         */
        if (DIRECTION.getYInc(PLAYER.getSprite().getDirection()) === 0) {
            PLAYER.getSprite().setY(PLAYER.getSprite().y + 1);
            return false;
        }

        // Can enter only if player has faith, and if facing a northward direction
        return PLAYER.getFaith() > 0
            && DIRECTION.getYInc(PLAYER.getSprite().getDirection()) < 0;
    }

    public doTouch() {
        GFF.AdventureContent.playerEnterBuilding();
    }
}