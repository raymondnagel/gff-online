import { GDirection } from "./GDirection";
import { GRoom } from "./GRoom";
import { GCharSprite } from "./objects/chars/GCharSprite";

// Represents an array of key objects indexed by their names:
export type GKeyList = {
    [key: string]: Phaser.Input.Keyboard.Key
};

// Represents a game difficulty:
export type GDifficulty = {
    levelName: string;
    enemyBaseAttack: number;
    enemyAttackPerLevel: number;
    enemyBaseResist: number;
    enemyResistPerLevel: number;
    enemySpeed: number;
};

// Represents an attack that the enemy can perform:
export type GEnemyAttack = {
    attackName: string;
    enemies: string[];
    minLevel: number;
    weight: number;
    text: string;
    soundKey: string;
    actionFunction: Function;
};

// Represents a GameObject with position and bounds:
export interface BoundedGameObject extends Phaser.GameObjects.GameObject {
    x: number;
    y: number;
    width: number;
    height: number;
}

// Represents a scripture reference and text:
export type GScripture = {
    book: string;
    chapter: number;
    verse: number;
    verseText: string;
};

// Represents an entry from the Glossary
export type GGlossaryEntry = {
    name: string;
    title: string;
    type: 'concept'|'item';
    text: string;
    image: string;
    inspiration: string;
};

// Pairs an item name with a function that is called when the item is obtained
export type GItem = {
    name: string;
    onCollect: Function;
};

// Represents male or female
export type GGender = 'm'|'f';

// Represents a unique person displayed as a GPersonSprite
export interface GPerson {
    firstName: string;
    lastName: string;
    spriteKeyPrefix: string;
    gender: GGender;
    voice: 1|2|3|4|5;
    faith: number;
    introduced: boolean;
    knowsPlayer: boolean;
}

// Represents a unique enemy displayed as a GImpSprite
export interface GSpirit {
    type: string;
    name: string;
    level: number;
    introduced: boolean;
}

export type CardDir = GDirection.Dir9.N|GDirection.Dir9.E|GDirection.Dir9.S|GDirection.Dir9.W;

// Represents a simple X,Y coordinate point
export interface GPoint {
    x: number;
    y: number;
}

// Represents a simple X,Y coordinate point
export interface GRect extends GPoint {
    width: number;
    height: number;
}

// Structure for planning placement of a scenery object
// Since it was already placed, we only care about the key
// and location now.
export interface GSceneryPlan extends GPoint {
    key: string;
}

// Structure for pre-defining a scenery object
// We need to know its physical shape to plan its placement,
// turning it into a plan; but it doesn't have a location.
export interface GSceneryDef {
    key: string;
    body: GRect;
}

export type GFloor = GRoom[][];

export type GRoomWalls = {
    [key in CardDir]: boolean[];
};

// Structure for associating a text option with an action
export interface GActionableOption {
    option: string;
    hotkey: string|undefined;
    action: Function;
}

/**
 * Conversation structures
 */

// Defines the common contract for Speech, Thought, and Choice bubbles
export interface GBubble {
    update(): void;
    isComplete(): boolean;
    destroy(): void;
}

// Defines an option for 'choice':
export type COption = {
    choiceText: string;
    resultId: string;
};

// Defines possible forms of the blurb:
export type CForm =
{ // Form 1: static text, optional next
    text: string;
    next?: string;
    dynamic?: never;
    choice?: never;
} |
{ // Form 2: dynamic text, optional next
    dynamic: string;
    next?: string;
    text?: never;
    choice?: never;
} |
{ // Form 3: choice replaces both the text and next
    choice: COption[];
    text?: never;
    dynamic?: never;
    next?: never;
};

// Represents a single unit within the conversation, i.e. bubble
export type CBlurb = {
    id: string;
    chance?: number;
    speaker: string;
    hearer?: string;
    preCmd?: string;
    postCmd?: string;
} & CForm;

export type CLabeledChar = {
    label: string;
    char: GCharSprite;
};
