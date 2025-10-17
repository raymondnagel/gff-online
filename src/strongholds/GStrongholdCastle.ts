import { AREA } from "../area";
import { GStrongholdArea } from "../areas/GStrongholdArea";
import { GStronghold } from "./GStronghold";

export class GStrongholdCastle extends GStronghold {

    constructor() {
        super('Castle of Perdition', 'castle_front', AREA.CASTLE_AREA);
    }
}