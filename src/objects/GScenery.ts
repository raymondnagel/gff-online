import 'phaser';
import { GPineTree } from './obstacles/GPineTree';
import { GAdventureContent } from '../scenes/GAdventureContent';
import { GOakTree } from './obstacles/GOakTree';
import { GCampfire } from './obstacles/GCampfire';

export namespace GScenery {

    export function create(scene: GAdventureContent, imageKey: string, x: number, y: number) {
        switch (imageKey) {
            case 'campfire':
                new GCampfire(scene, x, y);
                break;
            case 'oak_tree':
                new GOakTree(scene, x, y);
                break;
            case 'pine_tree':
                new GPineTree(scene, x, y);
                break;

        }
    }
}