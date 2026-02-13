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
import { GGlossaryMode } from './game_modes/GGlossaryMode';
import { GOptionsMode } from './game_modes/GOptionsMode';
import { GBattleContent } from './scenes/GBattleContent';
import { GStatusUI } from './scenes/GStatusUI';
import { GBooksUI } from './scenes/GBooksUI';
import { GBibleUI } from './scenes/GBibleUI';
import { GPeopleUI } from './scenes/GPeopleUI';
import { GMapUI } from './scenes/GMapUI';
import { GGlossaryUI } from './scenes/GGlossaryUI';
import { GOptionsUI } from './scenes/GOptionsUI';
import { GMainMenuContent } from './scenes/GMainMenuContent';
import { GDifficulty } from './types';
import { GWorldBuildMode } from './game_modes/GWorldBuildMode';
import { GWorldBuildContent } from './scenes/GWorldBuildContent';
import { REGISTRY } from './registry';
import { GLoadGameMode } from './game_modes/GLoadGameMode';
import { GLoadGameContent } from './scenes/GLoadGameContent';

const gameWidth: number = 1024;
const gameHeight: number = 768;

let configObject: Phaser.Types.Core.GameConfig = {
    type: Phaser.WEBGL,
    antialiasGL: true,
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
        GWorldBuildContent,
        GLoadGameContent,
        GAdventureContent, GAdventureUI,
        GBattleContent,
        GStatusUI,
        GBooksUI,
        GBibleUI,
        GPeopleUI,
        GMapUI,
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

    export const ROOM_AREA_TOP: number = TOP_BOUND + TILE_H;
    export const ROOM_AREA_LEFT: number = LEFT_BOUND + TILE_W;
    export const ROOM_AREA_RIGHT: number = RIGHT_BOUND - TILE_W;
    export const ROOM_AREA_BOTTOM: number = BOTTOM_BOUND - TILE_H;
    export const ROOM_AREA_WIDTH: number = ROOM_AREA_RIGHT - ROOM_AREA_LEFT;
    export const ROOM_AREA_HEIGHT: number = ROOM_AREA_BOTTOM - ROOM_AREA_TOP;

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
     *
     * The concept of a Mode exists primarily because of Adventure Mode, which
     * contains both a content scene (where the player walks around) and a UI scene
     * (which contains the UI bar). Having a Mode lets us encapsulate the logic for
     * both in a single unit.
     */
    export const TITLE_MODE: GTitleMode = new GTitleMode();
    export const MAINMENU_MODE: GMainMenuMode = new GMainMenuMode();
    export const WORLDBUILD_MODE: GWorldBuildMode = new GWorldBuildMode();
    export const LOADGAME_MODE: GLoadGameMode = new GLoadGameMode();
    export const ADVENTURE_MODE: GAdventureMode = new GAdventureMode();
    export const BATTLE_MODE: GBattleMode = new GBattleMode();
    export const STATUS_MODE: GStatusMode = new GStatusMode();
    export const BOOKS_MODE: GBooksMode = new GBooksMode();
    export const BIBLE_MODE: GBibleMode = new GBibleMode();
    export const PEOPLE_MODE: GPeopleMode = new GPeopleMode();
    export const MAP_MODE: GMapMode = new GMapMode();
    export const GLOSSARY_MODE: GGlossaryMode = new GGlossaryMode();
    export const OPTIONS_MODE: GOptionsMode = new GOptionsMode();

    export const DIFFICULTY_BABE: GDifficulty = {
        index: 0,
        level: 1,
        levelName: 'Babe',
        enemyBaseAttack: 5,
        enemyAttackPerLevel: 2,
        enemyBaseResist: 10,
        enemyResistPerLevel: 10,
        enemySpeed: .9,
        bossResistPct: 0.75,
        minorGraceIncrease: .06,
        majorGraceIncrease: .12,
        maxRandomEnemies: 1,
        neededXpModifier: 0.75,
        trapStrengthPct: .05
    };
    export const DIFFICULTY_DISCIPLE: GDifficulty = {
        index: 1,
        level: 2,
        levelName: 'Disciple',
        enemyBaseAttack: 10,
        enemyAttackPerLevel: 3,
        enemyBaseResist: 20,
        enemyResistPerLevel: 20,
        enemySpeed: 1.0,
        bossResistPct: 1.0,
        minorGraceIncrease: .04,
        majorGraceIncrease: .08,
        maxRandomEnemies: 2,
        neededXpModifier: 1.0,
        trapStrengthPct: .1
    };
    export const DIFFICULTY_SOLDIER: GDifficulty = {
        index: 2,
        level: 3,
        levelName: 'Soldier',
        enemyBaseAttack: 15,
        enemyAttackPerLevel: 4,
        enemyBaseResist: 30,
        enemyResistPerLevel: 30,
        enemySpeed: 1.1,
        bossResistPct: 1.25,
        minorGraceIncrease: .02,
        majorGraceIncrease: .04,
        maxRandomEnemies: 3,
        neededXpModifier: 1.25,
        trapStrengthPct: .2
    };

    export const Difficulties: GDifficulty[] = [
        DIFFICULTY_BABE,
        DIFFICULTY_DISCIPLE,
        DIFFICULTY_SOLDIER
    ];

    /**
     * For convenience, when we need to reference a particular Scene
     * that is used ALL the time, just assign it here and use GFF.TheScene
     */
    export let AdventureContent: GAdventureContent;
    export let AdventureUI: GAdventureUI;
    export let BattleContent: GBattleContent;

    /**
     * Don't put flags here; set them in the REGISTRY.
     */

    export function getDifficulty(): GDifficulty {
        // This lets us set just the index of the difficulty in the registry
        // (instead of the whole object), which is easier to save and load.
        return GFF.Difficulties[REGISTRY.getNumber('difficulty') ?? 1];
    }

    export function sleep(ms: number) {
        const date: number = Date.now();
        let curDate: number|null = null;
        do {
            curDate = Date.now();
        } while(curDate - date < ms);
    }

    export function log(something: any, error: boolean = false) {
        if (REGISTRY.getBoolean('isGameLog')) {
            if (error) {
                console.error(something);
                return;
            }
            console.log(something);
        }
    }

    export function genLog(something: any, error: boolean = false) {
        if (REGISTRY.getBoolean('isGenLog')) {
            if (error) {
                console.error(something);
                return;
            }
            console.log(something);
        }
    }

    export function logSceneObjects(scene: GBaseScene) {
        let objs: Phaser.GameObjects.GameObject[] = scene.children.getChildren();
        objs.forEach(n => {
            let body = n.body ?? '';
            GFF.log(`${n.type} = "${n.name}"; body: ${body}; active: ${n.active}`);
        });
    }

    export function setMouseVisible(show: boolean) {
        if (show) {
            GFF.GAME.scale.parent.style.cursor = "url('./assets/images/interface/cursor.png'), auto";
        } else {
            GFF.GAME.scale.parent.style.cursor = 'none';
        }
    }

}
