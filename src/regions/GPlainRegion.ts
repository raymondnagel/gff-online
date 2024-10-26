import { GRoom } from "../GRoom";
import { GRegion } from "./GRegion";

export class GPlainRegion extends GRegion{

    constructor(){
        super(
            'Plain',
            'plain_bg',
            'plain_enc_bg',
            'map_plain'
        );
    }

    protected _furnishRoom(room: GRoom) {
    }
}
