import { GRoom } from "../GRoom";
import { GRegion } from "./GRegion";

export class GMountRegion extends GRegion{

    constructor(){
        super(
            'Mountain',
            'mount_bg',
            'mount_enc_bg',
            'map_mountain'
        );
    }

    protected _furnishRoom(room: GRoom) {
    }
}
