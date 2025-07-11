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
            // Buildings:
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
                    case 'church_house':
                        new GChurchHouse(plan.x, plan.y);
                        new GBuildingEntrance(plan.x + 118, plan.y + 363);
                        break;
                    case 'travel_agency':
                        new GTravelAgency(plan.x, plan.y);
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