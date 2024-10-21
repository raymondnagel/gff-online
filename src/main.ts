import 'phaser';
import { GLoadingScene } from './scenes/GLoadingScene';
import { GTitleContent } from './scenes/GTitleContent';
import { GAdventureContent } from './scenes/GAdventureContent';
import { GAdventureMode } from './game_modes/GAdventureMode';
import { GTitleMode } from './game_modes/GTitleMode';
import { GAdventureUI } from './scenes/GAdventureUI';
import { GBaseScene } from './scenes/GBaseScene';
import { GBattleMode } from './game_modes/GBattleMode';
import { GMainMenuMode } from './game_modes/GMainMenuMode';
import { GStatusMode } from './game_modes/GStatusMode';
import { GBooksMode } from './game_modes/GBooksMode';
import { GBibleMode } from './game_modes/GBibleMode';
import { GPeopleMode } from './game_modes/GPeopleMode';
import { GMapMode } from './game_modes/GMapMode';
import { GStatsMode } from './game_modes/GStatsMode';
import { GGlossaryMode } from './game_modes/GGlossaryMode';
import { GOptionsMode } from './game_modes/GOptionsMode';
import { GBattleContent } from './scenes/GBattleContent';
import { GStatusUI } from './scenes/GStatusUI';
import { GBooksUI } from './scenes/GBooksUI';
import { GBibleUI } from './scenes/GBibleUI';
import { GPeopleUI } from './scenes/GPeopleUI';
import { GMapUI } from './scenes/GMapUI';
import { GStatsUI } from './scenes/GStatsUI';
import { GGlossaryUI } from './scenes/GGlossaryUI';
import { GOptionsUI } from './scenes/GOptionsUI';
import { GMainMenuContent } from './scenes/GMainMenuContent';
import { GDifficulty } from './types';

const gameWidth: number = 1024;
const gameHeight: number = 768;

let configObject: Phaser.Types.Core.GameConfig = {
    type: Phaser.WEBGL,
    antialiasGL: false,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'thegame',
        width: gameWidth,
        height: gameHeight
    },
    physics: {
        default: 'arcade'
    },
    scene: [
        GLoadingScene,
        GTitleContent,
        GMainMenuContent,
        GAdventureContent, GAdventureUI,
        GBattleContent,
        GStatusUI,
        GBooksUI,
        GBibleUI,
        GPeopleUI,
        GMapUI,
        GStatsUI,
        GGlossaryUI,
        GOptionsUI
    ]
};

export namespace GFF {
    export const GAME: Phaser.Game = new Phaser.Game(configObject);

    export const GAME_W: number = gameWidth;
    export const GAME_H: number = gameHeight;

    export const ADV_UI_W: number = GAME_W;
    export const ADV_UI_H: number = 64;

    export const TILE_W: number = 64;
    export const TILE_H: number = 64;

    export const ROOM_X: number = 0;
    export const ROOM_Y: number = 0;
    export const ROOM_BORDER: number = 0;
    export const ROOM_W: number = GAME_W - ROOM_BORDER * 2;
    export const ROOM_H: number = GAME_H - ADV_UI_H - (ROOM_BORDER * 2);

    export const LEFT_BOUND: number  = ROOM_X + ROOM_BORDER;
    export const RIGHT_BOUND: number  = (ROOM_X + ROOM_W) - (ROOM_BORDER);
    export const TOP_BOUND: number  = ROOM_Y + ROOM_BORDER;
    export const BOTTOM_BOUND: number  = (ROOM_Y + ROOM_H) - (ROOM_BORDER);

    export const CHAR_W: number = 100;
    export const CHAR_H: number = 100;

    export const CHAR_BODY_W: number = 36;
    export const CHAR_BODY_H: number = 16;
    export const CHAR_BODY_X_OFF: number = 32;
    export const CHAR_BODY_Y_OFF: number = 84;

