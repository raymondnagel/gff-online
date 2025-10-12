import { GRoom } from "../GRoom";
import { SCENERY } from "../scenery";
import { Dir9, GInteriorWallPiece, GInteriorWallSet, GSceneryDef } from "../types";
import { GInsideRegion } from "./GInsideRegion";

const WALLS: GInteriorWallSet = {
    n_left: 'hold_wall_n_left',
    n_right: 'hold_wall_n_right',
    n_mid: 'hold_wall_n_mid',
    n_door_lower: 'hold_wall_n_door_lower',
    n_door_upper: 'hold_wall_n_door_upper',
    s_left: 'hold_wall_s_left',
    s_right: 'hold_wall_s_right',
    s_mid: 'hold_wall_s_mid',
    s_door: 'hold_wall_s_door',
    e_top: 'hold_wall_e_top',
    e_bottom: 'hold_wall_e_bottom',
    e_mid: 'hold_wall_e_mid',
    e_door_lower: 'hold_wall_e_door_lower',
    e_door_upper: 'hold_wall_e_door_upper',
    w_top: 'hold_wall_w_top',
    w_bottom: 'hold_wall_w_bottom',
    w_mid: 'hold_wall_w_mid',
    w_door_lower: 'hold_wall_w_door_lower',
    w_door_upper: 'hold_wall_w_door_upper',
    ne_corner: 'hold_wall_ne_corner',
    nw_corner: 'hold_wall_nw_corner',
    se_corner: 'hold_wall_se_corner',
    sw_corner: 'hold_wall_sw_corner',
};

export class GChurchRegion extends GInsideRegion{

    constructor(){
        super(
            'Church',
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
