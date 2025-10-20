import { AREA } from "../area";
import { GStrongholdArea } from "../areas/GStrongholdArea";
import { GStronghold } from "./GStronghold";

export class GStrongholdDungeon extends GStronghold {

    /**
     * Stronghold: Dungeon of Doubt
     * Armor: Shield of Faith
     * Boss: Apollyon
     * Challenge: Many illusory walls seem to block the way, but dissipate when
     * touched. At 100% faith, they do not appear at all.
     */

    constructor() {
        super("Dungeon of Doubt", "dungeon_front", AREA.DUNGEON_AREA);
    }
}