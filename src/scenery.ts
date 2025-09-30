import 'phaser';
import { GRect, GSceneryDef, GSceneryPlan } from './types';
import { GFF } from './main';
import { RANDOM } from './random';
import { GBackgroundDecoration } from './objects/decorations/GBackgroundDecoration';
import { GObstacleStatic } from './objects/obstacles/GObstacleStatic';
import { GObstacleSprite } from './objects/obstacles/GObstacleSprite';
import { GForegroundDecoration } from './objects/decorations/GForegroundDecoration';
import { GTreasureChest } from './objects/touchables/GTreasureChest';
import { GPiano } from './objects/interactables/GPiano';
import { GChurchHouse } from './objects/obstacles/GChurchHouse';
import { GBuildingEntrance } from './objects/touchables/GBuildingEntrance';
import { GBuildingExit } from './objects/touchables/GBuildingExit';
import { GTravelAgency } from './objects/obstacles/GTravelAgency';
import { GSpiritTravelAgency } from './objects/obstacles/GSpiritTravelAgency';

export namespace SCENERY {
    const WALL_N_BODY: GRect = {x: 0, y: 0, width: 1024, height: 64};
    const WALL_E_BODY: GRect = {x: 0, y: 0, width: 64, height: 704};
    const WALL_S_BODY: GRect = {x: 0, y: 64, width: 1024, height: 64};
    const WALL_W_BODY: GRect = {x: 0, y: 0, width: 64, height: 704};

    /**
     * These scenery definitions can be used for both obstacles (physical objects) and decorations (non-physical
     * background graphics). The create() method interprets the key to create the right type of object.
     *
     * For obstacles, the body is used for planning to prevent overlaps, and to physically-obstruct characters.
     * For decorations, the body is only used for planning to prevent overlaps.
     *
     * Walls are defined here, but they're not added from the scenery plans.
     */

    // Walls:

    export const CHURCH_WALL_N_DEF: GSceneryDef = { key: 'church_wall_n', type: 'static', body: WALL_N_BODY };
    export const CHURCH_WALL_E_DEF: GSceneryDef = { key: 'church_wall_e', type: 'static', body: WALL_E_BODY };
    export const CHURCH_WALL_S_DEF: GSceneryDef = { key: 'church_wall_s', type: 'static', body: WALL_N_BODY };
    export const CHURCH_WALL_W_DEF: GSceneryDef = { key: 'church_wall_w', type: 'static', body: WALL_W_BODY };
    export const CHURCH_WALL_NW_DEF: GSceneryDef = { key: 'nothing', type: 'static', body: {x: 0, y: 0, width: 0, height: 0} };
    export const CHURCH_WALL_NE_DEF: GSceneryDef = { key: 'nothing', type: 'static', body: {x: 0, y: 0, width: 0, height: 0} };
    export const CHURCH_WALL_SE_DEF: GSceneryDef = { key: 'nothing', type: 'static', body: {x: 0, y: 0, width: 0, height: 0} };
    export const CHURCH_WALL_SW_DEF: GSceneryDef = { key: 'nothing', type: 'static', body: {x: 0, y: 0, width: 0, height: 0} };
    export const CHURCH_WALL_S_LEFT_DEF: GSceneryDef = { key: 'church_wall_s_left', type: 'static', body: {x: 0, y: 0, width: 483, height: 64} };
    export const CHURCH_WALL_S_RIGHT_DEF: GSceneryDef = { key: 'church_wall_s_right', type: 'static', body: {x: 0, y: 0, width: 483, height: 64} };
    export const CHURCH_WALL_S_DOORWAY_DEF: GSceneryDef = { key: 'church_wall_s_doorway', type: 'static', body: {x: 0, y: 0, width: 58, height: 64} };

