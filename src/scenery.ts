import 'phaser';
import { GPineTree } from './objects/obstacles/GPineTree';
import { GAdventureContent } from './scenes/GAdventureContent';
import { GOakTree } from './objects/obstacles/GOakTree';
import { GCampfire } from './objects/obstacles/GCampfire';
import { GRect, GSceneryDef, GSceneryPlan } from './types';
import { GFF } from './main';
import { GRandom } from './GRandom';
import { GBoulder } from './objects/obstacles/GBoulder';
import { GDecoration } from './objects/GDecoration';

export namespace SCENERY {

    /**
     * These scenery definitions can be used for both obstacles (physical objects) and decorations (non-physical
     * background graphics). The create() method interprets the key to create the right type of object.
     *
     * For obstacles, the body is used for planning to prevent overlaps, and to physically-obstruct characters.
     * For decorations, the body is only used for planning to prevent overlaps.
     */
    // Obstacles:
    export const BOULDER_DEF: GSceneryDef = { key: 'boulder', body: {x: 0, y: 22, width: 64, height: 24} };
    export const CAMPFIRE_DEF: GSceneryDef = { key: 'campfire', body: {x: 0, y: 98, width: 112, height: 50} };
    export const OAK_TREE_DEF: GSceneryDef = { key: 'oak_tree', body: {x: 76, y: 200, width: 116, height: 36} };
    export const PINE_TREE_DEF: GSceneryDef = { key: 'pine_tree', body: {x: 70, y: 264, width: 78, height: 36} };
    // Decorations:
    export const SHRINE_PEDESTAL_DEF: GSceneryDef = { key: 'shrine_pedestal', body: {x: 0, y: 0, width: 64, height: 47} };

    export function create(
        imageKey: string,
        x: number,
        y: number,
        decorRenderer: Phaser.GameObjects.RenderTexture
    ) {
        switch (imageKey) {
            case 'boulder':
                new GBoulder(x, y);
                break;
            case 'campfire':
                new GCampfire(x, y);
                break;
            case 'oak_tree':
                new GOakTree(x, y);
                break;
            case 'pine_tree':
                new GPineTree(x, y);
                break;
            default:
                new GDecoration(imageKey, x, y, decorRenderer);
                break;
        }
    }

    export function getRandomSceneryZoneTemplate(): GRect[] {
        return GFF.GAME.cache.json.get('zone_template_' + GRandom.randInt(1, 3));
    }
}