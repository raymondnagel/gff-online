import { GStrongholdArea } from "../areas/GStrongholdArea";
import { GStronghold } from "./GStronghold";

export class GStrongholdKeep extends GStronghold {

    constructor() {
        super("Keep of Wickedness", "keep_front");
    }

    protected loadInteriorArea(): GStrongholdArea {
        const area = new GStrongholdArea(this.getName(), 9, 9, [
            'keep_0',
        ]);
        area.setGroundFloor(0);
        return area;
    }

}