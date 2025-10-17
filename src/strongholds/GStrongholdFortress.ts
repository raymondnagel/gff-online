import { AREA } from "../area";
import { GStrongholdArea } from "../areas/GStrongholdArea";
import { GStronghold } from "./GStronghold";

export class GStrongholdFortress extends GStronghold {

    constructor() {
        super("Fortress of Enmity", "fortress_front", AREA.FORTRESS_AREA);
    }
}