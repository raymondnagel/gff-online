import { AREA } from "../area";
import { GStrongholdArea } from "../areas/GStrongholdArea";
import { GStronghold } from "./GStronghold";

export class GStrongholdCastle extends GStronghold {

    /**
     * Stronghold: Castle of Perdition
     * Armor: Helmet of Salvation
     * Boss: Beelzebub
     * Challenge: The player's faith slowly drains while inside the stronghold,
     * at the rate of 1 every second. At 100% faith, this effect is negated.
     */

    constructor() {
        super('Castle of Perdition', 'castle_front', AREA.CASTLE_AREA);
    }
}