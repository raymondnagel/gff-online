import { GRoom } from "./GRoom";
import { GTown } from "./GTown";
import { GCharSprite } from "./objects/chars/GCharSprite";

export type ONE = 1;
export type TWO = ONE|2;
export type THREE = TWO|3;
export type FOUR = THREE|4;
export type FIVE = FOUR|5;
export type SIX = FIVE|6;
export type SEVEN = SIX|7;
export type EIGHT = SEVEN|8;
export type NINE = EIGHT|9;
export type TEN = NINE|10;

export type GActorEvent = {
    eventId: string,
    actor: string,
    command: string,
    postCode?: () => void,
    after: string,
    since: number
};

export type GConditionEvent = {
    eventId: string,
    condition: () => boolean,
    after: string,
    since: number
};

export type GGeneralEvent = {
    eventId: string,
    eventCode: () => void,
    after: string,
    since: number
};

export type GCutsceneEvent = GActorEvent | GConditionEvent | GGeneralEvent;

// Packages a sprite animation together with a sound, to be executed once simultaneously:
export type SpriteEffect = {
    spriteConfig: Phaser.Types.Animations.Animation,
    soundKey: string|null,
    hideOnFinish: boolean
}

// Allows creating colors that can be used as either numbers or strings as needed:
export class GColor {
    constructor(public hexColor: number) {}
    num(): number {
        return this.hexColor;
    }
    str(): string {
        return '#' + this.hexColor.toString(16).padStart(6, '0');
    }
}

// Represents a callback function for updating progress:
export type ProgressCallback = (description: string, current: number, total: number) => void;

// Represents an array of keyboard key objects indexed by their names:
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
    minorGraceIncrease: number;
    majorGraceIncrease: number;
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
    setPosition: (x: number, y: number) => {};
}

/**
 * GInteractable identifies an object that can be interacted
 * with using the spacebar, if it is currently in range, and
 * defines what happens when the interaction happens.
 *
 * Examples: people can be talked to, the piano can be played, etc.
 */
export interface GInteractable extends BoundedGameObject{
    interact(): void;
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
    entry: string;
    index: string;
    title: string;
    type: 'concept'|'item';
    text: string;
    image: string;
    inspiration: string;
};

// Represents an entry from the Book Info
export type GBookEntry = {
    name: string; // Name of the book: e.g. "Matthew"
    short: string; // Short name, common abbreviation: e.g. "Matt"
    abbreviation: string; // 3-letter abbreviation: e.g. "Mat"
    title: string; // Full title of the book: e.g. "The Gospel according to Matthew"
    description: string; // Description of the book: [paragraph]
};

// Pairs an item name with a function that is called when the item is obtained
export type GItem = {
    name: string;
    type: 'item'|'book';
    onCollect: Function;
};

// Represents male or female
export type GGender = 'm'|'f';

// Represents a unique person displayed as a GPersonSprite
export interface GPerson {
    firstName: string;
    lastName: string;
    preferredName: string|null; // Name used in conversations
    spriteKeyPrefix: string; // Determines appearance independently of name
    gender: GGender; // Male and female created he them
    voice: FIVE; // Random voice tone
    faith: number; // Converted = 100+
    familiarity: number; // +1 for each conversation; +1 for each small-talk
    nameLevel: 0|1|2; // 0 = unknown; 1 = formal name; 2 = informal name
    reprobate: boolean; // if true, faith decreases instead of increasing
    homeTown: GTown|null; // need this so they can join the town's church when converted
    bio1: string|null; // Bio part 1: intro, town, background
    bio2: string|null; // Bio part 2: grace, conversion, current
    favoriteBook: string; // Favorite book
    conversations: number; // Number of conversations with this person
}

// Represents a unique enemy displayed as a GImpSprite
export interface GSpirit {
    type: string;
    name: string;
    level: number;
    introduced: boolean;
}

// Represents a compass direction, with the possibility of NONE
export enum Dir9 {
    NONE = 0,
    N    = 1,
    NE   = 2,
    E    = 3,
    SE   = 4,
    S    = 5,
    SW   = 6,
    W    = 7,
    NW   = 8
};

export type CardDir = Dir9.N|Dir9.E|Dir9.S|Dir9.W;

// Represents a simple X,Y coordinate point
export interface GPoint2D {
    x: number;
    y: number;
}

// Represents a simple X,Y,Z coordinate point
export interface GPoint3D extends GPoint2D {
    z: number;
}

// Represents a 2D rectangle with a position and size
export interface GRect extends GPoint2D {
    width: number;
    height: number;
}

