import { GStrongholdArea } from "../areas/GStrongholdArea";
import { GStronghold } from "./GStronghold";

export class GStrongholdCastle extends GStronghold {


    constructor() {
        super('Castle of Perdition', 'castle_front');
    }

    protected loadInteriorArea(): GStrongholdArea {
        const area = new GStrongholdArea(this.getName(), 9, 9, [
            'castle_0',
            'castle_1',
            'castle_2',
        ]);
        area.setGroundFloor(0);
        return area;
    }

}