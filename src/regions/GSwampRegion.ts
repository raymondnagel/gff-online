import { GRoom } from "../GRoom";
import { GRegion } from "./GRegion";

export class GSwampRegion extends GRegion{

    constructor(){
        super(
            'Swamp',
            'swamp_bg',
            'swamp_enc_bg',
            'map_swamp'
        );
    }

    protected _furnishRoom(room: GRoom) {
    }
}
