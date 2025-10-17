import { AREA } from "../area";
import { GStrongholdArea } from "../areas/GStrongholdArea";
import { GStronghold } from "./GStronghold";

export class GStrongholdDungeon extends GStronghold {

    constructor() {
        super("Dungeon of Doubt", "dungeon_front", AREA.DUNGEON_AREA);
    }
}