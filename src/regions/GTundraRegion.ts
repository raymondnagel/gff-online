import { GRoom } from "../GRoom";
import { GRegion } from "./GRegion";

export class GTundraRegion extends GRegion{

    constructor(){
        super(
            'Tundra',
            'tundra_bg',
            'tundra_enc_bg',
            'map_tundra'
        );
    }

    protected _furnishRoom(room: GRoom) {
    }
}