    export const ROCK_WALL_N_DEF: GSceneryDef = { key: 'rock_wall_n', type: 'static', body: WALL_N_BODY };
    export const ROCK_WALL_E_DEF: GSceneryDef = { key: 'rock_wall_e', type: 'static', body: WALL_E_BODY };
    export const ROCK_WALL_S_DEF: GSceneryDef = { key: 'rock_wall_s', type: 'static', body: WALL_S_BODY };
    export const ROCK_WALL_W_DEF: GSceneryDef = { key: 'rock_wall_w', type: 'static', body: WALL_W_BODY };
    export const ROCK_WALL_NW_DEF: GSceneryDef = { key: 'rock_wall_nw', type: 'static', body: {x: 0, y: 0, width: 114, height: 87} };
    export const ROCK_WALL_NE_DEF: GSceneryDef = { key: 'rock_wall_ne', type: 'static', body: {x: 0, y: 0, width: 116, height: 87} };
    export const ROCK_WALL_SE_DEF: GSceneryDef = { key: 'rock_wall_se', type: 'static', body: {x: 0, y: 0, width: 57, height: 161} };
    export const ROCK_WALL_SW_DEF: GSceneryDef = { key: 'rock_wall_sw', type: 'static', body: {x: 0, y: 0, width: 58, height: 161} };

    export const PLAIN_WALL_N_DEF: GSceneryDef = { key: 'plain_wall_n', type: 'static', body: WALL_N_BODY };
    export const PLAIN_WALL_E_DEF: GSceneryDef = { key: 'plain_wall_e', type: 'static', body: WALL_E_BODY };
    export const PLAIN_WALL_S_DEF: GSceneryDef = { key: 'plain_wall_s', type: 'static', body: WALL_S_BODY };
    export const PLAIN_WALL_W_DEF: GSceneryDef = { key: 'plain_wall_w', type: 'static', body: WALL_W_BODY };
    export const PLAIN_WALL_NW_DEF: GSceneryDef = { key: 'plain_wall_nw', type: 'static', body: {x: 0, y: 0, width: 114, height: 87} };
    export const PLAIN_WALL_NE_DEF: GSceneryDef = { key: 'plain_wall_ne', type: 'static', body: {x: 0, y: 0, width: 116, height: 87} };
    export const PLAIN_WALL_SE_DEF: GSceneryDef = { key: 'plain_wall_se', type: 'static', body: {x: 0, y: 0, width: 57, height: 161} };
    export const PLAIN_WALL_SW_DEF: GSceneryDef = { key: 'plain_wall_sw', type: 'static', body: {x: 0, y: 0, width: 58, height: 161} };

    export const DESERT_WALL_N_DEF: GSceneryDef = { key: 'desert_wall_n', type: 'static', body: WALL_N_BODY };
    export const DESERT_WALL_E_DEF: GSceneryDef = { key: 'desert_wall_e', type: 'static', body: WALL_E_BODY };
    export const DESERT_WALL_S_DEF: GSceneryDef = { key: 'desert_wall_s', type: 'static', body: WALL_S_BODY };
    export const DESERT_WALL_W_DEF: GSceneryDef = { key: 'desert_wall_w', type: 'static', body: WALL_W_BODY };
    export const DESERT_WALL_NW_DEF: GSceneryDef = { key: 'desert_wall_nw', type: 'static', body: {x: 0, y: 0, width: 114, height: 87} };
    export const DESERT_WALL_NE_DEF: GSceneryDef = { key: 'desert_wall_ne', type: 'static', body: {x: 0, y: 0, width: 116, height: 87} };
    export const DESERT_WALL_SE_DEF: GSceneryDef = { key: 'desert_wall_se', type: 'static', body: {x: 0, y: 0, width: 57, height: 161} };
    export const DESERT_WALL_SW_DEF: GSceneryDef = { key: 'desert_wall_sw', type: 'static', body: {x: 0, y: 0, width: 58, height: 161} };

    export const FOREST_WALL_N_DEF: GSceneryDef = { key: 'forest_wall_n', type: 'static', body: WALL_N_BODY };
    export const FOREST_WALL_E_DEF: GSceneryDef = { key: 'forest_wall_e', type: 'static', body: WALL_E_BODY };
    export const FOREST_WALL_S_DEF: GSceneryDef = { key: 'forest_wall_s', type: 'static', body: WALL_S_BODY };
    export const FOREST_WALL_W_DEF: GSceneryDef = { key: 'forest_wall_w', type: 'static', body: WALL_W_BODY };
    export const FOREST_WALL_NW_DEF: GSceneryDef = { key: 'forest_wall_nw', type: 'static', body: {x: 0, y: 0, width: 114, height: 87} };
    export const FOREST_WALL_NE_DEF: GSceneryDef = { key: 'forest_wall_ne', type: 'static', body: {x: 0, y: 0, width: 116, height: 87} };
    export const FOREST_WALL_SE_DEF: GSceneryDef = { key: 'forest_wall_se', type: 'static', body: {x: 0, y: 0, width: 57, height: 161} };
    export const FOREST_WALL_SW_DEF: GSceneryDef = { key: 'forest_wall_sw', type: 'static', body: {x: 0, y: 0, width: 58, height: 161} };

