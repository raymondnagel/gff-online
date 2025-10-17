import { AREA } from "../area";
import { GStrongholdArea } from "../areas/GStrongholdArea";
import { GStronghold } from "./GStronghold";

export class GStrongholdTower extends GStronghold {

    constructor() {
        super("Tower of Deception", "tower_front", AREA.TOWER_AREA);
    }
}