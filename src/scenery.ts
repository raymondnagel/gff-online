import 'phaser';
import { CardDir, Dir8, Dir9, GRect, GSceneryDef, GSceneryPlan } from './types';
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
import { GSpiritTravelAgency } from './objects/obstacles/GSpiritTravelAgency';
import { GOverheadDecoration } from './objects/decorations/GOverheadDecoration';
import { GCorruptionPatch } from './objects/decorations/GCorruptionPatch';
import { GStaircaseThreshold } from './objects/touchables/GStaircaseThreshold';
import { GFalseStaircaseThreshold } from './objects/touchables/GFalseStaircaseThreshold';
import { GIllusionaryBlock } from './objects/touchables/GIllusionaryBlock';
import { GDevilStatue } from './objects/obstacles/GDevilStatue';
import { GTeleporter } from './objects/touchables/GTeleporter';
import { GCellLockedDoor } from './objects/touchables/GCellLockedDoor';
import { GRoom } from './GRoom';
import { AREA } from './area';
import { GOverheadAnimatedDecoration } from './objects/decorations/GOverheadAnimatedDecoration';
import { GBackgroundAnimatedDecoration } from './objects/decorations/GBackgroundAnimatedDecoration';
import { GForegroundAnimatedDecoration } from './objects/decorations/GForegroundAnimatedDecoration';
import { GHiddenTrap } from './objects/touchables/GHiddenTrap';
import { DIRECTION } from './direction';
import { DEPTH } from './depths';

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

    const SCENERY_DEFS: Map<string, GSceneryDef> = new Map<string, GSceneryDef>();

    export function initSceneryDefs() {
        [
            // WALLS:
            // Church Walls:
            { key: 'church_wall_n_left', type: 'static', body: {x: 0, y: 0, width: 485, height: 64} },
            { key: 'church_wall_n_right', type: 'static', body: {x: 0, y: 0, width: 485, height: 64} },
            { key: 'church_wall_n_mid', type: 'static', body: {x: 0, y: 0, width: 54, height: 64} },
            { key: 'church_wall_s_left', type: 'static', body: {x: 0, y: 102, width: 485, height: 26} },
            { key: 'church_wall_s_right', type: 'static', body: {x: 0, y: 102, width: 485, height: 26} },
            { key: 'church_wall_s_door', type: 'static', body: {x: 0, y: 102, width: 84, height: 26} },
            { key: 'church_wall_w_top', type: 'static', body: {x: 0, y: 0, width: 64, height: 236} },
            { key: 'church_wall_w_bottom', type: 'static', body: {x: 0, y: 0, width: 64, height: 320} },
            { key: 'church_wall_w_mid', type: 'static', body: {x: 0, y: 0, width: 64, height: 148} },
            { key: 'church_wall_e_top', type: 'static', body: {x: 0, y: 0, width: 64, height: 236} },
            { key: 'church_wall_e_bottom', type: 'static', body: {x: 0, y: 0, width: 64, height: 320} },
            { key: 'church_wall_e_mid', type: 'static', body: {x: 0, y: 0, width: 64, height: 148} },
            { key: 'church_wall_nw_corner', type: 'static', body: {x: 0, y: 0, width: 64, height: 66} },
            { key: 'church_wall_ne_corner', type: 'static', body: {x: 17, y: 0, width: 64, height: 66} },
            { key: 'church_wall_sw_corner', type: 'static', body: {x: 0, y: 0, width: 64, height: 128} },
            { key: 'church_wall_se_corner', type: 'static', body: {x: 0, y: 0, width: 64, height: 128} },
            // Stronghold Walls:
            { key: 'hold_wall_n_left', type: 'static', body: {x: 0, y: 0, width: 485, height: 64} },
            { key: 'hold_wall_n_right', type: 'static', body: {x: 0, y: 0, width: 485, height: 64} },
            { key: 'hold_wall_n_mid', type: 'static', body: {x: 0, y: 0, width: 54, height: 64} },
            { key: 'hold_wall_n_door_lower', type: 'static', body: {x: 0, y: 0, width: 84, height: 64} },
            { key: 'hold_wall_n_door_upper', type: 'static', body: {x: 0, y: 0, width: 128, height: 64} },
            { key: 'hold_wall_s_left', type: 'static', body: {x: 0, y: 64, width: 485, height: 64} },
            { key: 'hold_wall_s_right', type: 'static', body: {x: 0, y: 64, width: 485, height: 64} },
            { key: 'hold_wall_s_mid', type: 'static', body: {x: 0, y: 64, width: 54, height: 64} },
            { key: 'hold_wall_s_door', type: 'static', body: {x: 0, y: 64, width: 84, height: 64} },
            { key: 'hold_wall_w_top', type: 'static', body: {x: 0, y: 0, width: 64, height: 236} },
            { key: 'hold_wall_w_bottom', type: 'static', body: {x: 0, y: 0, width: 64, height: 320} },
            { key: 'hold_wall_w_mid', type: 'static', body: {x: 0, y: 0, width: 64, height: 148} },
            { key: 'hold_wall_w_door_lower', type: 'static', body: {x: 0, y: 0, width: 64, height: 84} },
            { key: 'hold_wall_w_door_upper', type: 'static', body: {x: 0, y: 0, width: 64, height: 148} },
            { key: 'hold_wall_e_top', type: 'static', body: {x: 0, y: 0, width: 64, height: 236} },
            { key: 'hold_wall_e_bottom', type: 'static', body: {x: 0, y: 0, width: 64, height: 320} },
            { key: 'hold_wall_e_mid', type: 'static', body: {x: 0, y: 0, width: 64, height: 148} },
            { key: 'hold_wall_e_door_lower', type: 'static', body: {x: 0, y: 0, width: 64, height: 84} },
            { key: 'hold_wall_e_door_upper', type: 'static', body: {x: 0, y: 0, width: 64, height: 148} },
            { key: 'hold_wall_nw_corner', type: 'static', body: {x: 0, y: 0, width: 64, height: 66} },
            { key: 'hold_wall_ne_corner', type: 'static', body: {x: 17, y: 0, width: 64, height: 66} },
            { key: 'hold_wall_sw_corner', type: 'static', body: {x: 0, y: 0, width: 64, height: 128} },
            { key: 'hold_wall_se_corner', type: 'static', body: {x: 0, y: 0, width: 64, height: 128} },
            // Rock Walls:
            { key: 'rock_wall_n', type: 'static', body: WALL_N_BODY },
            { key: 'rock_wall_e', type: 'static', body: WALL_E_BODY },
            { key: 'rock_wall_s', type: 'static', body: WALL_S_BODY },
            { key: 'rock_wall_w', type: 'static', body: WALL_W_BODY },
            { key: 'rock_wall_nw', type: 'static', body: {x: 0, y: 0, width: 114, height: 87} },
            { key: 'rock_wall_ne', type: 'static', body: {x: 0, y: 0, width: 116, height: 87} },
            { key: 'rock_wall_se', type: 'static', body: {x: 0, y: 0, width: 57, height: 161} },
            { key: 'rock_wall_sw', type: 'static', body: {x: 0, y: 0, width: 58, height: 161} },
            // Plain Walls:
            { key: 'plain_wall_n', type: 'static', body: WALL_N_BODY },
            { key: 'plain_wall_e', type: 'static', body: WALL_E_BODY },
            { key: 'plain_wall_s', type: 'static', body: WALL_S_BODY },
            { key: 'plain_wall_w', type: 'static', body: WALL_W_BODY },
            { key: 'plain_wall_nw', type: 'static', body: {x: 0, y: 0, width: 114, height: 87} },
            { key: 'plain_wall_ne', type: 'static', body: {x: 0, y: 0, width: 116, height: 87} },
            { key: 'plain_wall_se', type: 'static', body: {x: 0, y: 0, width: 57, height: 161} },
            { key: 'plain_wall_sw', type: 'static', body: {x: 0, y: 0, width: 58, height: 161} },
            // Desert Walls:
            { key: 'desert_wall_n', type: 'static', body: WALL_N_BODY },
            { key: 'desert_wall_e', type: 'static', body: WALL_E_BODY },
            { key: 'desert_wall_s', type: 'static', body: WALL_S_BODY },
            { key: 'desert_wall_w', type: 'static', body: WALL_W_BODY },
            { key: 'desert_wall_nw', type: 'static', body: {x: 0, y: 0, width: 114, height: 87} },
            { key: 'desert_wall_ne', type: 'static', body: {x: 0, y: 0, width: 116, height: 87} },
            { key: 'desert_wall_se', type: 'static', body: {x: 0, y: 0, width: 57, height: 161} },
            { key: 'desert_wall_sw', type: 'static', body: {x: 0, y: 0, width: 58, height: 161} },
            // Forest Walls:
            { key: 'forest_wall_n', type: 'static', body: WALL_N_BODY },
            { key: 'forest_wall_e', type: 'static', body: WALL_E_BODY },
            { key: 'forest_wall_s', type: 'static', body: WALL_S_BODY },
            { key: 'forest_wall_w', type: 'static', body: WALL_W_BODY },
            { key: 'forest_wall_nw', type: 'static', body: {x: 0, y: 0, width: 114, height: 87} },
            { key: 'forest_wall_ne', type: 'static', body: {x: 0, y: 0, width: 116, height: 87} },
            { key: 'forest_wall_se', type: 'static', body: {x: 0, y: 0, width: 57, height: 161} },
            { key: 'forest_wall_sw', type: 'static', body: {x: 0, y: 0, width: 58, height: 161} },
            // Tundra Walls:
            { key: 'tundra_wall_n', type: 'static', body: WALL_N_BODY },
            { key: 'tundra_wall_e', type: 'static', body: WALL_E_BODY },
            { key: 'tundra_wall_s', type: 'static', body: WALL_S_BODY },
            { key: 'tundra_wall_w', type: 'static', body: WALL_W_BODY },
            { key: 'tundra_wall_nw', type: 'static', body: {x: 0, y: 0, width: 114, height: 87} },
            { key: 'tundra_wall_ne', type: 'static', body: {x: 0, y: 0, width: 116, height: 87} },
            { key: 'tundra_wall_se', type: 'static', body: {x: 0, y: 0, width: 57, height: 161} },
            { key: 'tundra_wall_sw', type: 'static', body: {x: 0, y: 0, width: 63, height: 161} },
            // Mountain Walls:
            { key: 'mount_wall_n', type: 'static', body: WALL_N_BODY },
            { key: 'mount_wall_e', type: 'static', body: WALL_E_BODY },
            { key: 'mount_wall_s', type: 'static', body: WALL_S_BODY },
            { key: 'mount_wall_w', type: 'static', body: WALL_W_BODY },
            { key: 'mount_wall_nw', type: 'static', body: {x: 0, y: 0, width: 114, height: 87} },
            { key: 'mount_wall_ne', type: 'static', body: {x: 0, y: 0, width: 116, height: 87} },
            { key: 'mount_wall_se', type: 'static', body: {x: 0, y: 0, width: 57, height: 161} },
            { key: 'mount_wall_sw', type: 'static', body: {x: 0, y: 0, width: 58, height: 161} },
            // Swamp Walls:
            { key: 'swamp_wall_n', type: 'static', body: WALL_N_BODY },
            { key: 'swamp_wall_e', type: 'static', body: WALL_E_BODY },
            { key: 'swamp_wall_s', type: 'static', body: WALL_S_BODY },
            { key: 'swamp_wall_w', type: 'static', body: WALL_W_BODY },
            { key: 'swamp_wall_nw', type: 'static', body: {x: 0, y: 0, width: 114, height: 87} },
            { key: 'swamp_wall_ne', type: 'static', body: {x: 0, y: 0, width: 116, height: 87} },
            { key: 'swamp_wall_se', type: 'static', body: {x: 0, y: 0, width: 80, height: 120} },
            { key: 'swamp_wall_sw', type: 'static', body: {x: 0, y: 0, width: 80, height: 120} },
            // Obstacles:
            { key: 'barrel_cactus', type: 'static', body: {x: 7, y: 50, width: 64, height: 27} },
            { key: 'bone_pile', type: 'static', body: {x: 11, y: 14, width: 42, height: 15} },
            { key: 'boulder', type: 'static', body: {x: 0, y: 22, width: 64, height: 24} },
            { key: 'bush', type: 'static', body: {x: 0, y: 36, width: 64, height: 16} },
            { key: 'campfire', type: 'custom', body: {x: 0, y: 98, width: 112, height: 50} },
            { key: 'cell_back', type: 'static', body: {x: 0, y: 98, width: 140, height: 7} },
            { key: 'cell_front_left', type: 'static', body: {x: 0, y: 98, width: 52, height: 7} },
            { key: 'cell_front_right', type: 'static', body: {x: 0, y: 98, width: 54, height: 7} },
            { key: 'cell_left', type: 'static', body: {x: 0, y: 100, width: 19, height: 29} },
            { key: 'cell_right', type: 'static', body: {x: 0, y: 100, width: 19, height: 29} },
            { key: 'church_pew', type: 'static', body: {x: 0, y: 55, width: 318, height: 10} },
            { key: 'church_pulpit', type: 'static', body: {x: 0, y: 50, width: 72, height: 37} },
            { key: 'cypress_tree', type: 'static', body: {x: 44, y: 207, width: 144, height: 20} },
            { key: 'desert_boulder', type: 'static', body: {x: 0, y: 22, width: 64, height: 24} },
            { key: 'help_sign', type: 'static', body: {x: 52, y: 72, width: 12, height: 8} },
            { key: 'lava', type: 'custom', body: {x: 0, y: 0, width: 64, height: 64} },
            { key: 'abyss', type: 'custom', body: {x: 0, y: 0, width: 64, height: 64} },
            { key: 'oak_tree', type: 'static', body: {x: 76, y: 200, width: 116, height: 36} },
            { key: 'obelisk', type: 'static', body: {x: 0, y: 126, width: 64, height: 38}, tint: true },
            { key: 'paddle_cactus', type: 'static', body: {x: 8, y: 81, width: 102, height: 30} },
            { key: 'palm_tree', type: 'static', body: {x: 95, y: 179, width: 30, height: 22} },
            { key: 'peak', type: 'static', body: {x: 0, y: 167, width: 300, height: 116} },
            { key: 'pine_tree', type: 'static', body: {x: 70, y: 264, width: 78, height: 36} },
            { key: 'prophet_bed', type: 'static', body: {x: 0, y: 49, width: 141, height: 46} },
            { key: 'prophet_table', type: 'static', body: {x: 0, y: 58, width: 104, height: 36} },
            { key: 'rock_column', type: 'static', body: {x: 0, y: 240, width: 159, height: 40} },
            { key: 'shrine_pillar', type: 'static', body: {x: 0, y: 119, width: 64, height: 21} },
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
            { key: 'torch_base', type: 'custom', body: {x: 0, y: 45, width: 48, height: 24}, tint: true },
            { key: 'torch_flame', type: 'custom', body: {x: 0, y: 0, width: 48, height: 72} },
            { key: 'tree_stump', type: 'static', body: {x: 0, y: 20, width: 115, height: 36} },
            { key: 'wall_block', type: 'static', body: {x: 0, y: 64, width: 64, height: 64}, tint: true },
            { key: 'willow_tree', type: 'static', body: {x: 44, y: 209, width: 131, height: 21} },
            { key: 'wonky_tree', type: 'static', body: {x: 54, y: 130, width: 64, height: 30} },
            // Town Objects:
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
            // Stronghold Buildings:
            { key: 'castle_front', type: 'custom', body: {x: 0, y: 221, width: 401, height: 175} },
            { key: 'dungeon_front', type: 'custom', body: {x: 0, y: 65, width: 343, height: 146} },
            { key: 'fortress_front', type: 'custom', body: {x: 0, y: 145, width: 368, height: 197} },
            { key: 'keep_front', type: 'custom', body: {x: 0, y: 204, width: 289, height: 153} },
            { key: 'tower_front', type: 'custom', body: {x: 0, y: 218, width: 176, height: 144} },
            // Foreground Decorations:
            { key: 'big_flower', type: 'fg_decor', body: {x: 0, y: 0, width: 20, height: 44} },
            { key: 'cattails', type: 'fg_decor', body: {x: 0, y: 0, width: 66, height: 48} },
            { key: 'field_grass', type: 'fg_decor', body: {x: 0, y: 0, width: 64, height: 46} },
            { key: 'grass_tuft', type: 'fg_decor', body: {x: 0, y: 0, width: 64, height: 43} },
            { key: 'mushrooms', type: 'fg_decor', body: {x: 0, y: 0, width: 60, height: 62} },
            { key: 'cell_front_bottom', type: 'fg_decor', body: {x: 0, y: 0, width: 57, height: 8} },
            { key: 'chasm_n', type: 'fg_decor', body: {x: 0, y: 0, width: 64, height: 64}, tint: true },
            { key: 'chasm_w', type: 'fg_decor', body: {x: 0, y: 0, width: 64, height: 64}, tint: true },
            { key: 'chasm_e', type: 'fg_decor', body: {x: 0, y: 0, width: 64, height: 64}, tint: true },
            { key: 'chasm_s', type: 'fg_decor', body: {x: 0, y: 0, width: 64, height: 64}, tint: true },
            { key: 'chasm_nw', type: 'fg_decor', body: {x: 0, y: 0, width: 64, height: 64}, tint: true },
            { key: 'chasm_ne', type: 'fg_decor', body: {x: 0, y: 0, width: 64, height: 64}, tint: true },
            { key: 'chasm_se', type: 'fg_decor', body: {x: 0, y: 0, width: 64, height: 64}, tint: true },
            { key: 'chasm_sw', type: 'fg_decor', body: {x: 0, y: 0, width: 64, height: 64}, tint: true },
            // Background Decorations:
            { key: 'curb_bend_ne', type: 'bg_decor', body: {x: 0, y: 0, width: 74, height: 82} },
            { key: 'curb_bend_nw', type: 'bg_decor', body: {x: 0, y: 0, width: 74, height: 82} },
            { key: 'curb_bend_se', type: 'bg_decor', body: {x: 0, y: 0, width: 74, height: 82} },
            { key: 'curb_bend_sw', type: 'bg_decor', body: {x: 0, y: 0, width: 74, height: 82} },
            { key: 'curb_horz_n', type: 'bg_decor', body: {x: 0, y: 0, width: 73, height: 12} },
            { key: 'curb_horz_s', type: 'bg_decor', body: {x: 0, y: 0, width: 73, height: 9} },
            { key: 'curb_vert_e', type: 'bg_decor', body: {x: 0, y: 0, width: 9, height: 73} },
            { key: 'curb_vert_w', type: 'bg_decor', body: {x: 0, y: 0, width: 9, height: 73} },
            { key: 'emblem_deception', type: 'bg_decor', body: {x: 0, y: 0, width: 64, height: 64}, tint: true },
            { key: 'emblem_doubt', type: 'bg_decor', body: {x: 0, y: 0, width: 64, height: 64}, tint: true },
            { key: 'emblem_wickedness', type: 'bg_decor', body: {x: 0, y: 0, width: 64, height: 64}, tint: true },
            { key: 'emblem_enmity', type: 'bg_decor', body: {x: 0, y: 0, width: 64, height: 64}, tint: true },
            { key: 'emblem_perdition', type: 'bg_decor', body: {x: 0, y: 0, width: 64, height: 64}, tint: true },
            { key: 'entrance_mat', type: 'bg_decor', body: {x: 0, y: 0, width: 192, height: 128}, tint: true },
            { key: 'flower_patch_1', type: 'bg_decor', body: {x: 0, y: 0, width: 40, height: 30} },
            { key: 'flower_patch_2', type: 'bg_decor', body: {x: 0, y: 0, width: 50, height: 44} },
            { key: 'shrine_pedestal', type: 'bg_decor', body: {x: 0, y: 0, width: 64, height: 14} },
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
            { key: 'statue_pedestal', type: 'bg_decor', body: {x: 0, y: 0, width: 64, height: 14}, tint: true },
            { key: 'grate', type: 'bg_decor', body: {x: 0, y: 0, width: 64, height: 64}, tint: true },
            // Overhead Decorations:
            { key: 'shrine_curtain_ctr_red', type: 'oh_decor', body: {x: 0, y: 0, width: 86, height: 48} },
            { key: 'shrine_curtain_left_red', type: 'oh_decor', body: {x: 0, y: 0, width: 86, height: 48} },
            { key: 'shrine_curtain_right_red', type: 'oh_decor', body: {x: 0, y: 0, width: 44, height: 122} },
            { key: 'shrine_curtain_ctr_blue', type: 'oh_decor', body: {x: 0, y: 0, width: 86, height: 48} },
            { key: 'shrine_curtain_left_blue', type: 'oh_decor', body: {x: 0, y: 0, width: 86, height: 48} },
            { key: 'shrine_curtain_right_blue', type: 'oh_decor', body: {x: 0, y: 0, width: 44, height: 122} },
            { key: 'shrine_curtain_ctr_purple', type: 'oh_decor', body: {x: 0, y: 0, width: 86, height: 48} },
            { key: 'shrine_curtain_left_purple', type: 'oh_decor', body: {x: 0, y: 0, width: 86, height: 48} },
            { key: 'shrine_curtain_right_purple', type: 'oh_decor', body: {x: 0, y: 0, width: 44, height: 122} },
            { key: 'shrine_curtain_ctr_gold', type: 'oh_decor', body: {x: 0, y: 0, width: 86, height: 48} },
            { key: 'shrine_curtain_left_gold', type: 'oh_decor', body: {x: 0, y: 0, width: 86, height: 48} },
            { key: 'shrine_curtain_right_gold', type: 'oh_decor', body: {x: 0, y: 0, width: 44, height: 122} },
            { key: 'cell_front_top', type: 'oh_decor', body: {x: 0, y: 0, width: 57, height: 9} },
            { key: 'up_hint', type: 'custom', body: {x: 0, y: 0, width: 29, height: 49} },
            { key: 'down_hint', type: 'custom', body: {x: 0, y: 0, width: 29, height: 49} },
            { key: 'cobweb_w', type: 'oh_decor', body: {x: 0, y: 0, width: 64, height: 64} },
            { key: 'cobweb_e', type: 'oh_decor', body: {x: 0, y: 0, width: 64, height: 64} },
            // Touchables:
            { key: 'black_chest', type: 'custom', body: {x: 0, y: 20, width: 48, height: 20} },
            { key: 'blue_chest', type: 'custom', body: {x: 0, y: 20, width: 48, height: 20} },
            { key: 'brown_chest', type: 'custom', body: {x: 0, y: 20, width: 48, height: 20} },
            { key: 'gold_chest', type: 'custom', body: {x: 0, y: 20, width: 48, height: 20} },
            { key: 'purple_chest', type: 'custom', body: {x: 0, y: 20, width: 48, height: 20} },
            { key: 'red_chest', type: 'custom', body: {x: 0, y: 20, width: 48, height: 20} },
            { key: 'threshold', type: 'custom', body: {x: 0, y: 0, width: 72, height: 1} },
            { key: 'vert_locked_door', type: 'custom', body: {x: 0, y: 13, width: 54, height: 43} },
            { key: 'west_locked_door', type: 'custom', body: {x: 0, y: 0, width: 14, height: 122} },
            { key: 'east_locked_door', type: 'custom', body: {x: 0, y: 0, width: 14, height: 122} },
            { key: 'cell_locked_door', type: 'custom', body: {x: 0, y: 91, width: 58, height: 6} },
            { key: 'teleporter', type: 'custom', body: {x: 0, y: 0, width: 59, height: 30} },
            { key: 'hidden_trap', type: 'custom', body: {x: 21, y: 37, width: 23, height: 8} },
            // Interactables:
            { key: 'church_piano', type: 'custom', body: {x: 0, y: 50, width: 128, height: 50} },
            // Special Cases:
            { key: 'corruption_patch', type: 'custom', body: {x: 0, y: 0, width: 200, height: 200} },
            { key: 'stairs_down', type: 'custom', body: {x: 0, y: 0, width: 100, height: 84}, tint: true },
            { key: 'stairs_up', type: 'custom', body: {x: 0, y: 0, width: 100, height: 84}, tint: true },
            { key: 'devil_statue', type: 'custom', body: {x: -2, y: 86, width: 64, height: 14}, tint: true },
        ].forEach(d => {
            SCENERY_DEFS.set(d.key, d as GSceneryDef);
        });
    }

    export function def(key: string): GSceneryDef {
        // Use switch to resolve any special cases or aliases.
        switch (key) {
            case 'illusionary_block':
                const illusionDef = structuredClone(SCENERY_DEFS.get('wall_block') as GSceneryDef);
                illusionDef.type = 'custom';
                return illusionDef;
            case 'grated_lava':
                return SCENERY_DEFS.get('lava') as GSceneryDef;
            case 'grated_abyss':
                return SCENERY_DEFS.get('abyss') as GSceneryDef;
            case 'stairs_up_false':
                return SCENERY_DEFS.get('stairs_up') as GSceneryDef;
            default:
                return SCENERY_DEFS.get(key) as GSceneryDef;
        }
    }

    export function create(plan: GSceneryPlan, room: GRoom, decorRenderer?: Phaser.GameObjects.RenderTexture) {
        const sceneryDef: GSceneryDef = def(plan.key);
        const stoneTint = room.getStoneTint();
        let sceneryObj: Phaser.GameObjects.GameObject|undefined;
        switch (sceneryDef.type) {
            case 'bg_decor':
                // Background decorations are rendered to a RenderTexture for performance; no new object is created.
                // However, we still create a GBackgroundDecoration object to hold metadata about it.
                // Tint can be applied; but since there is no object, we must pass the tint to be applied during rendering.
                new GBackgroundDecoration(plan.key, plan.x, plan.y, decorRenderer!, sceneryDef.tint ? stoneTint : undefined);
                break;
            case 'fg_decor':
                sceneryObj = new GForegroundDecoration(sceneryDef, plan.x, plan.y);
                break;
            case 'oh_decor':
                sceneryObj = new GOverheadDecoration(sceneryDef, plan.x, plan.y);
                break;
            case 'static':
                sceneryObj = new GObstacleStatic(sceneryDef, plan.x, plan.y);
                break;
            default:
                // If not decor or static obstacle, it is "custom": look it up specifically by key.
                // These require additional info not in the scenery def, possibly even their own class,
                // accompanying objects, or other special setup.
                switch(plan.key) {
                    case 'campfire':
                        sceneryObj = new GObstacleSprite(def('campfire') as GSceneryDef, plan.x, plan.y, 7, 10);
                        break;
                    case 'brown_chest':
                    case 'blue_chest':
                    case 'red_chest':
                    case 'purple_chest':
                    case 'gold_chest':
                    case 'black_chest':
                        sceneryObj = new GTreasureChest(plan.x, plan.y, plan.key);
                        if (plan.key === 'gold_chest') {
                            (sceneryObj as GTreasureChest).addBossTrigger();
                        }
                        break;
                    case 'castle_front':
                        sceneryObj = new GObstacleStatic(sceneryDef, plan.x, plan.y);
                        new GBuildingEntrance(plan.x + 164, plan.y + 396);
                        break;
                    case 'dungeon_front':
                        sceneryObj = new GObstacleStatic(sceneryDef, plan.x, plan.y);
                        new GBuildingEntrance(plan.x + 136, plan.y + 211);
                        break;
                    case 'fortress_front':
                        sceneryObj = new GObstacleStatic(sceneryDef, plan.x, plan.y);
                        new GBuildingEntrance(plan.x + 148, plan.y + 342);
                        break;
                    case 'keep_front':
                        sceneryObj = new GObstacleStatic(sceneryDef, plan.x, plan.y);
                        new GBuildingEntrance(plan.x + 108, plan.y + 357);
                        break;
                    case 'tower_front':
                        sceneryObj = new GObstacleStatic(sceneryDef, plan.x, plan.y);
                        new GBuildingEntrance(plan.x + 52, plan.y + 362);
                        break;
                    case 'church_front':
                        sceneryObj = new GChurchHouse(plan.x, plan.y);
                        new GBuildingEntrance(plan.x + 162, plan.y + 409);
                        break;
                    case 'travel_agency_front':
                        sceneryObj = new GSpiritTravelAgency(plan.x, plan.y);
                        break;
                    case 'stairs_up':
                        if (room.getArea() === AREA.TOWER_AREA) {
                            new GOverheadAnimatedDecoration(def('up_hint'), plan.x + 35, plan.y + 25, 2, 10).setName('up_hint');
                        }
                    case 'stairs_down':
                        sceneryObj = new GObstacleStatic(sceneryDef, plan.x, plan.y).setData('stairs', true);
                        new GStaircaseThreshold(plan.x + 14, plan.y + 84);
                        break;
                    case 'stairs_up_false':
                        sceneryObj = new GObstacleStatic(def('stairs_up'), plan.x, plan.y);
                        new GFalseStaircaseThreshold(plan.x + 14, plan.y + 84);
                        new GOverheadAnimatedDecoration(def('down_hint'), plan.x + 35, plan.y + 25, 2, 10).setName('down_hint');
                        break;
                    case 'illusionary_block':
                        sceneryObj = new GIllusionaryBlock(plan.x, plan.y);
                        break;
                    case 'church_piano':
                        sceneryObj = new GPiano(plan.x, plan.y);
                        break;
                    case 'corruption_patch':
                        sceneryObj = new GCorruptionPatch(plan.x, plan.y, RANDOM.randFloat(0.8, 1.2));
                        break;
                    case 'devil_statue':
                        new GBackgroundDecoration('statue_pedestal', plan.x - 2, plan.y + 86, decorRenderer!, stoneTint);
                        sceneryObj = new GDevilStatue(plan.x, plan.y);
                        // Statues can appear in any stronghold; but only those in the
                        // Fortress of Enmity can burst to spawn real devils.
                        if (room.getArea() === AREA.FORTRESS_AREA) {
                            (sceneryObj as GDevilStatue).addBurstTrigger();
                        }
                        break;
                    case 'teleporter':
                        sceneryObj = new GTeleporter(plan.x, plan.y);
                        break;
                    case 'cell_locked_door':
                        GFF.log(`Creating cell locked door at ${plan.x}, ${plan.y}`);
                        sceneryObj = new GCellLockedDoor(plan.x, plan.y);
                        break;
                    case 'torch_base':
                        sceneryObj = new GObstacleStatic(sceneryDef, plan.x, plan.y);
                        const flame = new GForegroundAnimatedDecoration(def('torch_flame') as GSceneryDef, plan.x, plan.y - 52, 7, 10);
                        flame.setDepth((sceneryObj as GObstacleStatic).depth + 1);
                        break;
                    case 'grated_lava':
                        // Player can walk on grate because the lava is just a decoration underneath.
                        sceneryObj = new GBackgroundAnimatedDecoration(def('lava') as GSceneryDef, plan.x, plan.y, 7, 10);
                        new GBackgroundDecoration('grate', plan.x, plan.y, decorRenderer!, stoneTint);
                        break;
                    case 'lava':
                        // Player can't walk on normal lava because it's an obstacle.
                        sceneryObj = new GObstacleSprite(def('lava') as GSceneryDef, plan.x, plan.y, 7, 10);
                        createChasm(plan, sceneryObj, 'chasm', stoneTint);
                        break;
                    case 'grated_abyss':
                        // Player can walk on grate because the lava is just a decoration underneath.
                        sceneryObj = new GBackgroundAnimatedDecoration(def('abyss') as GSceneryDef, plan.x, plan.y, 11, 10);
                        new GBackgroundDecoration('grate', plan.x, plan.y, decorRenderer!, stoneTint);
                        break;
                    case 'abyss':
                        // Player can't walk on normal abyss because it's an obstacle.
                        sceneryObj = new GObstacleSprite(def('abyss') as GSceneryDef, plan.x, plan.y, 11, 10);
                        createChasm(plan, sceneryObj, 'chasm', stoneTint);
                        break;
                    case 'hidden_trap':
                        sceneryObj = new GHiddenTrap(plan.x, plan.y, stoneTint);
                        break;
                }
            break;
        }
        if (sceneryObj) {
            sceneryObj.setData('id', plan.id);
            sceneryObj.name = plan.key;
            if (
                sceneryDef.tint === true
                && stoneTint !== undefined
                && 'setTint' in sceneryObj
                && typeof sceneryObj.setTint === 'function'
            ) {
                sceneryObj.setTint(stoneTint);
            }
        }
    }

    /**
     * Call this AFTER creating the chasm tiles themselves,
     * so that the chasm edges can be created on top of them.
     *
     * The plan should be something like 'lava', 'water', 'abyss', etc.
     * The edgeKey should be something like 'chasm', 'beach', etc.
     */
    function createChasm(chasmTilePlan: GSceneryPlan, chasmTileObject: Phaser.GameObjects.GameObject, edgeKey: string, stoneTint: number|undefined) {
        // If there is no joins object, we can't do anything. It's probably not even a tile.
        if (chasmTilePlan.joins === undefined) {
            return;
        }

        // Check each joining direction for chasm tiles to determine which edges to place.
        for (let dir of [Dir9.N, Dir9.E, Dir9.S, Dir9.W]) {
            if (!chasmTilePlan.joins[dir as Dir8]) {
                // No join in this direction; place an edge.
                const dirStr = DIRECTION.dir9Texts()[dir];
                const edgeDef = def(`${edgeKey}_${dirStr}`) as GSceneryDef;
                const edgeObj = new GForegroundDecoration(edgeDef, chasmTilePlan.x, chasmTilePlan.y);
                (chasmTileObject as GObstacleStatic).depth = DEPTH.BG_SUBDECOR;
                edgeObj.depth = DEPTH.BG_DECOR;
                edgeObj.setTint(stoneTint);
            }
        }
        // Check each diagnoal direction;
        for (let dir of [Dir9.NE, Dir9.SE, Dir9.SW, Dir9.NW]) {
            if (!chasmTilePlan.joins[dir as Dir8]) {
                // No join in this diagonal direction; check adjacents.
                const [adjDir1, adjDir2] = DIRECTION.getAdjacents(dir) as [Dir8, Dir8];
                if (chasmTilePlan.joins[adjDir1] && chasmTilePlan.joins[adjDir2]) {
                    // Both adjacents are joined; place an inner corner edge.
                    const dirStr = DIRECTION.dir9Texts()[dir];
                    const edgeDef = def(`${edgeKey}_${dirStr}`) as GSceneryDef;
                    const edgeObj = new GForegroundDecoration(edgeDef, chasmTilePlan.x, chasmTilePlan.y);
                    (chasmTileObject as GObstacleStatic).depth = DEPTH.BG_SUBDECOR;
                    edgeObj.depth = DEPTH.BG_DECOR;
                    edgeObj.setTint(stoneTint);
                }
            }
        }
    }

    export function getRandomSceneryZoneTemplate(): GRect[] {
        return GFF.GAME.cache.json.get('zone_template_' + RANDOM.randInt(1, 8));
    }
}