    export const TUNDRA_WALL_N_DEF: GSceneryDef = { key: 'tundra_wall_n', type: 'static', body: WALL_N_BODY };
    export const TUNDRA_WALL_E_DEF: GSceneryDef = { key: 'tundra_wall_e', type: 'static', body: WALL_E_BODY };
    export const TUNDRA_WALL_S_DEF: GSceneryDef = { key: 'tundra_wall_s', type: 'static', body: WALL_S_BODY };
    export const TUNDRA_WALL_W_DEF: GSceneryDef = { key: 'tundra_wall_w', type: 'static', body: WALL_W_BODY };
    export const TUNDRA_WALL_NW_DEF: GSceneryDef = { key: 'tundra_wall_nw', type: 'static', body: {x: 0, y: 0, width: 114, height: 87} };
    export const TUNDRA_WALL_NE_DEF: GSceneryDef = { key: 'tundra_wall_ne', type: 'static', body: {x: 0, y: 0, width: 116, height: 87} };
    export const TUNDRA_WALL_SE_DEF: GSceneryDef = { key: 'tundra_wall_se', type: 'static', body: {x: 0, y: 0, width: 57, height: 161} };
    export const TUNDRA_WALL_SW_DEF: GSceneryDef = { key: 'tundra_wall_sw', type: 'static', body: {x: 0, y: 0, width: 63, height: 161} };

    export const MOUNT_WALL_N_DEF: GSceneryDef = { key: 'mount_wall_n', type: 'static', body: WALL_N_BODY };
    export const MOUNT_WALL_E_DEF: GSceneryDef = { key: 'mount_wall_e', type: 'static', body: WALL_E_BODY };
    export const MOUNT_WALL_S_DEF: GSceneryDef = { key: 'mount_wall_s', type: 'static', body: WALL_S_BODY };
    export const MOUNT_WALL_W_DEF: GSceneryDef = { key: 'mount_wall_w', type: 'static', body: WALL_W_BODY };
    export const MOUNT_WALL_NW_DEF: GSceneryDef = { key: 'mount_wall_nw', type: 'static', body: {x: 0, y: 0, width: 114, height: 87} };
    export const MOUNT_WALL_NE_DEF: GSceneryDef = { key: 'mount_wall_ne', type: 'static', body: {x: 0, y: 0, width: 116, height: 87} };
    export const MOUNT_WALL_SE_DEF: GSceneryDef = { key: 'mount_wall_se', type: 'static', body: {x: 0, y: 0, width: 57, height: 161} };
    export const MOUNT_WALL_SW_DEF: GSceneryDef = { key: 'mount_wall_sw', type: 'static', body: {x: 0, y: 0, width: 58, height: 161} };

    export const SWAMP_WALL_N_DEF: GSceneryDef = { key: 'swamp_wall_n', type: 'static', body: WALL_N_BODY };
    export const SWAMP_WALL_E_DEF: GSceneryDef = { key: 'swamp_wall_e', type: 'static', body: WALL_E_BODY };
    export const SWAMP_WALL_S_DEF: GSceneryDef = { key: 'swamp_wall_s', type: 'static', body: WALL_S_BODY };
    export const SWAMP_WALL_W_DEF: GSceneryDef = { key: 'swamp_wall_w', type: 'static', body: WALL_W_BODY };
    export const SWAMP_WALL_NW_DEF: GSceneryDef = { key: 'swamp_wall_nw', type: 'static', body: {x: 0, y: 0, width: 114, height: 87} };
    export const SWAMP_WALL_NE_DEF: GSceneryDef = { key: 'swamp_wall_ne', type: 'static', body: {x: 0, y: 0, width: 116, height: 87} };
    export const SWAMP_WALL_SE_DEF: GSceneryDef = { key: 'swamp_wall_se', type: 'static', body: {x: 0, y: 0, width: 80, height: 120} };
    export const SWAMP_WALL_SW_DEF: GSceneryDef = { key: 'swamp_wall_sw', type: 'static', body: {x: 0, y: 0, width: 80, height: 120} };


