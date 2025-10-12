import { GStrongholdArea } from "../areas/GStrongholdArea";
import { GStronghold } from "./GStronghold";

export class GStrongholdDungeon extends GStronghold {

    constructor() {
        super("Dungeon of Doubt", "dungeon_front");
    }

    protected loadInteriorArea(): GStrongholdArea {
        const area = new GStrongholdArea(this.getName(), 7, 5, [
            'dungeon_0',
            'dungeon_1',
        ]);
        area.setGroundFloor(1);
        return area;
    }

}