// Structure for planning placement of a scenery object
// Since it was already placed, we only care about the key
// and location now.
export interface GSceneryPlan extends GPoint2D {
    key: string;
}

// Structure for pre-defining a scenery object
// We need to know its physical shape to plan its placement,
// turning it into a plan; but it doesn't have a location.
export interface GSceneryDef {
    key: string;
    type: 'bg_decor'|'fg_decor'|'oh_decor'|'static'|'custom';
    body: GRect;
}

export type GFloor = GRoom[][];

export type GRoomWalls = {
    [key in CardDir]: boolean[];
};

export type GDoorways = {
    [key in CardDir]: boolean;
};

export type GInteriorWallPiece =
    'n_left'|'n_right'|'n_mid'|'n_door_lower'|'n_door_upper'|
    's_left'|'s_right'|'s_mid'|'s_door'|
    'e_top'|'e_bottom'|'e_mid'|'e_door_lower'|'e_door_upper'|
    'w_top'|'w_bottom'|'w_mid'|'w_door_lower'|'w_door_upper'|
    'ne_corner'|'nw_corner'|'se_corner'|'sw_corner';

export type GInteriorWallSet = {
    [key in GInteriorWallPiece]?: string;
};

// Structure for associating a text option with an action
export interface GActionableOption {
    option: string;
    hotkey: string|undefined;
    action: Function;
}

// Determines which side of a block's buildings are aligned
export type GAnchorSide = 'bottom'|'top'|'left'|'right';

// Determines how a building is oriented within a city block
export type GBuildingOrientation = 'front'|'back'|'side';

// Determines a block where buildings may be arranged within a town room
export type GCityBlock = {
    name: string;
    base: number;
    start: number;
    end: number;
    anchor: GAnchorSide;
    orientation: GBuildingOrientation;
    dimension: GRect;
}

/**
 * Conversation structures
 */

// Defines the common contract for Speech, Thought, and Choice bubbles
export interface GBubble extends Phaser.GameObjects.Container {
    update(): void;
    isComplete(): boolean;
    destroy(): void;
}

// Defines an option for 'choice':
export type COption = {
    choiceText: string;
    condFunc?: string;
    resultId: string;
};

// Defines possible forms of the blurb:
export type CForm =
{ // Form 1: static text, optional next
    text: string;
    next?: string;
    textFunc?: never;
    dynamic?: never;
    dynamicLevel?: never;
    choice?: never;
    fork?: never;
} |
{ // Form 2: dynamic text, optional next
    dynamic: string;
    next?: string;
    text?: never;
    textFunc?: never;
    dynamicLevel?: never;
    choice?: never;
    fork?: never;
} |
{ // Form 3: dynamic-by-level text, optional next
    dynamicLevel: string;
    next?: string;
    text?: never;
    textFunc?: never;
    dynamic?: never;
    choice?: never;
    fork?: never;
} |
{ // Form 4: function text, optional next
    textFunc: string;
    next?: string;
    text?: never;
    dynamic?: never;
    dynamicLevel?: string;
    choice?: never;
    fork?: never;
} |
{ // Form 5: static text, fork replaces next
    text: string;
    fork: string;
    next?: never;
    textFunc?: never;
    dynamic?: never;
    dynamicLevel?: never;
    choice?: never;
} |
{ // Form 6: dynamic text, fork replaces next
    dynamic: string;
    fork: string;
    next?: never;
    text?: never;
    textFunc?: never;
    dynamicLevel?: never;
    choice?: never;
} |
{ // Form 7: dynamic-by-level text, fork replaces next
    dynamicLevel: string;
    fork: string;
    next?: never;
    text?: never;
    textFunc?: never;
    dynamic?: never;
    choice?: never;
} |
{ // Form 8: no text at all, fork branches the conversation
    fork: string;
    next?: never;
    text?: never;
    textFunc?: never;
    dynamic?: never;
    dynamicLevel?: never;
    choice?: never;
} |
{ // Form 9: choice replaces both the text and next
    choice: COption[];
    text?: never;
    textFunc?: never;
    dynamic?: never;
    dynamicLevel?: never;
    next?: never;
    fork?: never;
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

// A structure representing one level of a dynamic blurb, with several variants
export type LeveledDynamicBlurb = {
    level: number;
    variants: string[];
};

/**
 * For a 'sermon', faith is restored for every blurb spoken by the preacher.
 * For a 'streetpreach', a preach-sonic effect is shown for every blurb spoken by the player.
 * For a 'playerpray', blurbs are shown on top of everything else, since the screen will be faded out (as though his eyes are closed).
 * For a 'default' conversation, there are no special effects.
 */
export type ConversationType = 'sermon'|'streetpreach'|'playerpray'|'default';
