import { AREA } from "../area";
import { GStrongholdArea } from "../areas/GStrongholdArea";
import { GStronghold } from "./GStronghold";

export class GStrongholdKeep extends GStronghold {

    constructor() {
        super("Keep of Wickedness", "keep_front", AREA.KEEP_AREA);
    }
}