    /**
     * List of all game modes.
     * The mode represents an operational section of the game, and determines
     * which elements are displayed, how player input is interpreted and applied,
     * and what sequences of events happen. Only one mode at a time is active.
     * Modes may contain a content scene, a UI scene, or both.
     */
    export const TITLE_MODE: GTitleMode = new GTitleMode();
    export const MAINMENU_MODE: GMainMenuMode = new GMainMenuMode();
    export const ADVENTURE_MODE: GAdventureMode = new GAdventureMode();
    export const BATTLE_MODE: GBattleMode = new GBattleMode();
    export const STATUS_MODE: GStatusMode = new GStatusMode();
    export const BOOKS_MODE: GBooksMode = new GBooksMode();
    export const BIBLE_MODE: GBibleMode = new GBibleMode();
    export const PEOPLE_MODE: GPeopleMode = new GPeopleMode();
    export const MAP_MODE: GMapMode = new GMapMode();
    export const STATS_MODE: GStatsMode = new GStatsMode();
    export const GLOSSARY_MODE: GGlossaryMode = new GGlossaryMode();
    export const OPTIONS_MODE: GOptionsMode = new GOptionsMode();

    export const DIFFICULTY_BABE: GDifficulty = {
        levelName: 'Babe',
        enemyBaseAttack: 5,
        enemyAttackPerLevel: 2,
        enemyBaseResist: 10,
        enemyResistPerLevel: 10,
        enemySpeed: .9
    };
    export const DIFFICULTY_DISCIPLE: GDifficulty = {
        levelName: 'Disciple',
        enemyBaseAttack: 10,
        enemyAttackPerLevel: 3,
        enemyBaseResist: 20,
        enemyResistPerLevel: 20,
        enemySpeed: 1.0
    };
    export const DIFFICULTY_SOLDIER: GDifficulty = {
        levelName: 'Soldier',
        enemyBaseAttack: 15,
        enemyAttackPerLevel: 4,
        enemyBaseResist: 30,
        enemyResistPerLevel: 30,
        enemySpeed: 1.1
    };

    export let Difficulty: GDifficulty = DIFFICULTY_DISCIPLE;

    /**
     * For convenience, when we need to reference a particular Scene
     * that is used ALL the time, just assign it here and use GFF.TheScene
     */
    export let AdventureContent: GAdventureContent;
    export let AdventureUI: GAdventureUI;
    export let BattleContent: GBattleContent;

    export let gameLogging: boolean = false;
    export let showNametags: boolean = false;

    export function log(something: any) {
        if (gameLogging) {
            console.log(something);
        }
    }

    export function logSceneObjects(scene: GBaseScene) {
        let objs: Phaser.GameObjects.GameObject[] = scene.children.getChildren();
        objs.forEach(n => {
            let body = n.body ?? '';
            console.log(`${n.type} = "${n.name}"; body: ${body}; active: ${n.active}`);
        });
    }

    export const TEST_INFO =
`Thanks for trying out the current version of "The Good Fight of Faith"!\n
The game is still in very early stages of development; most of the work thus far has been\n
on core systems like animation, character movement, sound, conversations, and collisions.\n
But it's playable! You can walk around, and go in front of or behind obstacles and people.\n
If you go to the right or bottom edge of the screen, you can move on to the next room.\n
There are a few people wandering around in each room. You can talk to them.\n
Watch out for the devils! They can appear out of nowhere, and if they catch you,\n
they will steal some of your faith! (Once I get the Battle Mode set up, a scripture\n
battle will open instead.)\n
Don't pay too much attention to the arrangement of scenery (trees, campfires, etc.);\n
they are just sprinkled randomly for testing right now.\n
\n
CONTROLS:\n
Hold down [Arrow] keys to walk. You can hold two directions (e.g. 'up' + 'right') to walk diagonally.\n
Hold [Shift] key at the same time to run instead.\n
Hold down [N] to view name tags for all characters. (Names will only be shown if you have met them already.)\n
Press [P] to pause/unpause the game.\n
Press [Y] to show a simple test popup.\n
Press [T] to do a simple test solo conversation.\n
Press [Space] to talk to another person if they are in front of Adam.\n
In a conversation, press [Enter] to continue on.\n
If you see a selection highlighted in yellow, you can use the [Arrow] keys to make a\n
choice, and then press [Enter] to continue.\n
\n
Have fun! :)`;

}
