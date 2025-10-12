import { GStrongholdArea } from "../areas/GStrongholdArea";
import { GStronghold } from "./GStronghold";

export class GStrongholdFortress extends GStronghold {

    constructor() {
        super("Fortress of Enmity", "fortress_front");
    }

    protected loadInteriorArea(): GStrongholdArea {
        const area = new GStrongholdArea(this.getName(), 11, 9, [
            'fortress_0'
        ]);
        area.setGroundFloor(0);
        return area;
    }

}