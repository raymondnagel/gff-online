import { GRoom } from "../GRoom";
import { GRegion } from "./GRegion";

export class GDesertRegion extends GRegion{

    constructor(){
        super(
            'Desert',
            'desert_bg',
            'desert_enc_bg',
            'map_desert'
        );
    }

    protected _furnishRoom(room: GRoom) {
    }
}
