import 'phaser';
import { GRect, GSceneryDef, GSceneryPlan } from './types';
import { GFF } from './main';
import { GRandom } from './GRandom';
import { GBackgroundDecoration } from './objects/decorations/GBackgroundDecoration';
import { GObstacleStatic } from './objects/obstacles/GObstacleStatic';
import { GObstacleSprite } from './objects/obstacles/GObstacleSprite';
import { GForegroundDecoration } from './objects/decorations/GForegroundDecoration';
import { GTreasureChest } from './objects/GTreasureChest';

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
    export const ROCK_WALL_N_DEF: GSceneryDef = { key: 'rock_wall_n', type: 'static', body: WALL_N_BODY };
    export const ROCK_WALL_E_DEF: GSceneryDef = { key: 'rock_wall_e', type: 'static', body: WALL_E_BODY };
    export const ROCK_WALL_S_DEF: GSceneryDef = { key: 'rock_wall_s', type: 'static', body: WALL_S_BODY };
    export const ROCK_WALL_W_DEF: GSceneryDef = { key: 'rock_wall_w', type: 'static', body: WALL_W_BODY };
    export const ROCK_WALL_NW_DEF: GSceneryDef = { key: 'rock_wall_nw', type: 'static', body: {x: 0, y: 0, width: 114, height: 87} };
    export const ROCK_WALL_NE_DEF: GSceneryDef = { key: 'rock_wall_ne', type: 'static', body: {x: 0, y: 0, width: 116, height: 87} };
    export const ROCK_WALL_SE_DEF: GSceneryDef = { key: 'rock_wall_se', type: 'static', body: {x: 0, y: 0, width: 58, height: 161} };
    export const ROCK_WALL_SW_DEF: GSceneryDef = { key: 'rock_wall_sw', type: 'static', body: {x: 0, y: 0, width: 58, height: 161} };

    const SCENERY_DEFS: Map<string, GSceneryDef> = new Map<string, GSceneryDef>();

    export function initSceneryDefs() {
        [
            // Obstacles:
            { key: 'barrel_cactus', type: 'static', body: {x: 7, y: 50, width: 64, height: 27} },
            { key: 'boulder', type: 'static', body: {x: 0, y: 22, width: 64, height: 24} },
            { key: 'bush', type: 'static', body: {x: 0, y: 36, width: 64, height: 16} },
            { key: 'campfire', type: 'sprite', body: {x: 0, y: 98, width: 112, height: 50} },
            { key: 'desert_boulder', type: 'static', body: {x: 0, y: 22, width: 64, height: 24} },
            { key: 'oak_tree', type: 'static', body: {x: 76, y: 200, width: 116, height: 36} },
            { key: 'pine_tree', type: 'static', body: {x: 70, y: 264, width: 78, height: 36} },
            { key: 'paddle_cactus', type: 'static', body: {x: 8, y: 81, width: 102, height: 30} },
            { key: 'rock_column', type: 'static', body: {x: 0, y: 240, width: 159, height: 40} },
            { key: 'shrine_pillar', type: 'static', body: {x: 0, y: 113, width: 64, height: 25} },
            { key: 'shrub', type: 'static', body: {x: 0, y: 41, width: 64, height: 16} },
            { key: 'spines_rocks', type: 'static', body: {x: 0, y: 38, width: 70, height: 14} },
            { key: 'tall_cactus', type: 'static', body: {x: 46, y: 195, width: 32, height: 24} },
            { key: 'tree_stump', type: 'static', body: {x: 0, y: 20, width: 115, height: 36} },
            { key: 'wonky_tree', type: 'static', body: {x: 54, y: 130, width: 64, height: 30} },
            // Foreground Decorations:
            { key: 'big_flower', type: 'fg_decor', body: {x: 0, y: 0, width: 20, height: 44} },
            { key: 'field_grass', type: 'fg_decor', body: {x: 0, y: 0, width: 64, height: 46} },
            { key: 'grass_tuft', type: 'fg_decor', body: {x: 0, y: 0, width: 64, height: 43} },
            // Background Decorations:
            { key: 'flower_patch_1', type: 'bg_decor', body: {x: 0, y: 0, width: 40, height: 30} },
            { key: 'flower_patch_2', type: 'bg_decor', body: {x: 0, y: 0, width: 50, height: 44} },
            { key: 'steer_skull', type: 'bg_decor', body: {x: 0, y: 0, width: 64, height: 32} },
            { key: 'shrine_pedestal', type: 'bg_decor', body: {x: 0, y: 0, width: 64, height: 47} },
            // Interactables:
            { key: 'common_chest', type: 'interactable', body: {x: 0, y: 21, width: 48, height: 20} },
            { key: 'premium_chest', type: 'interactable', body: {x: 0, y: 20, width: 48, height: 20} },
        ].forEach(d => {
            SCENERY_DEFS.set(d.key, d as GSceneryDef);
        });
    }

    export function def(key: string): GSceneryDef {
        return SCENERY_DEFS.get(key) as GSceneryDef;
    }

    export function create(plan: GSceneryPlan, decorRenderer: Phaser.GameObjects.RenderTexture) {
        const sceneryDef: GSceneryDef = def(plan.key);
        switch (sceneryDef.type) {
            case 'bg_decor':
                new GBackgroundDecoration(plan.key, plan.x, plan.y, decorRenderer);
                break;
            case 'fg_decor':
                new GForegroundDecoration(sceneryDef, plan.x, plan.y);
                break;
            case 'static':
                new GObstacleStatic(sceneryDef, plan.x, plan.y);
                break;
            default:
                // If not decor or static obstacle, look it up specifically by key:
                switch(plan.key) {
                    case 'campfire':
                        new GObstacleSprite(def('campfire') as GSceneryDef, plan.x, plan.y, 7, 10);
                        break;
                    case 'common_chest':
                        new GTreasureChest(plan.x, plan.y, false);
                        break;
                    case 'premium_chest':
                        new GTreasureChest(plan.x, plan.y, true);
                        break;
                }
        }
    }

    export function getRandomSceneryZoneTemplate(): GRect[] {
        return GFF.GAME.cache.json.get('zone_template_' + GRandom.randInt(1, 3));
    }
}