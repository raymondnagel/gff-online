import { GRoom } from "../GRoom";
import { SCENERY } from "../scenery";
import { Dir9, GInteriorWallPiece, GInteriorWallSet, GSceneryDef } from "../types";
import { GInsideRegion } from "./GInsideRegion";

const WALLS: GInteriorWallSet = {
    n_left: 'church_wall_n_left',
    n_right: 'church_wall_n_right',
    n_mid: 'church_wall_n_mid',
    s_left: 'church_wall_s_left',
    s_right: 'church_wall_s_right',
    s_door: 'church_wall_s_door',
    e_top: 'church_wall_e_top',
    e_bottom: 'church_wall_e_bottom',
    e_mid: 'church_wall_e_mid',
    w_top: 'church_wall_w_top',
    w_bottom: 'church_wall_w_bottom',
    w_mid: 'church_wall_w_mid',
    ne_corner: 'church_wall_ne_corner',
    nw_corner: 'church_wall_nw_corner',
    se_corner: 'church_wall_se_corner',
    sw_corner: 'church_wall_sw_corner',
};

export class GChurchRegion extends GInsideRegion{

    constructor(){
        super(
            'church',
            'church_bg',
            '', // No encounters ever happen in churches!
            'map_floor'
        );
    }

    public getWallPiece(key: GInteriorWallPiece): GSceneryDef|undefined {
        const defKey: string|undefined = WALLS[key as keyof GInteriorWallSet];
        return defKey ? SCENERY.def(defKey) : undefined;
    }

    public getTemperature(): number {
        return 20; // Comfortable temperature for a church. It probably has AC on :)
    }

    protected _furnishRoom(room: GRoom) {
        // Churches are organized: no random scenery objects.
        room.planChurchInterior();
    }
}