    const SCENERY_DEFS: Map<string, GSceneryDef> = new Map<string, GSceneryDef>();

    export function initSceneryDefs() {
        [
            // Obstacles:
            { key: 'barrel_cactus', type: 'static', body: {x: 7, y: 50, width: 64, height: 27} },
            { key: 'boulder', type: 'static', body: {x: 0, y: 22, width: 64, height: 24} },
            { key: 'bush', type: 'static', body: {x: 0, y: 36, width: 64, height: 16} },
            { key: 'campfire', type: 'custom', body: {x: 0, y: 98, width: 112, height: 50} },
            { key: 'church_pew', type: 'static', body: {x: 0, y: 55, width: 318, height: 10} },
            { key: 'church_pulpit', type: 'static', body: {x: 0, y: 50, width: 72, height: 37} },
            { key: 'cypress_tree', type: 'static', body: {x: 44, y: 207, width: 144, height: 20} },
            { key: 'desert_boulder', type: 'static', body: {x: 0, y: 22, width: 64, height: 24} },
            { key: 'oak_tree', type: 'static', body: {x: 76, y: 200, width: 116, height: 36} },
            { key: 'palm_tree', type: 'static', body: {x: 95, y: 179, width: 30, height: 22} },
            { key: 'peak', type: 'static', body: {x: 0, y: 167, width: 300, height: 116} },
            { key: 'pine_tree', type: 'static', body: {x: 70, y: 264, width: 78, height: 36} },
            { key: 'paddle_cactus', type: 'static', body: {x: 8, y: 81, width: 102, height: 30} },
            { key: 'rock_column', type: 'static', body: {x: 0, y: 240, width: 159, height: 40} },
            { key: 'shrine_pillar', type: 'static', body: {x: 0, y: 113, width: 64, height: 25} },
            { key: 'shrub', type: 'static', body: {x: 0, y: 41, width: 64, height: 16} },
            { key: 'snowman', type: 'static', body: {x: 9, y: 64, width: 49, height: 26} },
            { key: 'snowy_boulder', type: 'static', body: {x: 0, y: 55, width: 95, height: 26} },
            { key: 'snowy_dead_tree', type: 'static', body: {x: 36, y: 183, width: 111, height: 37} },
            { key: 'snowy_pine_tree', type: 'static', body: {x: 85, y: 271, width: 37, height: 29} },
            { key: 'snowy_pit', type: 'static', body: {x: 0, y: 0, width: 154, height: 116} },
            { key: 'snowy_tree_stump', type: 'static', body: {x: 0, y: 39, width: 90, height: 31} },
            { key: 'spines_rocks', type: 'static', body: {x: 0, y: 38, width: 70, height: 14} },
            { key: 'standard', type: 'static', body: {x: 27, y: 110, width: 8, height: 10} },
            { key: 'tall_cactus', type: 'static', body: {x: 46, y: 195, width: 32, height: 24} },
            { key: 'tree_stump', type: 'static', body: {x: 0, y: 20, width: 115, height: 36} },
            { key: 'willow_tree', type: 'static', body: {x: 44, y: 209, width: 131, height: 21} },
            { key: 'wonky_tree', type: 'static', body: {x: 54, y: 130, width: 64, height: 30} },
            { key: 'help_sign', type: 'static', body: {x: 52, y: 72, width: 12, height: 8} },
            // Old Buildings (to be replaced):
            { key: 'church_house', type: 'custom', body: {x: 25, y: 260, width: 251, height: 103} },
            { key: 'duplex', type: 'static', body: {x: 20, y: 280, width: 312, height: 110} },
            { key: 'factory', type: 'static', body: {x: 0, y: 300, width: 350, height: 133} },
            { key: 'garage', type: 'static', body: {x: 20, y: 164, width: 232, height: 65} },
            { key: 'house_1', type: 'static', body: {x: 33, y: 198, width: 212, height: 100} },
            { key: 'house_2', type: 'static', body: {x: 48, y: 238, width: 285, height: 100} },
            { key: 'house_3', type: 'static', body: {x: 0, y: 207, width: 286, height: 84} },
            { key: 'house_4', type: 'static', body: {x: 24, y: 264, width: 320, height: 120} },
            { key: 'house_5', type: 'static', body: {x: 0, y: 269, width: 335, height: 83} },
            { key: 'house_6', type: 'static', body: {x: 0, y: 258, width: 332, height: 100} },
            { key: 'shop', type: 'static', body: {x: 0, y: 125, width: 240, height: 100} },
            { key: 'travel_agency', type: 'custom', body: {x: 5, y: 253, width: 346, height: 136} },
            // New Town Objects:
            { key: 'apartments_front', type: 'static', body: {x: 0, y: 250, width: 330, height: 214} },
            { key: 'bench', type: 'static', body: {x: 0, y: 41, width: 100, height: 22} },
            { key: 'camp_tent', type: 'static', body: {x: 0, y: 61, width: 174, height: 70} },
            { key: 'church_front', type: 'custom', body: {x: 20, y: 233, width: 356, height: 176} },
            { key: 'classic_1_front', type: 'static', body: {x: 0, y: 177, width: 344, height: 170} },
            { key: 'classic_2_front', type: 'static', body: {x: 0, y: 179, width: 346, height: 170} },
            { key: 'convertible_1', type: 'static', body: {x: 0, y: 49, width: 214, height: 32} },
            { key: 'convertible_2', type: 'static', body: {x: 0, y: 49, width: 214, height: 32} },
            { key: 'convertible_3', type: 'static', body: {x: 0, y: 49, width: 214, height: 32} },
            { key: 'cottage_front', type: 'static', body: {x: 5, y: 127, width: 233, height: 120} },
            { key: 'dead_end_sign', type: 'static', body: {x: 0, y: 124, width: 79, height: 16} },
            { key: 'factory_front', type: 'static', body: {x: 0, y: 157, width: 309, height: 196} },
            { key: 'fence_link_h', type: 'static', body: {x: 0, y: 84, width: 14, height: 16} },
            { key: 'fence_link_h_left', type: 'static', body: {x: 0, y: 84, width: 15, height: 16} },
            { key: 'fence_link_h_right', type: 'static', body: {x: 0, y: 84, width: 15, height: 16} },
            { key: 'fence_link_v_left', type: 'static', body: {x: 0, y: 92, width: 15, height: 16} },
            { key: 'fence_link_v_right', type: 'static', body: {x: 0, y: 92, width: 15, height: 16} },
            { key: 'fence_link_vend_left', type: 'static', body: {x: 0, y: 92, width: 15, height: 16} },
            { key: 'fence_link_vend_right', type: 'static', body: {x: 0, y: 92, width: 15, height: 16} },
            { key: 'fence_picket_h', type: 'static', body: {x: 0, y: 84, width: 19, height: 16} },
            { key: 'fence_picket_h_left', type: 'static', body: {x: 0, y: 84, width: 17, height: 16} },
            { key: 'fence_picket_h_right', type: 'static', body: {x: 0, y: 84, width: 17, height: 16} },
            { key: 'fence_picket_h_back', type: 'static', body: {x: 0, y: 84, width: 19, height: 16} },
            { key: 'fence_picket_h_back_left', type: 'static', body: {x: 0, y: 84, width: 17, height: 16} },
            { key: 'fence_picket_h_back_right', type: 'static', body: {x: 0, y: 84, width: 17, height: 16} },
            { key: 'fence_picket_v_left', type: 'static', body: {x: 0, y: 84, width: 16, height: 16} },
            { key: 'fence_picket_v_right', type: 'static', body: {x: 0, y: 84, width: 16, height: 16} },
            { key: 'fence_picket_vend_left', type: 'static', body: {x: 0, y: 84, width: 16, height: 16} },
            { key: 'fence_picket_vend_right', type: 'static', body: {x: 0, y: 84, width: 16, height: 16} },
            { key: 'fence_stockade_h', type: 'static', body: {x: 0, y: 85, width: 16, height: 16} },
            { key: 'fence_stockade_h_left', type: 'static', body: {x: 0, y: 85, width: 16, height: 16} },
            { key: 'fence_stockade_h_right', type: 'static', body: {x: 0, y: 85, width: 16, height: 16} },
            { key: 'fence_stockade_v_left', type: 'static', body: {x: 0, y: 85, width: 16, height: 16} },
            { key: 'fence_stockade_v_right', type: 'static', body: {x: 0, y: 85, width: 16, height: 16} },
            { key: 'fence_stockade_vend_left', type: 'static', body: {x: 0, y: 85, width: 16, height: 16} },
            { key: 'fence_stockade_vend_right', type: 'static', body: {x: 0, y: 85, width: 16, height: 16} },
            { key: 'fire_hydrant', type: 'static', body: {x: 0, y: 42, width: 32, height: 16} },
            { key: 'garage_1_front', type: 'static', body: {x: 5, y: 99, width: 236, height: 126} },
            { key: 'garage_2_front', type: 'static', body: {x: 6, y: 94, width: 206, height: 130} },
            { key: 'garage_3_front', type: 'static', body: {x: 5, y: 116, width: 201, height: 118} },
            { key: 'garage_4_front', type: 'static', body: {x: 7, y: 87, width: 205, height: 126} },
            { key: 'generic_1_back', type: 'static', body: {x: 0, y: 37, width: 229, height: 180} },
            { key: 'generic_2_back', type: 'static', body: {x: 0, y: 65, width: 233, height: 167} },
            { key: 'generic_3_back', type: 'static', body: {x: 0, y: 38, width: 247, height: 175} },
            { key: 'generic_4_back', type: 'static', body: {x: 2, y: 20, width: 325, height: 163} },
            { key: 'house_1_back', type: 'static', body: {x: 3, y: 120, width: 215, height: 114} },
            { key: 'house_1_front', type: 'static', body: {x: 5, y: 115, width: 209, height: 124} },
            { key: 'house_1_side_tall', type: 'static', body: {x: 5, y: 168, width: 270, height: 136} },
            { key: 'house_1_side', type: 'static', body: {x: 7, y: 98, width: 288, height: 156} },
            { key: 'house_2_back', type: 'static', body: {x: 0, y: 122, width: 228, height: 112} },
            { key: 'house_2_front', type: 'static', body: {x: 2, y: 123, width: 228, height: 116} },
            { key: 'house_2_side', type: 'static', body: {x: 5, y: 86, width: 261, height: 146} },
            { key: 'house_3_back', type: 'static', body: {x: 4, y: 129, width: 226, height: 122} },
            { key: 'house_3_front', type: 'static', body: {x: 0, y: 123, width: 230, height: 128} },
            { key: 'house_3_side_tall', type: 'static', body: {x: 7, y: 113, width: 272, height: 178} },
            { key: 'house_3_side', type: 'static', body: {x: 8, y: 89, width: 260, height: 144} },
            { key: 'house_4_front', type: 'static', body: {x: 6, y: 87, width: 282, height: 156} },
            { key: 'house_5_front', type: 'static', body: {x: 0, y: 120, width: 224, height: 119} },
            { key: 'lamp_post', type: 'static', body: {x: 0, y: 111, width: 36, height: 16} },
            { key: 'mailbox_in', type: 'static', body: {x: 0, y: 44, width: 40, height: 16} },
            { key: 'mailbox_out', type: 'static', body: {x: 0, y: 46, width: 55, height: 24} },
            { key: 'mansion_front', type: 'static', body: {x: 10, y: 213, width: 444, height: 178} },
            { key: 'monument', type: 'static', body: {x: 0, y: 152, width: 92, height: 48} },
            { key: 'pickup_1', type: 'static', body: {x: 0, y: 66, width: 256, height: 32} },
            { key: 'pickup_2', type: 'static', body: {x: 0, y: 66, width: 256, height: 32} },
            { key: 'pickup_3', type: 'static', body: {x: 0, y: 66, width: 256, height: 32} },
            { key: 'picnic_table', type: 'static', body: {x: 0, y: 42, width: 127, height: 38} },
            { key: 'police_station_front', type: 'static', body: {x: 5, y: 164, width: 368, height: 166} },
            { key: 'school_front', type: 'static', body: {x: 0, y: 162, width: 278, height: 160} },
            { key: 'sedan_1', type: 'static', body: {x: 0, y: 54, width: 250, height: 32} },
            { key: 'sedan_2', type: 'static', body: {x: 0, y: 52, width: 250, height: 34} },
            { key: 'sedan_3', type: 'static', body: {x: 0, y: 52, width: 250, height: 34} },
            { key: 'shop_front', type: 'static', body: {x: 9, y: 72, width: 193, height: 135} },
            { key: 'skyscraper_front', type: 'static', body: {x: 0, y: 509, width: 281, height: 177} },
            { key: 'stop_sign', type: 'static', body: {x: 0, y: 120, width: 74, height: 16} },
            { key: 'supermarket_front', type: 'static', body: {x: 0, y: 77, width: 412, height: 148} },
            { key: 'swingset', type: 'static', body: {x: 0, y: 123, width: 194, height: 32} },
            { key: 'trash', type: 'static', body: {x: 0, y: 53, width: 75, height: 20} },
            { key: 'travel_agency_front', type: 'custom', body: {x: 0, y: 175, width: 328, height: 144} },
            { key: 'warehouse_front', type: 'static', body: {x: 0, y: 194, width: 325, height: 157} },
            // Foreground Decorations:
            { key: 'big_flower', type: 'fg_decor', body: {x: 0, y: 0, width: 20, height: 44} },
            { key: 'cattails', type: 'fg_decor', body: {x: 0, y: 0, width: 66, height: 48} },
            { key: 'field_grass', type: 'fg_decor', body: {x: 0, y: 0, width: 64, height: 46} },
            { key: 'grass_tuft', type: 'fg_decor', body: {x: 0, y: 0, width: 64, height: 43} },
            { key: 'mushrooms', type: 'fg_decor', body: {x: 0, y: 0, width: 60, height: 62} },
            // Background Decorations:
            { key: 'flower_patch_1', type: 'bg_decor', body: {x: 0, y: 0, width: 40, height: 30} },
            { key: 'flower_patch_2', type: 'bg_decor', body: {x: 0, y: 0, width: 50, height: 44} },
            { key: 'shrine_pedestal', type: 'bg_decor', body: {x: 0, y: 0, width: 64, height: 47} },
            { key: 'steer_skull', type: 'bg_decor', body: {x: 0, y: 0, width: 64, height: 32} },
            { key: 'street_curve_ne_inner', type: 'bg_decor', body: {x: 0, y: 0, width: 64, height: 64} },
            { key: 'street_curve_ne_major', type: 'bg_decor', body: {x: 0, y: 0, width: 64, height: 64} },
            { key: 'street_curve_ne_minor', type: 'bg_decor', body: {x: 0, y: 0, width: 64, height: 64} },
            { key: 'street_curve_nw_inner', type: 'bg_decor', body: {x: 0, y: 0, width: 64, height: 64} },
            { key: 'street_curve_nw_major', type: 'bg_decor', body: {x: 0, y: 0, width: 64, height: 64} },
            { key: 'street_curve_nw_minor', type: 'bg_decor', body: {x: 0, y: 0, width: 64, height: 64} },
            { key: 'street_curve_se_inner', type: 'bg_decor', body: {x: 0, y: 0, width: 64, height: 64} },
            { key: 'street_curve_se_major', type: 'bg_decor', body: {x: 0, y: 0, width: 64, height: 64} },
            { key: 'street_curve_se_minor', type: 'bg_decor', body: {x: 0, y: 0, width: 64, height: 64} },
            { key: 'street_curve_sw_inner', type: 'bg_decor', body: {x: 0, y: 0, width: 64, height: 64} },
            { key: 'street_curve_sw_major', type: 'bg_decor', body: {x: 0, y: 0, width: 64, height: 64} },
            { key: 'street_curve_sw_minor', type: 'bg_decor', body: {x: 0, y: 0, width: 64, height: 64} },
            { key: 'street_deadend_e', type: 'bg_decor', body: {x: 0, y: 0, width: 64, height: 64} },
            { key: 'street_deadend_w', type: 'bg_decor', body: {x: 0, y: 0, width: 64, height: 64} },
            { key: 'street_horz_c', type: 'bg_decor', body: {x: 0, y: 0, width: 64, height: 64} },
            { key: 'street_horz_n', type: 'bg_decor', body: {x: 0, y: 0, width: 64, height: 64} },
            { key: 'street_horz_s', type: 'bg_decor', body: {x: 0, y: 0, width: 64, height: 64} },
            { key: 'street_t_nes', type: 'bg_decor', body: {x: 0, y: 0, width: 64, height: 64} },
            { key: 'street_t_nwe_e', type: 'bg_decor', body: {x: 0, y: 0, width: 64, height: 64} },
            { key: 'street_t_nwe_w', type: 'bg_decor', body: {x: 0, y: 0, width: 64, height: 64} },
            { key: 'street_t_nws', type: 'bg_decor', body: {x: 0, y: 0, width: 64, height: 64} },
            { key: 'street_t_wes_e', type: 'bg_decor', body: {x: 0, y: 0, width: 64, height: 64} },
            { key: 'street_t_wes_w', type: 'bg_decor', body: {x: 0, y: 0, width: 64, height: 64} },
            { key: 'street_vert_e', type: 'bg_decor', body: {x: 0, y: 0, width: 64, height: 64} },
            { key: 'street_vert_ne_int', type: 'bg_decor', body: {x: 0, y: 0, width: 64, height: 64} },
            { key: 'street_vert_nw_int', type: 'bg_decor', body: {x: 0, y: 0, width: 64, height: 64} },
            { key: 'street_vert_se_int', type: 'bg_decor', body: {x: 0, y: 0, width: 64, height: 64} },
            { key: 'street_vert_sw_int', type: 'bg_decor', body: {x: 0, y: 0, width: 64, height: 64} },
            { key: 'street_vert_w', type: 'bg_decor', body: {x: 0, y: 0, width: 64, height: 64} },
            // Touchables:
            { key: 'building_entrance', type: 'custom', body: {x: 0, y: 0, width: 72, height: 1} },
            { key: 'building_exit', type: 'custom', body: {x: 0, y: 0, width: 72, height: 1} },
            { key: 'blue_chest', type: 'custom', body: {x: 0, y: 20, width: 48, height: 20} },
            { key: 'common_chest', type: 'custom', body: {x: 0, y: 21, width: 48, height: 20} },
            { key: 'red_chest', type: 'custom', body: {x: 0, y: 20, width: 48, height: 20} },
            // Interactables:
            { key: 'church_piano', type: 'custom', body: {x: 0, y: 50, width: 128, height: 50} },
        ].forEach(d => {
            SCENERY_DEFS.set(d.key, d as GSceneryDef);
        });
    }

