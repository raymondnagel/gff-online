import { AREA } from "../area";
import { GStrongholdArea } from "../areas/GStrongholdArea";
import { GStronghold } from "./GStronghold";

export class GStrongholdTower extends GStronghold {

    /**
     * Stronghold: Tower of Deception
     * Armor: Girdle of Truth
     * Boss: Mammon
     * Challenge: Each room with a staircase up also has false staircases that lead
     * down instead. At 100% faith, the false staircases are revealed, making the
     * true path obvious.
     */

    constructor() {
        super("Tower of Deception", "tower_front", AREA.TOWER_AREA);
    }
}