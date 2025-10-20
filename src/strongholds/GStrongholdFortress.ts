import { AREA } from "../area";
import { GStrongholdArea } from "../areas/GStrongholdArea";
import { GStronghold } from "./GStronghold";

export class GStrongholdFortress extends GStronghold {

    /**
     * Stronghold: Fortress of Enmity
     * Armor: Preparation of the Gospel of Peace
     * Boss: Legion
     * Challenge: Many rooms contain stone statues of devils, which animate into
     * enemies when approached. At 100% faith, the statues remain stone and do
     * not animate.
     */

    constructor() {
        super("Fortress of Enmity", "fortress_front", AREA.FORTRESS_AREA);
    }
}