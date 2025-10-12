import { GStrongholdArea } from "../areas/GStrongholdArea";
import { GStronghold } from "./GStronghold";

export class GStrongholdTower extends GStronghold {

    constructor() {
        super("Tower of Deception", "tower_front");
    }

    protected loadInteriorArea(): GStrongholdArea {
        const area = new GStrongholdArea(this.getName(), 3, 3, [
            'tower_0',
            'tower_1',
            'tower_2',
            'tower_3',
            'tower_4',
            'tower_5',
            'tower_6',
        ]);
        area.setGroundFloor(0);
        return area;
    }

}