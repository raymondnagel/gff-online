import { GRoom } from "../GRoom";
import { REGISTRY } from "../registry";
import { SCENERY } from "../scenery";
import { Dir9, GInteriorWallPiece, GInteriorWallSet, GSceneryDef } from "../types";
import { GInsideRegion } from "./GInsideRegion";

const WALLS: GInteriorWallSet = {
    n_left: 'cave_wall_n_left',
    n_right: 'cave_wall_n_right',
    n_mid: 'cave_wall_n_mid',
    s_left: 'cave_wall_s_left',
    s_right: 'cave_wall_s_right',
    s_door: 'cave_wall_s_door',
    e_top: 'cave_wall_e_top',
    e_bottom: 'cave_wall_e_bottom',
    e_mid: 'cave_wall_e_mid',
    w_top: 'cave_wall_w_top',
    w_bottom: 'cave_wall_w_bottom',
    w_mid: 'cave_wall_w_mid',
    ne_corner: 'cave_wall_ne_corner',
    nw_corner: 'cave_wall_nw_corner',
    se_corner: 'cave_wall_se_corner',
    sw_corner: 'cave_wall_sw_corner',
};

export class GCaveRegion extends GInsideRegion{

    constructor(){
        super(
            'cave',
            'cave_bg',
            'cave_enc_bg',
            'map_floor'
        );
    }

    public getFullName(): string {
        if (REGISTRY.getBoolean('invitedToCave')) {
            return 'Gloomy Tomb';
        } else {
            return 'Cave';
        }
    }

    public getWallPiece(key: GInteriorWallPiece): GSceneryDef|undefined {
        const defKey: string|undefined = WALLS[key as keyof GInteriorWallSet];
        return defKey ? SCENERY.def(defKey) : undefined;
    }

    public getTemperature(): number {
        return 15; // The cave is a bit chilly
    }

    protected _furnishRoom(room: GRoom) {
        // The cave will always be set up the same way:
        room.planCaveInterior();
        /**
         * When scenery is actually loaded, though, some pieces will be omitted
         * if Adam has not yet received the invitation. The cave will be shown as
         * simply "a cave"; but once the invitation is received, and Adam enters,
         * the full interior will be revealed, and the cave will be renamed "Gloomy Tomb".
         */
    }
}