    export function def(key: string): GSceneryDef {
        return SCENERY_DEFS.get(key) as GSceneryDef;
    }

    export function create(plan: GSceneryPlan, decorRenderer?: Phaser.GameObjects.RenderTexture) {
        const sceneryDef: GSceneryDef = def(plan.key);
        switch (sceneryDef.type) {
            case 'bg_decor':
                new GBackgroundDecoration(plan.key, plan.x, plan.y, decorRenderer as Phaser.GameObjects.RenderTexture);
                break;
            case 'fg_decor':
                new GForegroundDecoration(sceneryDef, plan.x, plan.y);
                break;
            case 'static':
                new GObstacleStatic(sceneryDef, plan.x, plan.y);
                break;
            default:
                // If not decor or static obstacle, it is "custom": look it up specifically by key.
                // These require additional info not in the scenery def, possibly even their own class.
                switch(plan.key) {
                    case 'campfire':
                        new GObstacleSprite(def('campfire') as GSceneryDef, plan.x, plan.y, 7, 10);
                        break;
                    case 'common_chest':
                    case 'blue_chest':
                    case 'red_chest':
                        new GTreasureChest(plan.x, plan.y, plan.key);
                        break;
                    case 'church_front':
                        new GChurchHouse(plan.x, plan.y);
                        new GBuildingEntrance(plan.x + 162, plan.y + 409);
                        break;
                    case 'travel_agency':
                        new GTravelAgency(plan.x, plan.y);
                        break;
                    case 'travel_agency_front':
                        new GSpiritTravelAgency(plan.x, plan.y);
                        break;
                    case 'church_piano':
                        new GPiano(plan.x, plan.y);
                        break;
                }
        }
    }

    export function getRandomSceneryZoneTemplate(): GRect[] {
        return GFF.GAME.cache.json.get('zone_template_' + RANDOM.randInt(1, 8));
    }
}