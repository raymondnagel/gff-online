import 'phaser';
import { GPineTree } from './objects/obstacles/GPineTree';
import { GAdventureContent } from './scenes/GAdventureContent';
import { GOakTree } from './objects/obstacles/GOakTree';
import { GCampfire } from './objects/obstacles/GCampfire';
import { GRect, GSceneryDef, GSceneryPlan } from './types';
import { GFF } from './main';
import { GRandom } from './GRandom';
import { GBoulder } from './objects/obstacles/GBoulder';
import { GBackgroundDecoration } from './objects/decorations/GBackgroundDecoration';
import { GBigFlower } from './objects/decorations/GBigFlower';
import { GFieldGrass } from './objects/decorations/GFieldGrass';
import { GGrassTuft } from './objects/decorations/GGrassTuft';
import { GTreeStump } from './objects/obstacles/GTreeStump';
import { GSpinesRocks } from './objects/obstacles/GSpinesRocks';
import { GTallCactus } from './objects/obstacles/GTallCactus';
import { GPaddleCactus } from './objects/obstacles/GPaddleCactus';
import { GBarrelCactus } from './objects/obstacles/GBarrelCactus';
import { GRockColumn } from './objects/obstacles/GRockColumn';
import { GDesertBoulder } from './objects/obstacles/GDesertBoulder';
import { GWonkyTree } from './objects/obstacles/GWonkyTree';

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
    export const ROCK_WALL_N_DEF: GSceneryDef = { key: 'rock_wall_n', body: WALL_N_BODY };
    export const ROCK_WALL_E_DEF: GSceneryDef = { key: 'rock_wall_e', body: WALL_E_BODY };
    export const ROCK_WALL_S_DEF: GSceneryDef = { key: 'rock_wall_s', body: WALL_S_BODY };
    export const ROCK_WALL_W_DEF: GSceneryDef = { key: 'rock_wall_w', body: WALL_W_BODY };
    export const ROCK_WALL_NW_DEF: GSceneryDef = { key: 'rock_wall_nw', body: {x: 0, y: 0, width: 114, height: 87} };
    export const ROCK_WALL_NE_DEF: GSceneryDef = { key: 'rock_wall_ne', body: {x: 0, y: 0, width: 116, height: 87} };
    export const ROCK_WALL_SE_DEF: GSceneryDef = { key: 'rock_wall_se', body: {x: 0, y: 0, width: 58, height: 161} };
    export const ROCK_WALL_SW_DEF: GSceneryDef = { key: 'rock_wall_sw', body: {x: 0, y: 0, width: 58, height: 161} };
    // Obstacles:
    export const BARREL_CACTUS_DEF: GSceneryDef = { key: 'barrel_cactus', body: {x: 7, y: 50, width: 64, height: 27} };
    export const BOULDER_DEF: GSceneryDef = { key: 'boulder', body: {x: 0, y: 22, width: 64, height: 24} };
    export const CAMPFIRE_DEF: GSceneryDef = { key: 'campfire', body: {x: 0, y: 98, width: 112, height: 50} };
    export const DESERT_BOULDER_DEF: GSceneryDef = { key: 'desert_boulder', body: {x: 0, y: 22, width: 64, height: 24} };
    export const OAK_TREE_DEF: GSceneryDef = { key: 'oak_tree', body: {x: 76, y: 200, width: 116, height: 36} };
    export const PINE_TREE_DEF: GSceneryDef = { key: 'pine_tree', body: {x: 70, y: 264, width: 78, height: 36} };
    export const PADDLE_CACTUS_DEF: GSceneryDef = { key: 'paddle_cactus', body: {x: 8, y: 81, width: 102, height: 30} };
    export const ROCK_COLUMN_DEF: GSceneryDef = { key: 'rock_column', body: {x: 0, y: 240, width: 159, height: 40} };
    export const SPINES_ROCKS_DEF: GSceneryDef = { key: 'spines_rocks', body: {x: 0, y: 38, width: 70, height: 14} };
    export const TALL_CACTUS_DEF: GSceneryDef = { key: 'tall_cactus', body: {x: 46, y: 195, width: 32, height: 24} };
    export const TREE_STUMP_DEF: GSceneryDef = { key: 'tree_stump', body: {x: 0, y: 20, width: 115, height: 36} };
    export const WONKY_TREE_DEF: GSceneryDef = { key: 'wonky_tree', body: {x: 54, y: 130, width: 64, height: 30} };
    // Foreground Decorations:
    export const BIG_FLOWER_DEF: GSceneryDef = { key: 'big_flower', body: {x: 0, y: 0, width: 20, height: 44} };
    export const FIELD_GRASS_DEF: GSceneryDef = { key: 'field_grass', body: {x: 0, y: 0, width: 64, height: 46} };
    export const GRASS_TUFT_DEF: GSceneryDef = { key: 'grass_tuft', body: {x: 0, y: 0, width: 64, height: 43} };
    // Background Decorations:
    export const FLOWER_PATCH_1_DEF: GSceneryDef = { key: 'flower_patch_1', body: {x: 0, y: 0, width: 40, height: 30} };
    export const FLOWER_PATCH_2_DEF: GSceneryDef = { key: 'flower_patch_2', body: {x: 0, y: 0, width: 50, height: 44} };
    export const STEER_SKULL_DEF: GSceneryDef = { key: 'steer_skull', body: {x: 0, y: 0, width: 64, height: 32} };
    export const SHRINE_PEDESTAL_DEF: GSceneryDef = { key: 'shrine_pedestal', body: {x: 0, y: 0, width: 64, height: 47} };

    export function create(
        imageKey: string,
        x: number,
        y: number,
        decorRenderer: Phaser.GameObjects.RenderTexture
    ) {
        switch (imageKey) {
            case 'barrel_cactus':
                new GBarrelCactus(x, y);
                break;
            case 'big_flower':
                new GBigFlower(x, y);
                break;
            case 'boulder':
                new GBoulder(x, y);
                break;
            case 'campfire':
                new GCampfire(x, y);
                break;
            case 'desert_boulder':
                new GDesertBoulder(x, y);
                break;
            case 'field_grass':
                new GFieldGrass(x, y);
                break;
            case 'grass_tuft':
                new GGrassTuft(x, y);
                break;
            case 'oak_tree':
                new GOakTree(x, y);
                break;
            case 'paddle_cactus':
                new GPaddleCactus(x, y);
                break;
            case 'pine_tree':
                new GPineTree(x, y);
                break;
            case 'rock_column':
                new GRockColumn(x, y);
                break;
            case 'spines_rocks':
                new GSpinesRocks(x, y);
                break;
            case 'tall_cactus':
                new GTallCactus(x, y);
                break;
            case 'tree_stump':
                new GTreeStump(x, y);
                break;
            case 'wonky_tree':
                new GWonkyTree(x, y);
                break;
            default:
                new GBackgroundDecoration(imageKey, x, y, decorRenderer);
                break;
        }
    }

    export function getRandomSceneryZoneTemplate(): GRect[] {
        return GFF.GAME.cache.json.get('zone_template_' + GRandom.randInt(1, 3));
    }
}