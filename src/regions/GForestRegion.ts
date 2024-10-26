import { GRoom } from "../GRoom";
import { GRegion } from "./GRegion";

export class GForestRegion extends GRegion{

    constructor(){
        super(
            'Forest',
            'forest_bg',
            'forest_enc_bg',
            'map_forest'
        );
    }

    protected _furnishRoom(room: GRoom) {
    }
}
