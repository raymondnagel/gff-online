import { AREA } from "../area";
import { GStrongholdArea } from "../areas/GStrongholdArea";
import { GStronghold } from "./GStronghold";

export class GStrongholdKeep extends GStronghold {

    /**
     * Stronghold: Keep of Wickedness
     * Armor: Breastplate of Righteousness
     * Boss: Belial
     * Challenge: 50% of common chests contain the "Treasure of Wickedness"
     * item, which halves the player's remaining faith and grace. At 100% faith,
     * these chests are revealed and can be avoided.
     */

    constructor() {
        super("Keep of Wickedness", "keep_front", AREA.KEEP_AREA);
    }
}