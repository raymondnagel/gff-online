import { BIBLE } from "../bible";
import { BOOKS } from "../books";
import { ENEMY } from "../enemy";
import { GInputMode } from "../GInputMode";
import { RANDOM } from "../random";
import { GFF } from "../main";
import { GNumberEntry } from "../objects/components/GNumberEntry";
import { GOptionWheel } from "../objects/components/GOptionWheel";
import { GTextEntryControl } from "../objects/components/GTextEntryControl";
import { PLAYER } from "../player";
import { GPoint2D, GScripture } from "../types";
import { GContentScene } from "./GContentScene";
import { STATS } from "../stats";
import { REGISTRY } from "../registry";
import { ARMORS } from "../armors";
import { COLOR, GColor } from "../colors";
import { ANIM } from "../anim";
import { stat } from "node:fs";

type ScrollVerse = 'served'|'prev'|'next';
type TextLine = (Phaser.GameObjects.Text|Phaser.GameObjects.Sprite)[];
const TEXT_SPACE: number = 3;
const SHOW_SERVED_VERSE_TIME: number = 500;
const SWITCH_SHOWN_VERSE_TIME: number = 100;
const FLEE_EVENT_TEXT: string = 'Adam was afraid and fled the battle!';

const BAR_COLOR: number = 0xff0000;
const GOLD_COLOR: string = '#d5ccb4';
const SCRIPTURE_COLOR: string = '#663420';
const TEXT_COLOR: string = '#ffffff';
const TEXT_SHADOW: string ='#333333';
const REPORT_TEXT_COLOR: string = '#000000';
const HIT_CAPTION_COLOR: string = '#015858';
const HIT_REF_COLOR: string = '#00ffff';
const MISS_CAPTION_COLOR: string = '#a90000';
const MISS_REF_COLOR: string = '#ff3737';
const ACTUAL_CAPTION_COLOR: string = '#b2691c';
const ACTUAL_REF_COLOR: string = '#ffd639';
const BASE_SCORE_COLOR: string = '#015858';
const FINAL_SCORE_COLOR: string = '#00ffff';
const ATTACK_CAPTION_COLOR: string = '#a90000';
const ATTACK_CALC_COLOR: string = '#ff3737';
const BASE_DAMAGE_COLOR: string = '#a90000';
const FINAL_DAMAGE_COLOR: string = '#ff3737';

const TOP_MARGIN: number = 10;
const SIDE_MARGIN: number = 4;
const METER_WIDTH: number = 450;
const AVATAR_BOTTOM: number = 720;
const ENEMY_CIRCLE_XOFF: number = 136;
const ENEMY_CIRCLE_YOFF: number = 28;
const LEVEL_TEXT_Y: number = 14;
const PLAYER_LEVEL_TEXT_X: number = 84;
const ENEMY_LEVEL_TEXT_X: number = 940;
const BAR_WIDTH: number = 300;
const BAR_HEIGHT: number = 24;
const BAR_Y: number = 67;
const PLAYER_BAR_X: number = 151;
const ENEMY_BAR_X: number = 873;
const METER_TEXT_Y: number = 72;
const NAME_Y: number = 37;
const PLAYER_NAME_X: number = 171;
const ENEMY_NAME_X: number = 853;
const SCROLL_Y: number = 140;
const WORD_WRAP_WIDTH: number = 560;
const LEFT_ROLL_START_X: number = 495;
const LEFT_ROLL_END_X: number = 191;
const RIGHT_ROLL_START_X: number = 529;
const RIGHT_ROLL_END_X: number = 834;
const APPROACH_GAP: number = 30;
const APPROACH_TIME: number = 600;
const GUESS_SCRIPTURE_Y: number = 520;
const STAGE_TEXT_Y: number = 400;
const EVENT_TEXT_Y: number = 400;
const SWORD_START_X: number = 482;
const SWORD_RETRACT_X: number = 420;
const SWORD_MISS_X: number = 620;
const SWORD_HIT_X: number = 680;
const RESULT_IMG_Y: number = 440 /*top*/ + 160 /*half image*/;
const SCORE_CAPTION_X: number = 424;
const SCORE_CALC_X: number = 560;
const PLAYER_PARTICLE_X: number = 120;
const ENEMY_PARTICLE_X: number = 904;
const MAX_WORD_TEXTS: number = 200;
const MAX_WORD_SMOKES: number = 120;

const INPUT_PROMPTENTER: GInputMode = new GInputMode('battle.prompt_enter');
const INPUT_REFBOOK: GInputMode = new GInputMode('battle.ref_book');
const INPUT_REFCHAPTER: GInputMode = new GInputMode('battle.ref_chapter');
const INPUT_REFVERSE: GInputMode = new GInputMode('battle.ref_verse');
const INPUT_DISABLED: GInputMode = new GInputMode('battle.disabled');

enum BattleStage {
    NONE            = 0,  // We're in an automatic process, not waiting for the player to do anything.
    BOOK            = 1,  // Waiting for the player to select a book and press Enter.
    CHAPTER         = 2,  // Waiting for the player to type a chapter # and press Enter.
    VERSE           = 3,  // Waiting for the player to type a verse # and press Enter.
    PLAYER_ATTACK   = 4,  // Player has made a guess; attack sequence is in progress.
    END_PLAYER_TURN = 5,  // Player has taken his turn, and the result is displayed. Press Enter to take enemy's turn.
    ENEMY_ATTACK    = 6,  // Enemy's attack sequence is in progress.
    END_ENEMY_TURN  = 7,  // Enemy has taken its turn, and the result is displayed. Press Enter to continue.
    VICTORY         = 8,  // Player is victorious! Press Enter to leave the battle.
    DEFEAT          = 9   // Player is defeated. Press Enter to leave the battle.
};

/**
 * Structures
 */

type StatusEffect = {
    name: string;
    statusName: string;
    iconKey: string;
    turns: number;
    roundSound?: string;
    roundFunc?: Function; // Something to happen each round; add later so it can reference 'this'
    damageFunc?: () => number;
};
type GEnemyAttack = {
    attackName: string;
    enemies: string[];
    minLevel: number;
    text: string;
    soundKey: string;
    statusEffect: StatusEffect|null;
    animFunc: (nextStep: Function) => void;
    damageFunc: () => number;
    condFunc: () => boolean;
};
type EnemyTurnResult = {
    damage: number;
    newStatusEffect?: StatusEffect;
    armorAbsorb: boolean;
    shieldDeflect: boolean;
    armorPart: string|null;
    statusEffectDamage: number;
};

/**
 * Status Effects
 */

// Inflicted by the Poison attack
const POISON_EFFECT: StatusEffect = {
    name: 'Poison',
    statusName: 'Poisoned',
    iconKey: 'poison_status',
    turns: 4,
    roundSound: 'poison',
    damageFunc: () => {
        return RANDOM.randInt(
            Math.ceil(ENEMY.getBaseDamage() * .25),
            Math.ceil(ENEMY.getBaseDamage() * .5)
        );
    }
};
// Inflicted by the Snare attack
const ENSNARE_EFFECT: StatusEffect = {
    name: 'Ensnare',
    statusName: 'Ensnared',
    iconKey: 'ensnare_status',
    turns: 4, // Effectively 3, because it will tick down at the beginning of the round
};
// Inflicted by the Smoke attack
const VEIL_EFFECT: StatusEffect = {
    name: 'Veil',
    statusName: 'Veiled',
    iconKey: 'veil_status',
    turns: 4,
};
// Inflicted by the Flame Breath attack
const BURN_EFFECT: StatusEffect = {
    name: 'Burn',
    statusName: 'Burning',
    iconKey: 'burn_status',
    turns: 2,
    roundSound: '',
    damageFunc: () => {
        return RANDOM.randInt(
            Math.ceil(ENEMY.getBaseDamage() * .5),
            Math.ceil(ENEMY.getBaseDamage() * .75)
        );
    }
};
// Inflicted by the Roar attack
const FEAR_EFFECT: StatusEffect = {
    name: 'Fear',
    statusName: 'Afraid',
    iconKey: 'fear_status',
    turns: 2,
};

export class GBattleContent extends GContentScene {

    private enemyPortraitImage: Phaser.GameObjects.Image;
    private playerMeterImage: Phaser.GameObjects.Image;
    private enemyMeterImage: Phaser.GameObjects.Image;
    private vsImage: Phaser.GameObjects.Image;
    private playerBaseImage: Phaser.GameObjects.Image;
    private playerArmImage: Phaser.GameObjects.Image;
    private playerShieldImage: Phaser.GameObjects.Image;
    private playerAvatar: Phaser.GameObjects.Container;
    private enemyAvatar: Phaser.GameObjects.Image;
    private playerBar: Phaser.GameObjects.Rectangle;
    private enemyBar: Phaser.GameObjects.Rectangle;
    private playerMeterTextShadow: Phaser.GameObjects.Text;
    private enemyMeterTextShadow: Phaser.GameObjects.Text;
    private playerMeterText: Phaser.GameObjects.Text;
    private enemyMeterText: Phaser.GameObjects.Text;
    private playerLevelText: Phaser.GameObjects.Text;
    private enemyLevelText: Phaser.GameObjects.Text;
    private playerNameText: Phaser.GameObjects.Text;
    private playerNameTextShadow: Phaser.GameObjects.Text;
    private enemyNameText: Phaser.GameObjects.Text;
    private enemyNameTextShadow: Phaser.GameObjects.Text;

    private scrollClosedImage: Phaser.GameObjects.Image;
    private scrollOpenImage: Phaser.GameObjects.Image;
    private leftRollImage: Phaser.GameObjects.Image;
    private rightRollImage: Phaser.GameObjects.Image;

    private scriptureFrame: Phaser.GameObjects.Rectangle;
    private servedVerseContainer: Phaser.GameObjects.Container;
    private prevVerseContainer: Phaser.GameObjects.Container;
    private nextVerseContainer: Phaser.GameObjects.Container;
    private servedVerseLines: TextLine[] = [];
    private prevVerseLines: TextLine[] = [];
    private nextVerseLines: TextLine[] = [];

    private swordImage: Phaser.GameObjects.Image;
    private bookWheel: GOptionWheel;
    private chapterEntry: GNumberEntry;
    private verseEntry: GNumberEntry;

    private bookText: Phaser.GameObjects.Text;
    private chapterText: Phaser.GameObjects.Text;
    private verseText: Phaser.GameObjects.Text;
    private colonText: Phaser.GameObjects.Text;

    private currentStage: BattleStage;
    private stageText: Phaser.GameObjects.Text;

    private eventText: Phaser.GameObjects.Text;
    private servedVerse: GScripture;
    private prevVerse: GScripture|null = null;
    private nextVerse: GScripture|null = null;

    private resultImage: Phaser.GameObjects.Image;
    private guessCaption: Phaser.GameObjects.Text;
    private guessReference: Phaser.GameObjects.Text;
    private actualCaption: Phaser.GameObjects.Text;
    private actualReference: Phaser.GameObjects.Text;
    private chapterScoreCaption: Phaser.GameObjects.Text;
    private chapterScoreCalc: Phaser.GameObjects.Text;
    private verseScoreCaption: Phaser.GameObjects.Text;
    private verseScoreCalc: Phaser.GameObjects.Text;
    private perfectBonusCaption: Phaser.GameObjects.Text;
    private perfectBonusCalc: Phaser.GameObjects.Text;
    private baseScoreCaption: Phaser.GameObjects.Text;
    private baseScoreCalc: Phaser.GameObjects.Text;
    private booksMultCaption: Phaser.GameObjects.Text;
    private booksMultCalc: Phaser.GameObjects.Text;
    private graceBonusCaption: Phaser.GameObjects.Text;
    private graceBonusCalc: Phaser.GameObjects.Text;
    private finalScoreCaption: Phaser.GameObjects.Text;
    private finalScoreCalc: Phaser.GameObjects.Text;

    private enemyResultImage: Phaser.GameObjects.Image;
    private attackTypeCaption: Phaser.GameObjects.Text;
    private attackTypeCalc: Phaser.GameObjects.Text;
    private attackPowerCaption: Phaser.GameObjects.Text;
    private attackPowerCalc: Phaser.GameObjects.Text;
    private attackEffectCaption: Phaser.GameObjects.Text;
    private armorCaption: Phaser.GameObjects.Text;
    private armorCalc: Phaser.GameObjects.Text;
    private shieldCaption: Phaser.GameObjects.Text;
    private shieldCalc: Phaser.GameObjects.Text;
    private baseDamageCaption: Phaser.GameObjects.Text;
    private baseDamageCalc: Phaser.GameObjects.Text;
    private statusEffectCaption: Phaser.GameObjects.Text;
    private statusEffectCalc: Phaser.GameObjects.Text;
    private graceProtectionCaption: Phaser.GameObjects.Text;
    private graceProtectionCalc: Phaser.GameObjects.Text;
    private finalDamageCaption: Phaser.GameObjects.Text;
    private finalDamageCalc: Phaser.GameObjects.Text;

    private playerReportTexts: Phaser.GameObjects.Text[];
    private enemyReportTexts: Phaser.GameObjects.Text[];

    private playerParticleEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
    private enemyParticleEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
    private poisonVaporEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

    private enemyAttacks: GEnemyAttack[];
    private basicAttackSprite: Phaser.GameObjects.Sprite;
    private fieryDartSprite: Phaser.GameObjects.Sprite;
    private snareProjectileSprite: Phaser.GameObjects.Sprite;
    private snareFullSprite: Phaser.GameObjects.Sprite;
    private poisonVialImage: Phaser.GameObjects.Image;
    private poisonPulseTween: Phaser.Tweens.Tween|null = null;
    private smokePuffSprites: Phaser.GameObjects.Sprite[];
    private wordSmokeSpritePool: Phaser.GameObjects.Sprite[];
    private wordTextPool: Phaser.GameObjects.Text[];
    private sweatTimer: Phaser.Time.TimerEvent|null = null;
    private trembleTween: Phaser.Tweens.Tween|null = null;
    private armorSparkImage: Phaser.GameObjects.Image;

    private playerBooks: string[];
    private bookWheelRepeats: number = 0;

    private animSpeed: number = 1;
    private maxDelta = 0;
    private sampleTimer = 0;
    private frameRateText: Phaser.GameObjects.Text;

    private currentStatusEffect: StatusEffect|null = null;
    private statusEffectIcon: Phaser.GameObjects.Image;
    private statusEffectDurationText: Phaser.GameObjects.Text;
    private statusEffectDuration: number = 0;
    private specialAttackUsed: boolean = false;

    private peekKeysDown: { [key: string]: boolean } = { 'ArrowLeft': false, 'ArrowRight': false };

    constructor() {
        super("BattleContent");
        GFF.BattleContent = this;
        this.setContainingMode(GFF.BATTLE_MODE);
    }

    public create(): void {
        GFF.setMouseVisible(false);
        this.initInputModes();
        this.setInputMode(INPUT_DISABLED);

        this.playerBooks = BOOKS.getEnabledBooks();

        // Background image:
        this.add.image(0, 0, GFF.BATTLE_MODE.getBgImage()).setOrigin(0, 0).setTint(GFF.BATTLE_MODE.getBgStoneTint());

        // Player and Enemy avatars:
        this.createAvatars(ENEMY.getAvatar());

        // Drawn under the meter images:
        this.enemyPortraitImage = this.add.image(GFF.GAME_W - SIDE_MARGIN - ENEMY_CIRCLE_XOFF, TOP_MARGIN + ENEMY_CIRCLE_YOFF, ENEMY.getPortrait()).setOrigin(0, 0).setVisible(false);
        this.playerBar = this.add.rectangle(PLAYER_BAR_X, BAR_Y, BAR_WIDTH, BAR_HEIGHT, BAR_COLOR).setOrigin(0, 0).setVisible(false);
        this.enemyBar = this.add.rectangle(ENEMY_BAR_X, BAR_Y, BAR_WIDTH, BAR_HEIGHT, BAR_COLOR).setOrigin(1, 0).setVisible(false);

        // Meter images (and VS):
        this.playerMeterImage = this.add.image(SIDE_MARGIN, TOP_MARGIN, 'hero_meter').setOrigin(0, 0).setVisible(false);
        this.enemyMeterImage = this.add.image(GFF.GAME_W - METER_WIDTH - SIDE_MARGIN, TOP_MARGIN, 'enemy_meter').setOrigin(0, 0).setVisible(false);
        this.vsImage = this.add.image(GFF.GAME_W / 2, 30, 'vs').setOrigin(.5, 0).setVisible(false);

        // Drawn over the meter images:
        this.playerMeterTextShadow = this.add.text(PLAYER_BAR_X + (BAR_WIDTH / 2) + 2, METER_TEXT_Y + 2, 'Faith: 0/0', {
            color: TEXT_SHADOW,
            fontFamily: 'dyonisius',
            fontSize: '20px'
        }).setOrigin(.5, 0).setVisible(false);
        this.playerMeterText = this.add.text(PLAYER_BAR_X + (BAR_WIDTH / 2), METER_TEXT_Y, 'Faith: 0/0', {
            color: TEXT_COLOR,
            fontFamily: 'dyonisius',
            fontSize: '20px'
        }).setOrigin(.5, 0).setVisible(false);

        this.enemyMeterTextShadow = this.add.text(ENEMY_BAR_X - (BAR_WIDTH / 2) + 2, METER_TEXT_Y + 2, 'Resistance: 0/0', {
            color: TEXT_SHADOW,
            fontFamily: 'dyonisius',
            fontSize: '20px'
        }).setOrigin(.5, 0).setVisible(false);
        this.enemyMeterText = this.add.text(ENEMY_BAR_X - (BAR_WIDTH / 2) + 2, METER_TEXT_Y, 'Resistance: 0/0', {
            color: TEXT_COLOR,
            fontFamily: 'dyonisius',
            fontSize: '20px'
        }).setOrigin(.5, 0).setVisible(false);

        this.playerLevelText = this.add.text(PLAYER_LEVEL_TEXT_X, LEVEL_TEXT_Y, PLAYER.getLevel() + '', {
            color: GOLD_COLOR,
            fontFamily: 'dyonisius',
            fontSize: '18px'
        }).setOrigin(.5, 0).setVisible(false);

        this.enemyLevelText = this.add.text(ENEMY_LEVEL_TEXT_X, LEVEL_TEXT_Y, ENEMY.getCurrentSpirit().level + '', {
            color: GOLD_COLOR,
            fontFamily: 'dyonisius',
            fontSize: '18px'
        }).setOrigin(.5, 0).setVisible(false);

        // Names
        this.playerNameTextShadow = this.add.text(PLAYER_NAME_X + 2, NAME_Y + 2, PLAYER.getName(), {
            color: TEXT_SHADOW,
            fontFamily: 'dyonisius',
            fontSize: '24px'
        }).setOrigin(0, 0).setVisible(false);
        this.playerNameText = this.add.text(PLAYER_NAME_X, NAME_Y, PLAYER.getName(), {
            color: TEXT_COLOR,
            fontFamily: 'dyonisius',
            fontSize: '24px'
        }).setOrigin(0, 0).setVisible(false);

        this.enemyNameTextShadow = this.add.text(ENEMY_NAME_X + 2, NAME_Y + 2, ENEMY.getCurrentSpirit().name, {
            color: TEXT_SHADOW,
            fontFamily: 'dyonisius',
            fontSize: '24px'
        }).setOrigin(1, 0).setVisible(false);
        this.enemyNameText = this.add.text(ENEMY_NAME_X, NAME_Y, ENEMY.getCurrentSpirit().name, {
            color: TEXT_COLOR,
            fontFamily: 'dyonisius',
            fontSize: '24px'
        }).setOrigin(1, 0).setVisible(false);

        // Scroll
        this.scrollClosedImage = this.add.image(GFF.GAME_W / 2, SCROLL_Y + 105, 'scroll_closed').setOrigin(.5, .5).setVisible(false);
        this.scrollOpenImage = this.add.image(GFF.GAME_W / 2, SCROLL_Y, 'scroll_open').setOrigin(.5, 0).setVisible(false);
        this.rightRollImage = this.add.image(GFF.GAME_W / 2, SCROLL_Y, 'roll_right').setOrigin(.5, 0).setVisible(false);
        this.leftRollImage = this.add.image(GFF.GAME_W / 2, SCROLL_Y, 'roll_left').setOrigin(.5, 0).setVisible(false);

        // Scripture
        this.scriptureFrame = this.add.rectangle(GFF.GAME_W / 2 - (WORD_WRAP_WIDTH / 2), SCROLL_Y + 55, WORD_WRAP_WIDTH, 100, 0x000000, 0.5)
            .setOrigin(0, 0).setVisible(false);
        this.servedVerseContainer = this.add.container(this.scriptureFrame.x, this.scriptureFrame.y).setVisible(false);
        this.prevVerseContainer = this.add.container(this.scriptureFrame.x, this.scriptureFrame.y).setVisible(false);
        this.nextVerseContainer = this.add.container(this.scriptureFrame.x, this.scriptureFrame.y).setVisible(false);

        // Book wheel
        this.bookWheel = new GOptionWheel(this, 370, GUESS_SCRIPTURE_Y, this.playerBooks);
        this.bookWheel.setVisible(false);
        this.add.existing(this.bookWheel);
        // Book text:
        this.bookText = this.add.text(447, GUESS_SCRIPTURE_Y, '', {
            color: '#ffffff',
            fontFamily: 'imposs',
            fontSize: '30px'
        }).setShadow(0, 0, '#000000', 3, false, true).setOrigin(1, .5).setVisible(false);

        // Chapter entry:
        this.chapterEntry = new GNumberEntry(this, 500, GUESS_SCRIPTURE_Y);
        this.chapterEntry.setVisible(false);
        this.add.existing(this.chapterEntry);
        // Chapter text:
        this.chapterText = this.add.text(500, GUESS_SCRIPTURE_Y, '', {
            color: '#ffffff',
            fontFamily: 'imposs',
            fontSize: '30px'
        }).setShadow(0, 0, '#000000', 3, false, true).setOrigin(.5, .5).setVisible(false);

        // Verse entry:
        this.verseEntry = new GNumberEntry(this, 600, GUESS_SCRIPTURE_Y);
        this.verseEntry.setVisible(false);
        this.add.existing(this.verseEntry);
        // Verse text:
        this.verseText = this.add.text(600, GUESS_SCRIPTURE_Y, '', {
            color: '#ffffff',
            fontFamily: 'imposs',
            fontSize: '30px'
        }).setShadow(0, 0, '#000000', 3, false, true).setOrigin(.5, .5).setVisible(false);

        // Colon text:
        this.colonText = this.add.text(600, GUESS_SCRIPTURE_Y - 5, ':', {
            color: '#ffffff',
            fontFamily: 'imposs',
            fontSize: '40px'
        }).setShadow(0, 0, '#000000', 3, false, true).setOrigin(.5, .5).setVisible(false);

        // Stage text:
        this.stageText = this.add.text(370, STAGE_TEXT_Y, 'Choose Book:', {
            color: '#ffffff',
            fontFamily: 'dyonisius',
            fontSize: '20px'
        }).setShadow(0, 0, '#000000', 3, false, true).setOrigin(.5, .5).setVisible(false);
        this.tweens.add({
            targets: this.stageText,
            alpha: { from: 0, to: 1 },
            duration: 300, // Don't change the speed of flashes with animSpeed
            yoyo: true,
            repeat: -1
        });

        // Event text:
        this.eventText = this.add.text(GFF.GAME_W / 2, EVENT_TEXT_Y, '', {
            color: '#ffffff',
            fontFamily: 'dyonisius',
            fontSize: '30px'
        }).setShadow(0, 0, '#000000', 3, false, true).setOrigin(.5, .5).setVisible(false);

        // Sword
        this.swordImage = this.add.image(SWORD_START_X, GUESS_SCRIPTURE_Y, 'big_sword').setOrigin(.5, .5).setVisible(false);

        // Armor spark
        this.armorSparkImage = this.add.image(PLAYER_PARTICLE_X + 40, GUESS_SCRIPTURE_Y, 'armor_spark').setOrigin(.5, .5).setVisible(false);

        // Status Effect
        this.statusEffectIcon = this.add.image(172, 121, 'poison_status').setOrigin(.5, .5).setScale(.1).setVisible(false);
        this.statusEffectDurationText = this.add.text(196, 121, '', {
            color: '#ffffff',
            fontFamily: 'dyonisius',
            fontSize: '20px'
        }).setShadow(0, 0, '#313131', 3, false, true).setOrigin(.5, .5).setVisible(false);

        // Particle emitters (for damage):
        this.playerParticleEmitter = this.add.particles(PLAYER_PARTICLE_X, GUESS_SCRIPTURE_Y, 'light_particle', {
            lifespan: 2000 / this.animSpeed,
            speed: { min: 500, max: 1000 },
            alpha: { start: 1.0, end: 0.0},
            gravityY: 2000,
            blendMode: Phaser.BlendModes.NORMAL,
            emitting: false
        });
        this.enemyParticleEmitter = this.add.particles(ENEMY_PARTICLE_X, GUESS_SCRIPTURE_Y, 'dark_particle', {
            lifespan: 2000 / this.animSpeed,
            speed: { min: 500, max: 1000 },
            alpha: { start: 1.0, end: 0.0},
            gravityY: 2000,
            blendMode: Phaser.BlendModes.NORMAL,
            emitting: false
        });

        // Reset some things for the beginning of combat:
        this.animSpeed = REGISTRY.getNumber('battleSpeed');
        this.currentStage = BattleStage.NONE;
        this.currentStatusEffect = null;
        this.specialAttackUsed = false;

        POISON_EFFECT.roundFunc = () => {
            if (this.statusEffectDuration < 4) {
                this.poisonVaporEmitter.explode(20);
            }
        };

        this.createWordPools();
        this.getSound().playMusic('onward');
        this.createAttackAnimations();
        this.createPlayerResult();
        this.createEnemyResult();
        this.loadEnemyAttacks();
        this.showUI();

        this.frameRateText = this.add.text(GFF.RIGHT_BOUND - 10, GFF.TOP_BOUND + 10, '', {
            fontSize: '32px',
            color: COLOR.WHITE.str(),
            fontFamily: 'imposs'
        }).setShadow(0, 0, '#000000', 6, false, true).setOrigin(1, 0);
        this.frameRateText.setVisible(REGISTRY.getBoolean('showFrameRate'));
    }

    private initInputModes() {
        // INPUT_PROMPTENTER is active while waiting for the user to press Enter:
        INPUT_PROMPTENTER.setScene(this);
        INPUT_PROMPTENTER.onKeyDown((keyEvent: KeyboardEvent) => {
            switch(keyEvent.key) {
                case 'ArrowLeft':
                case 'ArrowRight':
                    this.checkPeek(keyEvent.key, true);
                    break;
                case 'Enter':
                    this.setInputMode(INPUT_DISABLED);
                    if (this.currentStage === BattleStage.END_PLAYER_TURN) {
                        this.setCurrentStage(BattleStage.ENEMY_ATTACK);
                    } else if (this.currentStage === BattleStage.END_ENEMY_TURN) {
                        this.finishEnemyTurn();
                    } else if (this.currentStage === BattleStage.VICTORY) {
                        this.endBattle(true);
                    } else if (this.currentStage === BattleStage.DEFEAT) {
                        this.endBattle(false);
                    }
                    break;
            }
        });
        INPUT_PROMPTENTER.onKeyUp((keyEvent: KeyboardEvent) => {
            switch(keyEvent.key) {
                case 'ArrowLeft':
                case 'ArrowRight':
                    this.checkPeek(keyEvent.key, false);
                    break;
            }
        });

        // INPUT_REFBOOK is active when the user should guess the book:
        INPUT_REFBOOK.setScene(this);
        INPUT_REFBOOK.allowRepeats(['ArrowUp', 'ArrowDown']);
        INPUT_REFBOOK.onKeyDown((keyEvent: KeyboardEvent) => {
            this.bookWheelRepeats = keyEvent.repeat ? this.bookWheelRepeats + 1 : 0;
            switch(keyEvent.key) {
                case 'ArrowLeft':
                case 'ArrowRight':
                    this.checkPeek(keyEvent.key, true);
                    break;
                case 'ArrowUp':
                    this.bookWheel.scrollUp(this.bookWheelRepeats);
                    break;
                case 'ArrowDown':
                    this.bookWheel.scrollDown(this.bookWheelRepeats);
                    break;
                case 'Enter':
                    this.setInputMode(INPUT_DISABLED);
                    this.completeCurrentPart();
                    break;
            }
        });
        INPUT_REFBOOK.onKeyUp((keyEvent: KeyboardEvent) => {
            switch(keyEvent.key) {
                case 'ArrowLeft':
                case 'ArrowRight':
                    this.checkPeek(keyEvent.key, false);
                    break;
            }
        });

        // INPUT_REFCHAPTER is active when the user should guess the chapter:
        INPUT_REFCHAPTER.setScene(this);
        INPUT_REFCHAPTER.onKeyDown((keyEvent: KeyboardEvent) => {
            switch(keyEvent.key) {
                case 'ArrowLeft':
                case 'ArrowRight':
                    this.checkPeek(keyEvent.key, true);
                    break;
                case 'Enter':
                    this.setInputMode(INPUT_DISABLED);
                    this.completeCurrentPart();
                    break;
                default:
                    if ((keyEvent.code as string).startsWith('Digit')) {
                        this.chapterEntry.addChar(keyEvent.key);
                    } else if (keyEvent.key === 'Backspace' || keyEvent.key === 'Delete') {
                        this.chapterEntry.deleteLastChar();
                    }
                    break;
            }
        });
        INPUT_REFCHAPTER.onKeyUp((keyEvent: KeyboardEvent) => {
            switch(keyEvent.key) {
                case 'ArrowLeft':
                case 'ArrowRight':
                    this.checkPeek(keyEvent.key, false);
                    break;
            }
        });

        // INPUT_REFVERSE is active when the user should guess the verse:
        INPUT_REFVERSE.setScene(this);
        INPUT_REFVERSE.onKeyDown((keyEvent: KeyboardEvent) => {
            switch(keyEvent.key) {
                case 'ArrowLeft':
                case 'ArrowRight':
                    this.checkPeek(keyEvent.key, true);
                    break;
                case 'Enter':
                    this.setInputMode(INPUT_DISABLED);
                    this.completeCurrentPart();
                    break;
                default:
                    if ((keyEvent.code as string).startsWith('Digit')) {
                        this.verseEntry.addChar(keyEvent.key);
                    } else if (keyEvent.key === 'Backspace' || keyEvent.key === 'Delete') {
                        this.verseEntry.deleteLastChar();
                    }
                    break;
            }
        });
        INPUT_REFVERSE.onKeyUp((keyEvent: KeyboardEvent) => {
            switch(keyEvent.key) {
                case 'ArrowLeft':
                case 'ArrowRight':
                    this.checkPeek(keyEvent.key, false);
                    break;
            }
        });

        // INPUT_DISABLED is active during transitions and cutscenes;
        // no additional initialization is needed, since it won't do anything.
        INPUT_DISABLED.setScene(this);

        // Send keyboard input to the current InputMode:
        this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
            this.getInputMode()?.processKeyDown(event);
        });
        this.input.keyboard?.on('keyup', (event: KeyboardEvent) => {
            this.getInputMode()?.processKeyUp(event);
        });
    }

    private checkPeek(key: string, isDown: boolean) {
        this.peekKeysDown[key] = isDown;
        const peekVerseIndex: number = (this.peekKeysDown['ArrowLeft'] ? -1 : 0) + (this.peekKeysDown['ArrowRight'] ? 1 : 0);
        if (peekVerseIndex === -1) {
            this.peekVerse('prev');
        } else if (peekVerseIndex === 1) {
            this.peekVerse('next');
        } else {
            this.peekVerse('served');
        }
    }

    private peekVerse(whichVerse: ScrollVerse) {
        if (whichVerse === 'prev' && this.prevVerse) {
            this.showScrollVerse('prev', SWITCH_SHOWN_VERSE_TIME);
        } else if (whichVerse === 'next' && this.nextVerse) {
            this.showScrollVerse('next', SWITCH_SHOWN_VERSE_TIME);
        } else if (whichVerse === 'served') {
            this.showScrollVerse('served', SWITCH_SHOWN_VERSE_TIME);
        }
    }

    private createAttackAnimations() {
        /**
         * The Basic attack uses a simple sprite animation that plays once and disappears.
         */
        this.basicAttackSprite = this.add.sprite(PLAYER_PARTICLE_X, GUESS_SCRIPTURE_Y, 'slash').setOrigin(0, .5).setVisible(false);
        if (!this.anims.exists('slash')) {
            this.anims.create({
                key: 'slash',
                frames: this.anims.generateFrameNumbers(
                    'slash',
                    { start: 0, end: 7 }
                )
            });
        }
        this.anims.get('slash').frameRate = 24 * this.animSpeed;

        /**
         * The Fiery Dart attack uses a sprite projectile that twists as it flies from the enemy to the player.
         */
        this.fieryDartSprite = this.add.sprite(0, 0, 'fiery_dart').setOrigin(.5, .5).setVisible(false);
        if (!this.anims.exists('fiery_dart')) {
            this.anims.create({
                key: 'fiery_dart',
                frames: this.anims.generateFrameNumbers(
                    'fiery_dart',
                    { start: 0, end: 3 }
                ),
                repeat: -1
            });
        }
        this.anims.get('fiery_dart').frameRate = 20 * this.animSpeed;

        /**
         * The Poison attack uses a simple image that flies in an arc toward the player;
         * a particle emitter is used to create a trail of poisonous vapors behind it.
         */
        this.poisonVialImage = this.add.image(0, 0, 'poison_vial').setOrigin(.5, .5).setVisible(false);
        this.poisonVaporEmitter = this.add.particles(0, 0, 'poison_vapor', {
            lifespan: 1000 / this.animSpeed,
            blendMode: Phaser.BlendModes.NORMAL,
            speed: { min: 50, max: 100 },
            scale: { start: 0.1, end: 1.0 },
            alpha: { start: 1.0, end: 0.0 },
            quantity: 1,
            emitting: false,
        });

        /**
         * The Snare attack uses a sprite projectile that flies in an arc toward the player
         * before spreading over him.
         */
        this.snareProjectileSprite = this.add.sprite(0, 0, 'snare_phase1').setOrigin(0.5, 0).setVisible(false);
        this.snareFullSprite = this.add.sprite(0, 0, 'snare_phase2').setOrigin(0.5, 0).setVisible(false);
        if (!this.anims.exists('snare_phase1')) {
            this.anims.create({
                key: 'snare_phase1',
                frames: this.anims.generateFrameNumbers(
                    'snare_phase1',
                    { start: 0, end: 6 }
                )
            });
        }
        this.anims.get('snare_phase1').frameRate = 50 * this.animSpeed;
        if (!this.anims.exists('snare_phase2')) {
            this.anims.create({
                key: 'snare_phase2',
                frames: this.anims.generateFrameNumbers(
                    'snare_phase2',
                    { start: 0, end: 9 }
                )
            });
        }
        this.anims.get('snare_phase2').frameRate = 30 * this.animSpeed;
        if (!this.anims.exists('snare_burst')) {
            this.anims.create({
                key: 'snare_burst',
                frames: this.anims.generateFrameNumbers(
                    'snare_burst',
                    { start: 0, end: 5 }
                )
            });
        }
        this.anims.get('snare_burst').frameRate = 40 * this.animSpeed;

        /**
         * The Smoke attack uses 4 sprites that play the same animation in different positions.
         * Each turn, some words in the scripture will be obscured by smoke puffs.
         */
        this.smokePuffSprites = [];
        for (let i = 0; i < 4; i++) {
            const sprite = this.add.sprite(0, 0, 'smoke_puff').setOrigin(.5, .5).setVisible(false);
            this.smokePuffSprites.push(sprite);
        }
        if (!this.anims.exists('smoke_puff')) {
            this.anims.create({
                key: 'smoke_puff',
                frames: this.anims.generateFrameNumbers(
                    'smoke_puff',
                    { start: 0, end: 9 }
                ),
                repeat: -1
            });
        }
        this.anims.get('smoke_puff').frameRate = 10 * this.animSpeed;
        if (!this.anims.exists('word_smoke')) {
            this.anims.create({
                key: 'word_smoke',
                frames: this.anims.generateFrameNumbers(
                    'word_smoke',
                    { start: 0, end: 3 }
                ),
                repeat: -1
            });
        }
        this.anims.get('word_smoke').frameRate = 6 * this.animSpeed;

        /**
         * The Roar attack emits a series of waves that
         * spread out (scale up) as they fade out.
         *
         * An image will be created for each wave when executed.
         */
    }

    private createPlayerResult() {
        const smallTextStyle = {
            fontFamily: 'dyonisius',
            fontSize: '16px'
        };
        const bigTextStyle = {
            fontFamily: 'dyonisius',
            fontSize: '20px'
        };

        this.resultImage = this.add.image(GFF.GAME_W / 2, RESULT_IMG_Y, 'battle_results_hero').setOrigin(.5, .5).setVisible(false);

        this.guessCaption = this.add.text(0, 0, 'Guessed Reference:', smallTextStyle).setOrigin(.5, 0).setVisible(false);
        this.guessReference = this.add.text(0, 0, 'Genesis 20:20', bigTextStyle).setOrigin(.5, 0).setVisible(false);

        this.actualCaption = this.add.text(0, 0, 'Actual Reference:', smallTextStyle).setOrigin(.5, 0).setVisible(false);
        this.actualCaption.setColor(ACTUAL_CAPTION_COLOR);
        this.actualReference = this.add.text(0, 0, 'Genesis 20:20', bigTextStyle).setOrigin(.5, 0).setVisible(false);
        this.actualReference.setColor(ACTUAL_REF_COLOR);

        this.chapterScoreCaption = this.add.text(0, 0, 'Chapter Score', smallTextStyle).setOrigin(0, 0).setVisible(false);
        this.chapterScoreCaption.setColor(REPORT_TEXT_COLOR);
        this.chapterScoreCalc = this.add.text(0, 0, '+100', smallTextStyle).setOrigin(0, 0).setVisible(false);
        this.chapterScoreCalc.setColor(REPORT_TEXT_COLOR);

        this.verseScoreCaption = this.add.text(0, 0, 'Verse Score', smallTextStyle).setOrigin(0, 0).setVisible(false);
        this.verseScoreCaption.setColor(REPORT_TEXT_COLOR);
        this.verseScoreCalc = this.add.text(0, 0, '+100', smallTextStyle).setOrigin(0, 0).setVisible(false);
        this.verseScoreCalc.setColor(REPORT_TEXT_COLOR);

        this.perfectBonusCaption = this.add.text(0, 0, 'Perfect Bonus', smallTextStyle).setOrigin(0, 0).setVisible(false);
        this.perfectBonusCaption.setColor(REPORT_TEXT_COLOR);
        this.perfectBonusCalc = this.add.text(0, 0, '+100', smallTextStyle).setOrigin(0, 0).setVisible(false);
        this.perfectBonusCalc.setColor(REPORT_TEXT_COLOR);

        this.baseScoreCaption = this.add.text(0, 0, 'Base Score:', bigTextStyle).setOrigin(0, 0).setVisible(false);
        this.baseScoreCaption.setColor(BASE_SCORE_COLOR);
        this.baseScoreCalc = this.add.text(0, 0, '100', bigTextStyle).setOrigin(0, 0).setVisible(false);
        this.baseScoreCalc.setColor(BASE_SCORE_COLOR);

        this.booksMultCaption = this.add.text(0, 0, '66 Books x 10%', smallTextStyle).setOrigin(0, 0).setVisible(false);
        this.booksMultCaption.setColor(REPORT_TEXT_COLOR);
        this.booksMultCalc = this.add.text(0, 0, '+660%', smallTextStyle).setOrigin(0, 0).setVisible(false);
        this.booksMultCalc.setColor(REPORT_TEXT_COLOR);

        this.graceBonusCaption = this.add.text(0, 0, 'Grace Bonus', smallTextStyle).setOrigin(0, 0).setVisible(false);
        this.graceBonusCaption.setColor(REPORT_TEXT_COLOR);
        this.graceBonusCalc = this.add.text(0, 0, '+100%', smallTextStyle).setOrigin(0, 0).setVisible(false);
        this.graceBonusCalc.setColor(REPORT_TEXT_COLOR);

        this.finalScoreCaption = this.add.text(0, 0, 'Final Score:', bigTextStyle).setOrigin(0, 0).setVisible(false);
        this.finalScoreCaption.setColor(FINAL_SCORE_COLOR);
        this.finalScoreCalc = this.add.text(0, 0, '2580', bigTextStyle).setOrigin(0, 0).setVisible(false);
        this.finalScoreCalc.setColor(FINAL_SCORE_COLOR);

        this.playerReportTexts = [
            this.guessCaption,
            this.guessReference,
            this.actualCaption,
            this.actualReference,
            this.chapterScoreCaption,
            this.chapterScoreCalc,
            this.verseScoreCaption,
            this.verseScoreCalc,
            this.perfectBonusCaption,
            this.perfectBonusCalc,
            this.baseScoreCaption,
            this.baseScoreCalc,
            this.booksMultCaption,
            this.booksMultCalc,
            this.graceBonusCaption,
            this.graceBonusCalc,
            this.finalScoreCaption,
            this.finalScoreCalc
        ];
    }

    private createEnemyResult() {
        const smallTextStyle = {
            fontFamily: 'dyonisius',
            fontSize: '16px'
        };
        const bigTextStyle = {
            fontFamily: 'dyonisius',
            fontSize: '20px'
        };

        this.enemyResultImage = this.add.image(GFF.GAME_W / 2, RESULT_IMG_Y, 'battle_results_enemy').setOrigin(.5, .5).setVisible(false);

        this.attackTypeCaption = this.add.text(0, 0, 'Enemy Attack:', smallTextStyle).setOrigin(.5, 0).setVisible(false);
        this.attackTypeCaption.setColor(ATTACK_CAPTION_COLOR);
        this.attackTypeCalc = this.add.text(0, 0, 'Basic', bigTextStyle).setOrigin(.5, 0).setVisible(false);
        this.attackTypeCalc.setColor(ATTACK_CALC_COLOR);
        this.attackEffectCaption = this.add.text(0, 0, 'Effect: Poison', smallTextStyle).setOrigin(.5, 0).setVisible(false);
        this.attackEffectCaption.setColor(ATTACK_CAPTION_COLOR);

        this.attackPowerCaption = this.add.text(0, 0, 'Attack Power', smallTextStyle).setOrigin(0, 0).setVisible(false);
        this.attackPowerCaption.setColor(REPORT_TEXT_COLOR);
        this.attackPowerCalc = this.add.text(0, 0, '+ 100', smallTextStyle).setOrigin(0, 0).setVisible(false);
        this.attackPowerCalc.setColor(REPORT_TEXT_COLOR);

        this.armorCaption = this.add.text(0, 0, 'Armor Absorb', smallTextStyle).setOrigin(0, 0).setVisible(false);
        this.armorCaption.setColor(REPORT_TEXT_COLOR);
        this.armorCalc = this.add.text(0, 0, '- 50%', smallTextStyle).setOrigin(0, 0).setVisible(false);
        this.armorCalc.setColor(REPORT_TEXT_COLOR);

        this.shieldCaption = this.add.text(0, 0, 'Shield Deflect', smallTextStyle).setOrigin(0, 0).setVisible(false);
        this.shieldCaption.setColor(REPORT_TEXT_COLOR);
        this.shieldCalc = this.add.text(0, 0, '- 50%', smallTextStyle).setOrigin(0, 0).setVisible(false);
        this.shieldCalc.setColor(REPORT_TEXT_COLOR);

        this.baseDamageCaption = this.add.text(0, 0, 'Base Damage:', bigTextStyle).setOrigin(0, 0).setVisible(false);
        this.baseDamageCaption.setColor(BASE_DAMAGE_COLOR);
        this.baseDamageCalc = this.add.text(0, 0, '100', bigTextStyle).setOrigin(0, 0).setVisible(false);
        this.baseDamageCalc.setColor(BASE_DAMAGE_COLOR);

        this.statusEffectCaption = this.add.text(0, 0, 'Status: Burning', smallTextStyle).setOrigin(0, 0).setVisible(false);
        this.statusEffectCaption.setColor(REPORT_TEXT_COLOR);
        this.statusEffectCalc = this.add.text(0, 0, '+ 10', smallTextStyle).setOrigin(0, 0).setVisible(false);
        this.statusEffectCalc.setColor(REPORT_TEXT_COLOR);

        this.graceProtectionCaption = this.add.text(0, 0, 'Grace Bonus', smallTextStyle).setOrigin(0, 0).setVisible(false);
        this.graceProtectionCaption.setColor(REPORT_TEXT_COLOR);
        this.graceProtectionCalc = this.add.text(0, 0, '- 100%', smallTextStyle).setOrigin(0, 0).setVisible(false);
        this.graceProtectionCalc.setColor(REPORT_TEXT_COLOR);

        this.finalDamageCaption = this.add.text(0, 0, 'Final Damage:', bigTextStyle).setOrigin(0, 0).setVisible(false);
        this.finalDamageCaption.setColor(FINAL_DAMAGE_COLOR);
        this.finalDamageCalc = this.add.text(0, 0, '100', bigTextStyle).setOrigin(0, 0).setVisible(false);
        this.finalDamageCalc.setColor(FINAL_DAMAGE_COLOR);

        this.enemyReportTexts = [
            this.attackTypeCaption,
            this.attackTypeCalc,
            this.attackEffectCaption,
            this.attackPowerCaption,
            this.attackPowerCalc,
            this.armorCaption,
            this.armorCalc,
            this.shieldCaption,
            this.shieldCalc,
            this.baseDamageCaption,
            this.baseDamageCalc,
            this.statusEffectCaption,
            this.statusEffectCalc,
            this.graceProtectionCaption,
            this.graceProtectionCalc,
            this.finalDamageCaption,
            this.finalDamageCalc
        ];
    }

    private layoutPlayerResult(isPerfect: boolean) {
        const smallGap: number = 18;
        const largeGap: number = 28;

        // If not perfect, make a small adjustment
        // because the Perfect Bonus line won't be there:
        let y: number = 486 + (isPerfect ? 0 : 10);

        this.guessCaption.setPosition(GFF.GAME_W / 2, y);
        y += smallGap;
        this.guessReference.setPosition(GFF.GAME_W / 2, y);
        y += largeGap;

        this.actualCaption.setPosition(GFF.GAME_W / 2, y);
        y += smallGap;
        this.actualReference.setPosition(GFF.GAME_W / 2, y);
        y += largeGap;

        this.chapterScoreCaption.setPosition(SCORE_CAPTION_X, y);
        this.chapterScoreCalc.setPosition(SCORE_CALC_X, y);
        y += smallGap;

        this.verseScoreCaption.setPosition(SCORE_CAPTION_X, y);
        this.verseScoreCalc.setPosition(SCORE_CALC_X, y);
        y += smallGap;

        if (isPerfect) {
            this.perfectBonusCaption.setPosition(SCORE_CAPTION_X, y);
            this.perfectBonusCalc.setPosition(SCORE_CALC_X, y);
            y += smallGap;
        }

        this.baseScoreCaption.setPosition(SCORE_CAPTION_X, y);
        this.baseScoreCalc.setPosition(SCORE_CALC_X, y);
        y += largeGap;

        this.booksMultCaption.setPosition(SCORE_CAPTION_X, y);
        this.booksMultCalc.setPosition(SCORE_CALC_X, y);
        y += smallGap;

        this.graceBonusCaption.setPosition(SCORE_CAPTION_X, y);
        this.graceBonusCalc.setPosition(SCORE_CALC_X, y);
        y += smallGap;

        this.finalScoreCaption.setPosition(SCORE_CAPTION_X, y);
        this.finalScoreCalc.setPosition(SCORE_CALC_X, y);
    }

    private layoutEnemyResult(newEffect: boolean, existingEffect: boolean) {
        const smallGap: number = 18;
        const largeGap: number = 28;

        // If status effect lines are ommitted, make some
        // small adjustments to keep everything centered.
        let y: number = 496 + (newEffect ? 0 : 10) + (existingEffect ? 0 : 10);
        this.attackTypeCaption.setPosition(GFF.GAME_W / 2, y);
        y += smallGap;
        this.attackTypeCalc.setPosition(GFF.GAME_W / 2, y);
        if (newEffect) {
            y += smallGap;
            this.attackEffectCaption.setPosition(GFF.GAME_W / 2, y);
        }
        y += largeGap;

        this.attackPowerCaption.setPosition(SCORE_CAPTION_X, y);
        this.attackPowerCalc.setPosition(SCORE_CALC_X, y);
        y += smallGap;

        this.armorCaption.setPosition(SCORE_CAPTION_X, y);
        this.armorCalc.setPosition(SCORE_CALC_X, y);
        y += smallGap;
        this.shieldCaption.setPosition(SCORE_CAPTION_X, y);
        this.shieldCalc.setPosition(SCORE_CALC_X, y);
        y += smallGap;

        this.baseDamageCaption.setPosition(SCORE_CAPTION_X, y);
        this.baseDamageCalc.setPosition(SCORE_CALC_X, y);
        y += largeGap;

        if (existingEffect) {
            this.statusEffectCaption.setPosition(SCORE_CAPTION_X, y);
            this.statusEffectCalc.setPosition(SCORE_CALC_X, y);
            y += smallGap;
        }

        this.graceProtectionCaption.setPosition(SCORE_CAPTION_X, y);
        this.graceProtectionCalc.setPosition(SCORE_CALC_X, y);
        y += smallGap;

        this.finalDamageCaption.setPosition(SCORE_CAPTION_X, y);
        this.finalDamageCalc.setPosition(SCORE_CALC_X, y);
    }

    private canDoSpecialAttack(disallowIfStatusEffect: boolean): boolean {
        return !this.specialAttackUsed
            && (!disallowIfStatusEffect || this.currentStatusEffect === null)
            && RANDOM.randPct() < GFF.getDifficulty().enemySpecialFrequency;
    }

    private loadEnemyAttacks() {
        const ENEMY_ATTACKS: GEnemyAttack[] = [
            {
                attackName: 'Basic',
                enemies: ['minion', 'Mammon', 'Beelzebub', 'Belial', 'Legion', 'Apollyon', 'Lucifer', 'Dragon'],
                minLevel: 0,
                text: '_ attacks!',
                soundKey: 'kapow',
                statusEffect: null,
                animFunc: (nextStep: Function) => {
                    this.basicAttackSprite.setVisible(true);
                    this.basicAttackSprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                        this.basicAttackSprite.setVisible(false);
                        nextStep();
                    });
                    this.basicAttackSprite.play('slash');
                },
                damageFunc: () => {return ENEMY.getBaseDamage();},
                condFunc: () => {return true;},
            },
            {
                attackName: 'Fiery Dart',
                enemies: ['minion', 'Beelzebub'],
                minLevel: GFF.getDifficulty().enemyLevelsPerSpecial * 1,
                text: '_ hurls a fiery dart!',
                soundKey: 'fiery_dart',
                statusEffect: null,
                animFunc: (nextStep: Function) => {
                    this.fieryDartSprite.setPosition(this.enemyAvatar.x + this.enemyAvatar.width / 3, this.enemyAvatar.y + this.enemyAvatar.height / 3);
                    this.fieryDartSprite.setVisible(true);
                    // The sprite animation rotates 4 frames
                    this.fieryDartSprite.play('fiery_dart');
                    // Tween makes the dart shrink and grow as it flies, appearing to spin
                    this.tweens.add({
                        targets: this.fieryDartSprite,
                        scaleY: 0.25,
                        duration: 300 / this.animSpeed,
                        yoyo: true,
                        repeat: 4,
                    });
                    // Tween makes the dart bob up and down as it flies:
                    this.tweens.add({
                        targets: this.fieryDartSprite,
                        y: this.fieryDartSprite.y - 16,
                        duration: 150 / this.animSpeed,
                        ease: 'Sine.easeInOut',
                        yoyo: true,
                        repeat: 9
                    });
                    // Tween makes the dart fly across the screen:
                    this.tweens.add({
                        targets: this.fieryDartSprite,
                        x: PLAYER_PARTICLE_X,
                        duration: 1500 / this.animSpeed,
                        ease: 'Linear',
                        onComplete: () => {
                            this.fieryDartSprite.setVisible(false);
                            this.fieryDartSprite.stop();
                            nextStep();
                        }
                    });
                },
                damageFunc: () => {return Math.ceil(ENEMY.getBaseDamage() * RANDOM.randFloat(1.25, 1.75));},
                condFunc: () => {return this.canDoSpecialAttack(false);},
            },
            {
                attackName: 'Poison',
                enemies: ['minion', 'Legion'],
                minLevel: GFF.getDifficulty().enemyLevelsPerSpecial * 3,
                text: '_ uses a deadly poison!',
                soundKey: 'poison',
                statusEffect: POISON_EFFECT,
                animFunc: (nextStep: Function) => {
                    const startY: number = this.enemyAvatar.y + this.enemyAvatar.height / 3;
                    this.poisonVialImage.setPosition(this.enemyAvatar.x + this.enemyAvatar.width / 3, startY).setVisible(true);
                    this.poisonVaporEmitter.setPosition(this.poisonVialImage.x, this.poisonVialImage.y).setVisible(true).setAbove(this.poisonVialImage);
                    this.poisonVaporEmitter.emitParticle(1);
                    this.poisonVaporEmitter.setFrequency(20 / this.animSpeed);
                    this.poisonVaporEmitter.start();
                    this.tweens.add({
                        targets: this.poisonVialImage,
                        x: PLAYER_PARTICLE_X,
                        duration: 1200 / this.animSpeed,
                        ease: 'Linear',
                        onUpdate: (tween, target) => {
                            const progress = tween.progress;
                            target.y = startY - Math.sin(progress * Math.PI) * 40;
                            this.poisonVaporEmitter.setPosition(target.x, target.y);
                        },
                        onComplete: () => {
                            this.poisonVialImage.setVisible(false);
                            this.poisonVaporEmitter.stop();
                            this.startPoisonPulse();
                            this.createNewStatusEffect(POISON_EFFECT, nextStep);
                        }
                    });
                },
                damageFunc: () => {return 0;},
                condFunc: () => {return this.canDoSpecialAttack(true);},
            },
            {
                attackName: 'Snare',
                enemies: ['minion', 'Mammon'],
                minLevel: GFF.getDifficulty().enemyLevelsPerSpecial * 2,
                text: '_ casts a snare!',
                soundKey: 'miss',
                statusEffect: ENSNARE_EFFECT,
                animFunc: (nextStep: Function) => {
                    const startX: number = this.enemyAvatar.x + (this.enemyAvatar.width * .3);
                    const startY: number = this.playerAvatar.y + (this.playerBaseImage.height * .3);
                    const finalX: number = this.playerAvatar.x + (this.playerBaseImage.width * .3);
                    const finalY: number = this.playerAvatar.y - 40;
                    this.snareProjectileSprite
                        .setPosition(startX, startY)
                        .setVisible(true)
                        .setScale(0.5)
                        .play({ key: 'snare_phase1', repeat: 10 });
                    this.tweens.addCounter({
                        from: 0,
                        to: 1,
                        duration: 1500 / this.animSpeed,
                        ease: 'Linear',
                        onUpdate: (tween) => {
                            const t = tween.getValue() as number;
                            const xT = Phaser.Math.Easing.Cubic.Out(t);
                            const x = Phaser.Math.Linear(startX, finalX, xT);
                            const peakY = finalY - 50;
                            const splitT = 0.5;
                            let y: number;
                            if (t < splitT) {
                                const riseT = t / splitT;
                                y = Phaser.Math.Linear(startY, peakY, Phaser.Math.Easing.Quadratic.Out(riseT));
                            } else {
                                const fallT = (t - splitT) / (1 - splitT);
                                y = Phaser.Math.Linear(peakY, finalY + 35, Phaser.Math.Easing.Quadratic.In(fallT));
                            }
                            this.snareProjectileSprite.setPosition(x, y);
                            this.snareProjectileSprite.setScale(
                                Phaser.Math.Linear(0.5, 1.0, Phaser.Math.Easing.Quadratic.Out(t))
                            );
                        },
                        onComplete: () => {
                            this.snareProjectileSprite.setVisible(false);
                            this.snareFullSprite.setPosition(finalX, finalY + 30).setVisible(true);
                            this.snareFullSprite.play('snare_phase2');
                            this.getSound().playSound('wind_rush');
                            this.snareFullSprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                                this.createNewStatusEffect(ENSNARE_EFFECT, nextStep);
                            });
                        },
                    });
                },
                damageFunc: () => {return 0;},
                condFunc: () => {return this.canDoSpecialAttack(true);},
            },
            {
                attackName: 'Smoke',
                enemies: ['minion', 'Belial', 'Dragon'],
                minLevel: GFF.getDifficulty().enemyLevelsPerSpecial * 4,
                text: '_ creates a veiling smoke!',
                soundKey: 'wind_rush',
                statusEffect: null,
                animFunc: (nextStep: Function) => {
                    this.smokePuffSprites[0].setPosition(this.enemyAvatar.x + (this.enemyAvatar.width * .3), this.enemyAvatar.y + (this.enemyAvatar.height * .3))
                        .setOrigin(0.5, 0.5).setScale(0.1).setVisible(true);
                    this.smokePuffSprites[0].play('smoke_puff');
                    const destX = this.playerAvatar.x + (this.playerBaseImage.width * .3);
                    this.tweens.add({
                        targets: this.smokePuffSprites[0],
                        x: destX,
                        scale: 1.0,
                        duration: 1600 / this.animSpeed,
                        ease: 'Linear',
                        onComplete: () => {
                            this.tweens.add({
                                targets: this.smokePuffSprites[0],
                                scale: .1,
                                duration: 120 / this.animSpeed,
                                ease: 'Linear',
                                onComplete: () => {
                                    const ctrOffset = 18;
                                    this.smokePuffSprites[3].setPosition(this.smokePuffSprites[0].x, this.smokePuffSprites[0].y + ctrOffset).setOrigin(0.5, 1.0);
                                    this.smokePuffSprites[2].setPosition(this.smokePuffSprites[0].x, this.smokePuffSprites[0].y - ctrOffset).setOrigin(0.5, 0.0);
                                    this.smokePuffSprites[1].setPosition(this.smokePuffSprites[0].x + ctrOffset, this.smokePuffSprites[0].y).setOrigin(1.0, 0.5);
                                    this.smokePuffSprites[0].setPosition(this.smokePuffSprites[0].x - ctrOffset, this.smokePuffSprites[0].y).setOrigin(0.0, 0.5);
                                    // Begin playing each puff animation at a different frame
                                    this.smokePuffSprites.forEach((s, i) => s.setScale(0.1).setVisible(true).play('smoke_puff').anims.setCurrentFrame(this.anims.get('smoke_puff').getFrameAt(i * 2)));
                                    this.tweens.add({
                                        targets: this.smokePuffSprites,
                                        scale: 1.0,
                                        duration: 200 / this.animSpeed,
                                        ease: 'Linear',
                                        onComplete: () => {
                                            this.createNewStatusEffect(VEIL_EFFECT, nextStep);
                                        }
                                    });
                                    this.getSound().playSound('imp_poof');
                                }
                            });
                        }
                    });
                },
                damageFunc: () => {return 0;},
                condFunc: () => {return this.canDoSpecialAttack(true);},
            },
            {
                attackName: 'Roar',
                enemies: ['minion', 'Apollyon', 'Dragon'],
                minLevel: GFF.getDifficulty().enemyLevelsPerSpecial * 5,
                text: '_ emits a terrifying roar!',
                soundKey: 'roar',
                statusEffect: FEAR_EFFECT,
                animFunc: (nextStep: Function) => {
                    const startX: number = this.enemyAvatar.x + (this.enemyAvatar.width * 0.3);
                    const startY: number = this.enemyAvatar.y + (this.enemyAvatar.height * 0.3);
                    const destX: number = this.playerAvatar.x + this.playerBaseImage.width + 100;

                    const waveCount = 5;
                    const waveDuration = 1200 / this.animSpeed;
                    const waveDelay = waveDuration / 3;

                    let completedWaves = 0;

                    const spawnWave = (): void => {
                        const roarWaveImage = this.add.image(startX, startY, 'roar_wave')
                            .setOrigin(0.5, 0.5)
                            .setAlpha(0.75)
                            .setScale(0.1);

                        this.tweens.add({
                            targets: roarWaveImage,
                            x: destX,
                            scale: 2.0,
                            alpha: 0,
                            duration: waveDuration,
                            ease: 'Linear',
                            onComplete: () => {
                                roarWaveImage.destroy();
                                completedWaves++;

                                if (completedWaves === waveCount) {
                                    this.createNewStatusEffect(FEAR_EFFECT, nextStep);
                                    this.startFear();
                                }
                            }
                        });
                    };

                    for (let i = 0; i < waveCount; i++) {
                        this.time.delayedCall(i * waveDelay, () => {
                            spawnWave();
                        });
                    }
                },
                damageFunc: () => {return 0;},
                condFunc: () => {return this.canDoSpecialAttack(true);},
            },
        ];

        this.enemyAttacks = [];
        ENEMY_ATTACKS.forEach(a => {
            // Check if the enemy is eligible for this attack:
            if (
                // Enemy must be in the list:
                a.enemies.includes(ENEMY.getCurrentSpirit().type)
                // Enemy must be a boss, or a minion of sufficient level:
                && (ENEMY.getCurrentSpirit().type !== 'minion' || a.minLevel <= ENEMY.getCurrentSpirit().level)
            ) {
                // Eligible: add to array of attacks:
                this.enemyAttacks.push(a);
            }
        });
    }

    private showUI() {
        this.enemyPortraitImage.setVisible(true).setAlpha(0);
        this.playerBar.setVisible(true).setAlpha(0);
        this.enemyBar.setVisible(true).setAlpha(0);
        this.playerMeterImage.setVisible(true).setAlpha(0);
        this.enemyMeterImage.setVisible(true).setAlpha(0);
        this.vsImage.setVisible(true).setAlpha(0);
        this.playerMeterTextShadow.setVisible(true).setAlpha(0);
        this.playerMeterText.setVisible(true).setAlpha(0);
        this.enemyMeterTextShadow.setVisible(true).setAlpha(0);
        this.enemyMeterText.setVisible(true).setAlpha(0);
        this.playerLevelText.setVisible(true).setAlpha(0);
        this.enemyLevelText.setVisible(true).setAlpha(0);
        this.playerNameTextShadow.setVisible(true).setAlpha(0);
        this.playerNameText.setVisible(true).setAlpha(0);
        this.enemyNameTextShadow.setVisible(true).setAlpha(0);
        this.enemyNameText.setVisible(true).setAlpha(0);

        this.tweens.add({
            targets: [
                this.enemyPortraitImage,
                this.playerBar,
                this.enemyBar,
                this.playerMeterImage,
                this.enemyMeterImage,
                this.vsImage,
                this.playerMeterTextShadow,
                this.playerMeterText,
                this.enemyMeterTextShadow,
                this.enemyMeterText,
                this.playerLevelText,
                this.enemyLevelText,
                this.playerNameTextShadow,
                this.playerNameText,
                this.enemyNameTextShadow,
                this.enemyNameText
            ],
            duration: 300 / this.animSpeed,
            alpha: 1.0,
            onComplete: () => {
                this.doApproach();
            }
        });
    }

    private createAvatars(enemyImageKey: string) {
        // Player and enemy begin off the screen

        // Add the player avatar as a container of images:
        this.playerBaseImage = this.add.image(0, 0, 'adam_base').setOrigin(0, 0);
        const shoesImage = this.add.image(24, 240, 'adam_shoes').setOrigin(0, 0).setVisible(ARMORS.hasArmor(5));
        const breastplateImage = this.add.image(21, 72, 'adam_breastplate').setOrigin(0, 0).setVisible(ARMORS.hasArmor(4));
        const girdleImage = this.add.image(37, 132, 'adam_girdle').setOrigin(0, 0).setVisible(ARMORS.hasArmor(6));
        this.playerArmImage = this.add.image(17, 116, 'adam_arm').setOrigin(0, 0);
        const helmetImage = this.add.image(35, 0, 'adam_helmet').setOrigin(0, 0).setVisible(ARMORS.hasArmor(2));
        this.playerShieldImage = this.add.image(0, 97, 'adam_shield').setOrigin(0, 0).setVisible(ARMORS.hasArmor(3));
        // (Shield is last, because when it moves, it needs to be above everything else)

        this.playerAvatar = this.add.container(0, 0);
        this.playerAvatar.add([
            this.playerBaseImage,
            shoesImage,
            breastplateImage,
            girdleImage,
            this.playerArmImage,
            helmetImage,
            this.playerShieldImage,
        ]);
        this.playerAvatar.setPosition(-this.playerBaseImage.width, AVATAR_BOTTOM - this.playerBaseImage.height);

        this.enemyAvatar = this.add.image(0, 0, enemyImageKey).setOrigin(0, 0);
        this.enemyAvatar.setPosition(GFF.GAME_W, AVATAR_BOTTOM - this.enemyAvatar.height);
    }

    private doApproach() {
        // Get final destinations:
        const playerDestX: number = APPROACH_GAP;
        // (enemies come in different sizes; if the normal size makes him too close, only come as far as the player)
        const enemyDestX: number = Math.max(GFF.GAME_W - APPROACH_GAP - this.enemyAvatar.width, GFF.GAME_W - APPROACH_GAP - this.playerBaseImage.width);

        // Create tween to advance player:
        this.tweens.add({
            targets: this.playerAvatar,
            x: playerDestX,
            duration: APPROACH_TIME / this.animSpeed,
            onComplete: () => {
                this.beginRound();
            }
        });
        // Create tween to advance enemy:
        this.tweens.add({
            targets: this.enemyAvatar,
            x: enemyDestX,
            duration: APPROACH_TIME / this.animSpeed
        });
    }

    private doPlayerAttack() {
        const score: number = this.evaluateGuess();
        this.eventText.text = `Adam wields the book of ${this.bookText.text}!`;
        this.eventText.setVisible(true);
        this.eventText.alpha = 0;
        this.tweens.add({
            targets: this.eventText,
            alpha: 1.0,
            duration: 200 / this.animSpeed,
            onComplete: () => {
                this.tweens.add({
                    targets: this.swordImage,
                    x: SWORD_RETRACT_X,
                    duration: 500 / this.animSpeed,
                    ease: 'Power2',
                    onComplete: () => {
                        this.getSound().playSound('thrust');
                        if (this.bookText.text === this.servedVerse.book) {
                            this.doSuccessfulPlayerAttack(score / 10);
                        } else {
                            this.doMissedPlayerAttack();
                        }
                    }
                });
            }
        });
    }

    private doSuccessfulPlayerAttack(damage: number) {
        this.tweens.add({
            targets: this.swordImage,
            x: SWORD_HIT_X,
            duration: 200 / this.animSpeed,
            onComplete: () => {
                this.getSound().playSound('splooge');
                this.damageEnemyResistance(damage);
            }
        });
    }

    private doMissedPlayerAttack() {
        this.tweens.add({
            targets: this.swordImage,
            x: SWORD_MISS_X,
            duration: 200 / this.animSpeed,
            alpha: 0,
            onComplete: () => {
                if (this.currentStatusEffect === FEAR_EFFECT) {
                    this.eventText.text = FLEE_EVENT_TEXT;
                    this.time.delayedCall(500 / this.animSpeed, () => {
                        this.getSound().playSound('miss').once('complete', () => {
                            this.damagePlayerFaith(PLAYER.getFaith(), 'scream', () => {});
                        });
                    });
                } else {
                    this.eventText.text = 'Adam missed!';
                    this.getSound().playSound('miss').once('complete', () => {
                        this.setCurrentStage(BattleStage.END_PLAYER_TURN);
                    });
                }
            }
        });
    }

    private startEnemyTurn() {
        const eligibleAttacks: GEnemyAttack[] = this.enemyAttacks.filter(a => a.condFunc());
        const chosenAttack: GEnemyAttack = RANDOM.randElement(eligibleAttacks);

        this.playerReportTexts.forEach(t => t.setVisible(false));
        this.tweens.add({
            targets: this.resultImage,
            duration: 200 / this.animSpeed,
            scale: 0.0
        });

        // Before fading out the served verse, make sure it's the one visible:
        this.peekVerse('served');

        this.tweens.add({
            targets: [
                this.scrollOpenImage,
                this.servedVerseContainer,
                this.eventText,
            ],
            duration: 500 / this.animSpeed,
            alpha: 0.0,
            onComplete: () => {
                this.eventText.alpha = 1.0;
                this.eventText.setVisible(true);
                this.eventText.text = chosenAttack.text.replace('_', ENEMY.getCurrentSpirit().name);
                this.time.delayedCall(700 / this.animSpeed, () => {
                    this.doEnemyAttack(chosenAttack);
                });
            }
        });
    }

    private finishEnemyTurn() {
        this.enemyReportTexts.forEach(t => t.setVisible(false));
        this.tweens.add({
            targets: this.enemyResultImage,
            duration: 200 / this.animSpeed,
            scale: 0.0,
            onComplete: () => {
                this.enemyResultImage.setVisible(false);
            }
        });

        this.tweens.add({
            targets: [
                this.eventText
            ],
            duration: 500 / this.animSpeed,
            alpha: 0.0,
            onComplete: () => {
                this.beginRound();
            }
        });
    }

    private beginRound() {
        // Tick down status effect duration and remove if expired:
        if (this.statusEffectDuration > 0) {
            this.statusEffectDuration--;
            const text = `${this.currentStatusEffect === ENSNARE_EFFECT ? this.statusEffectDuration - 1 : this.statusEffectDuration}`;
            this.statusEffectDurationText.setText(text);
            if (this.statusEffectDuration === 0) {
                this.removeStatusEffect(() => {
                    this.time.delayedCall(500 / this.animSpeed, () => {
                        this.serveScroll();
                    });
                });
                return;
            }
        }
        if (this.currentStatusEffect === ENSNARE_EFFECT) {
            this.doSnareStruggle();
        } else {
            this.time.delayedCall(500 / this.animSpeed, () => {
                this.serveScroll();
            });
        }
    }

    private serveScroll() {
        // Get a new scripture to serve:
        this.getRandomScriptureContext()

        // Let the scroll fly in!
        this.scrollClosedImage.setPosition(GFF.GAME_W / 2, GFF.GAME_H)
            .setVisible(true).setScale(0).setAngle(0);

        // Prepare side rolls and open scroll:
        this.leftRollImage.setPosition(LEFT_ROLL_START_X, SCROLL_Y).setVisible(false);
        this.rightRollImage.setPosition(RIGHT_ROLL_START_X, SCROLL_Y).setVisible(false);
        this.scrollOpenImage.setVisible(false);
        this.scrollOpenImage.alpha = 1.0;

        this.getSound().playSound('scroll_toss');
        const finalY = SCROLL_Y + 105;
        this.tweens.add({
            targets: this.scrollClosedImage,
            scaleX: 1,
            scaleY: 1,
            angle: 1080,
            ease: 'Power1',
            duration: 900 / this.animSpeed
        });
        this.tweens.chain({
            targets: this.scrollClosedImage,
            duration: 900 / this.animSpeed,
            tweens: [
                {
                    // Phase 1: Rise up
                    y: this.cameras.main.height * 0.3,
                    ease: 'Quad.easeOut',
                    duration: 600 / this.animSpeed
                },
                {
                    // Phase 2: Fall back down
                    y: finalY,
                    ease: 'Power1',
                    duration: 300 / this.animSpeed,
                    onComplete: () => {
                        const crop: Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle(this.scrollOpenImage.width / 2, 0, 0, this.scrollOpenImage.height);
                        this.scrollClosedImage.setVisible(false);
                        this.scrollOpenImage.setVisible(true);
                        this.scrollOpenImage.setCrop(crop);

                        this.leftRollImage.setVisible(true);
                        this.rightRollImage.setVisible(true);

                        this.getSound().playSound('scroll');

                        this.tweens.add({
                            targets: this.leftRollImage,
                            duration: 500 / this.animSpeed,
                            x: LEFT_ROLL_END_X
                        });
                        this.tweens.add({
                            targets: this.rightRollImage,
                            duration: 500 / this.animSpeed,
                            x: RIGHT_ROLL_END_X
                        });
                        this.tweens.add({
                            targets: crop,
                            duration: 500 / this.animSpeed,
                            x: 0,
                            width: this.scrollOpenImage.width,
                            onUpdate: () => {
                                this.scrollOpenImage.setCrop(crop);
                            },
                            onComplete: () => {
                                this.leftRollImage.setVisible(false);
                                this.rightRollImage.setVisible(false);
                                this.showScrollVerse('served', SHOW_SERVED_VERSE_TIME, () => {
                                    this.allowGuess();
                                });
                            }
                        });
                    }
                }
            ]
        });
    }

    public showScrollVerse(whichVerse: ScrollVerse, defaultFadeTime: number, nextStep?: Function) {
        let container: Phaser.GameObjects.Container;
        const otherContainers: Phaser.GameObjects.Container[] = [];
        switch (whichVerse) {
            case 'served':
                container = this.servedVerseContainer;
                otherContainers.push(this.prevVerseContainer, this.nextVerseContainer);
                break;
            case 'prev':
                container = this.prevVerseContainer;
                otherContainers.push(this.servedVerseContainer, this.nextVerseContainer);
                break;
            case 'next':
                container = this.nextVerseContainer;
                otherContainers.push(this.servedVerseContainer, this.prevVerseContainer);
                break;
        }

        // If other containers are transparent, hide them so they aren't shown in the tween
        otherContainers.forEach(c => {
            if (c.alpha === 0) {
                c.setVisible(false);
            }
        });

        // Fade in the container:
        container.setAlpha(0.0);
        container.setVisible(true);
        this.tweens.add({
            targets: container,
            duration: defaultFadeTime / this.animSpeed,
            alpha: 1.0,
            onUpdate: () => {
                // Fade out the other containers (no effect if they're not visible):
                otherContainers.forEach(c => {
                    c.setAlpha(1.0 - container.alpha);
                });
            },
            onComplete: () => {
                if (nextStep !== undefined) {
                    nextStep();
                }
            }
        });
    }

    public allowGuess() {
        // Clear replace text objects:
        this.bookText.text = '';
        this.chapterText.text = '';
        this.verseText.text = '';

        // Clear entry objects:
        // (don't care about book; it will always be set to something, and it doesn't matter what)
        this.chapterEntry.setEnteredText('');
        this.verseEntry.setEnteredText('');

        // Set to the book entry stage:
        this.time.delayedCall(500 / this.animSpeed, () => {
            this.setCurrentStage(BattleStage.BOOK);
        });
    }

    private completeCurrentPart() {
        this.setInputMode(INPUT_DISABLED);
        switch (this.currentStage) {
            case BattleStage.BOOK:
                this.setCurrentStage(BattleStage.CHAPTER);
                break;
            case BattleStage.CHAPTER:
                if (this.chapterEntry.isEnteredTextValid()) {
                    this.setCurrentStage(BattleStage.VERSE);
                } else {
                    this.getSound().playSound('error_buzz');
                    this.setInputMode(INPUT_REFCHAPTER);
                }
                break;
            case BattleStage.VERSE:
                if (this.verseEntry.isEnteredTextValid()) {
                    this.setCurrentStage(BattleStage.PLAYER_ATTACK);
                } else {
                    this.getSound().playSound('error_buzz');
                    this.setInputMode(INPUT_REFVERSE);
                }
                break;
            default:
        }
    }

    private setCurrentStage(newStage: BattleStage) {

        // This is called if the Player loses to Fear, normal damage, or status effect damage
        const enemyLaughsWhenYouLose: Function = () => {
            this.getSound().playSound('enemy_laugh').once('complete', () => {
                this.setInputMode(INPUT_PROMPTENTER);
            });
        }

        const setup: Function = () => {
            // Set new stage:
            this.currentStage = newStage;
            // Begin new stage:
            switch (this.currentStage) {
                case BattleStage.BOOK:
                    this.beginPartEntry(this.bookWheel, this.bookText, () => {
                        this.stageText.setVisible(true);
                        this.stageText.setX(this.bookWheel.x);
                        this.stageText.text = 'Choose Book:';
                        this.setInputMode(INPUT_REFBOOK);
                    });
                    break;
                case BattleStage.CHAPTER:
                    this.beginPartEntry(this.chapterEntry, this.chapterText, () => {
                        this.stageText.setVisible(true);
                        this.stageText.setX(this.chapterEntry.x);
                        this.stageText.text = 'Enter Chapter:';
                        this.setInputMode(INPUT_REFCHAPTER);
                    });
                    break;
                case BattleStage.VERSE:
                    this.beginPartEntry(this.verseEntry, this.verseText, () => {
                        this.stageText.setVisible(true);
                        this.stageText.setX(this.verseEntry.x);
                        this.stageText.text = 'Enter Verse:';
                        this.setInputMode(INPUT_REFVERSE);
                    });
                    break;
                case BattleStage.PLAYER_ATTACK:
                    this.finishGuess();
                    break;
                case BattleStage.END_PLAYER_TURN:
                    this.showGuessResult(() => {
                        this.setInputMode(INPUT_PROMPTENTER);
                    });
                    break;
                case BattleStage.ENEMY_ATTACK:
                    this.startEnemyTurn();
                    break;
                case BattleStage.END_ENEMY_TURN:
                    this.setInputMode(INPUT_PROMPTENTER);
                    break;
                case BattleStage.VICTORY:
                    this.showGuessResult(() => {
                        this.setInputMode(INPUT_PROMPTENTER);
                    });
                    break;
                case BattleStage.DEFEAT:
                    // If the player fled, don't show enemy attack result;
                    // instead, show the player guess result, because he flees when
                    // missing under the fear effect, which is a consequence of a bad guess.
                    if (this.eventText.text === FLEE_EVENT_TEXT) {
                        this.enemyResultImage.setVisible(false);
                        this.showGuessResult(enemyLaughsWhenYouLose);
                    }
                    // This check is necessary because defeat may be triggered by
                    // status effect damage AFTER the enemy's attack, and in that
                    // case, the enemy result is already shown - don't re-show.
                    else if (!this.enemyResultImage.visible) {
                        this.showEnemyAttackResult(enemyLaughsWhenYouLose);
                    } else {
                        enemyLaughsWhenYouLose();
                    }
                    break;
            }
        };

        // Clean up old stage:
        // Each case MUST call setup(), or the new stage won't be set!
        switch (this.currentStage) {
            case BattleStage.NONE:
                setup();
                break;
            case BattleStage.BOOK:
                this.completePartEntry(this.bookWheel, this.bookText, setup);
                break;
            case BattleStage.CHAPTER:
                this.completePartEntry(this.chapterEntry, this.chapterText, setup);
                break;
            case BattleStage.VERSE:
                this.completePartEntry(this.verseEntry, this.verseText, setup, true);
                break;
            case BattleStage.PLAYER_ATTACK:
                setup();
                break;
            case BattleStage.END_PLAYER_TURN:
                setup();
                break;
            case BattleStage.ENEMY_ATTACK:
                setup();
                break;
            case BattleStage.END_ENEMY_TURN:
                setup();
                break;
            default:
        }
    }

    // Fades in entry control while fading out its replacement text object:
    private beginPartEntry(entryPart: GTextEntryControl, replaceText: Phaser.GameObjects.Text, whenComplete?: Function) {
        entryPart.setVisible(true);
        entryPart.alpha = 0;
        replaceText.setVisible(true);
        replaceText.alpha = 1;

        this.tweens.add({
            targets: entryPart,
            duration: 500 / this.animSpeed,
            alpha: 1.0,
            onUpdate: () => {
                replaceText.alpha = 1.0 - entryPart.alpha;
            },
            onComplete: () => {
                if (whenComplete !== undefined) {
                    whenComplete();
                }
            }
        });
    }

    // Fades out entry control while fading in its replacement text object:
    private completePartEntry(entryPart: GTextEntryControl, replaceText: Phaser.GameObjects.Text, whenComplete: Function, showColon: boolean = false) {
        this.stageText.setVisible(false);
        entryPart.setVisible(true);
        entryPart.alpha = 1;
        replaceText.setVisible(true);
        replaceText.alpha = 0;
        replaceText.setText(entryPart.getEnteredText());
        if (showColon) {
            const colonX: number = (this.chapterText.getRightCenter().x + this.verseText.getLeftCenter().x) / 2;
            this.colonText.setVisible(true);
            this.colonText.alpha = 0;
            this.colonText.setX(colonX);
        }
        this.tweens.add({
            targets: entryPart,
            duration: 500 / this.animSpeed,
            alpha: 0.0,
            onUpdate: () => {
                replaceText.alpha = 1.0 - entryPart.alpha;
                if (showColon) {
                    this.colonText.alpha = replaceText.alpha;
                }
            },
            onComplete: () => {
                whenComplete();
            }
        });
    }

    private finishGuess() {
        this.swordImage.setVisible(true);
        this.swordImage.alpha = 0;
        this.swordImage.setX(SWORD_START_X);
        this.tweens.add({
            targets: [this.bookText, this.chapterText, this.colonText, this.verseText],
            duration: 200 / this.animSpeed,
            alpha: 0.0,
            delay: 500 / this.animSpeed,
            onUpdate: () => {
                this.swordImage.alpha = 1.0 - this.bookText.alpha;
            },
            onComplete: () => {
                this.bookText.setVisible(false);
                this.chapterText.setVisible(false);
                this.colonText.setVisible(false);
                this.verseText.setVisible(false);
                this.doPlayerAttack();
            }
        });
    }

    private evaluateGuess(): number {
        const chapters: Element[] = BIBLE.getAllChaptersForBook(this.servedVerse.book);

        const actualChapter: number = this.servedVerse.chapter;
        const actualVerse: number = this.servedVerse.verse;

        const guessChapter: number = parseInt(this.chapterText.text);
        const guessVerse: number = parseInt(this.verseText.text);

        const numChapters: number = chapters.length;
        const numVerses: number = chapters[actualChapter - 1].childNodes.length;

        const chapterDiff: number = Math.abs(actualChapter - guessChapter);
        const verseDiff: number = Math.abs(actualVerse - guessVerse);

        const chapterStep: number = 100 / numChapters;
        const verseStep: number = 100 / numVerses;

        const chapterBase: number = Math.floor(Math.max(0, 100 - (chapterDiff * chapterStep)));
        const verseBase: number = Math.max(0, 100 - (verseDiff * verseStep));
        const verseBaseAdj: number = Math.floor((chapterBase / 100) * verseBase); // Verse score is worth less if the chapter is way off

        const hit: boolean = this.bookText.text === this.servedVerse.book;
        const perfect: boolean = hit && guessChapter === actualChapter && guessVerse === actualVerse;

        const perfectBonus: number = perfect ? 100 : 0;

        const graceBonus: number = Math.ceil(PLAYER.getGrace() / 10);
        const gracePct: number = graceBonus / 100;

        const subTotal: number = Math.floor(perfectBonus + chapterBase + verseBaseAdj);
        const books: number = this.playerBooks.length;
        const booksPct: number = books * 0.1;
        const finalScore: number = Math.floor(subTotal + (subTotal * (booksPct + gracePct)));

        GFF.log(`Guess evaluation:
        Actual: ${this.servedVerse.book} ${actualChapter}:${actualVerse}
        Guess: ${this.bookText.text} ${guessChapter}:${guessVerse}
        Chapter base: ${chapterBase}
        Verse base: ${verseBase}
        Verse base (adj): ${verseBaseAdj}
        Perfect bonus: ${perfectBonus}
        Subtotal: ${subTotal}
        Books Pct: ${books} = ${booksPct}
        Grace Pct: ${gracePct}
        Total Pcts: ${booksPct + gracePct}
        Final score: ${finalScore}`);

        this.guessCaption.text = 'Guessed Reference:';
        this.guessReference.text = `${this.bookText.text} ${guessChapter}:${guessVerse}`;
        this.actualCaption.text = 'Actual Reference:';
        this.actualReference.text = `${this.servedVerse.book} ${actualChapter}:${actualVerse}`;
        this.perfectBonusCalc.text = `+ ${perfectBonus}`;

        this.layoutPlayerResult(perfect);

        if (hit) {
            STATS.changeInt('Hits', 1);
            STATS.recordBookResult(this.servedVerse.book, true);
            if (perfect) {
                // Perfect!
                this.guessCaption.setText('Reference Correct!');
                this.guessCaption.setColor(ACTUAL_CAPTION_COLOR);
                this.guessReference.setColor(ACTUAL_REF_COLOR);
                this.getSound().playSound('success');
                STATS.changeInt('CriticalHits', 1);
            } else {
                // At least the book was right...
                this.guessCaption.setColor(HIT_CAPTION_COLOR);
                this.guessReference.setColor(HIT_REF_COLOR);
            }
            this.chapterScoreCalc.text = `+ ${chapterBase}`;
            this.verseScoreCalc.text = `+ ${verseBaseAdj}`;
            this.baseScoreCalc.text = `${subTotal}`;
            this.booksMultCaption.text = `${books} ${books === 1 ? 'Book' : 'Books'} x 10%`;
            this.booksMultCalc.text = `+ ${books * 10}%`;
            this.graceBonusCalc.text = `+ ${graceBonus}%`;
            this.finalScoreCalc.text = `${finalScore}`;

            // High score?
            STATS.checkNewHighScore(finalScore);

            return finalScore;
        } else {
            // We totally missed the book!
            STATS.changeInt('Misses', 1);
            STATS.recordBookResult(this.servedVerse.book, false);
            this.guessCaption.setColor(MISS_CAPTION_COLOR);
            this.guessReference.setColor(MISS_REF_COLOR);
            this.chapterScoreCalc.text = '+ 0';
            this.verseScoreCalc.text = '+ 0';
            this.baseScoreCalc.text = '0';
            this.booksMultCaption.text = `${books} ${books === 1 ? 'Book' : 'Books'} x 10%`;
            this.booksMultCalc.text = `+ ${books * 10}%`;
            this.graceBonusCalc.text = `+ ${graceBonus}%`;
            this.finalScoreCalc.text = '0';
            return 0;
        }
    }

    private showGuessResult(nextStep: Function) {
        const perfect: boolean = this.perfectBonusCalc.text === '+ 100';

        this.resultImage.setScale(0);
        this.resultImage.setVisible(true).setAlpha(1.0);
        this.tweens.add({
            targets: this.resultImage,
            duration: 200 / this.animSpeed,
            scale: 1.0,
            onComplete: () => {
                this.playerReportTexts.forEach(t => t.setVisible(true).setAlpha(1.0));
                this.perfectBonusCaption.setVisible(perfect).setAlpha(1.0);
                this.perfectBonusCalc.setVisible(perfect).setAlpha(1.0);
                nextStep();
            }
        });
    }

    private evaluateEnemyAttack(attack: GEnemyAttack): EnemyTurnResult {
        // Get the attack's raw damage:
        const damage: number = attack.damageFunc();
        // An attack with no innate damage (e.g. a pure status effect) can't be blocked by armor or shield
        const cannotBlock: boolean = damage === 0;

        // Create the layout for the enemy's attack result, which will show after the attack animation:
        this.layoutEnemyResult(attack.statusEffect !== null, this.currentStatusEffect !== null);

        // Determine whether the player's armor/shield will help mitigate the damage:
        let armorAbsorb: boolean = false;
        let armorPart: string|null = null;
        const struckPart: number = RANDOM.randInt(1, 4);

        // Sword (armor_1) isn't really an armor piece - that's your weapon, silly!

        const shieldDeflect = (!cannotBlock)
            && ARMORS.hasArmor(3) // Shield (armor_3)
            && RANDOM.randInt(1, 4) === struckPart;

        switch (struckPart) {
            case 1: // Helmet (armor_2)
                if (ARMORS.hasArmor(2)) {
                    armorAbsorb = true;
                    armorPart = 'Helmet';
                }
                break;
            case 2: // Breastplate (armor_4)
                if (ARMORS.hasArmor(4)) {
                    armorAbsorb = true;
                    armorPart = 'Breastplate';
                }
                break;
            case 3: // Girdle (armor_6)
                if (ARMORS.hasArmor(6)) {
                    armorAbsorb = true;
                    armorPart = 'Girdle';
                }
                break;
            case 4: // Shoes (armor_5)
                if (ARMORS.hasArmor(5)) {
                    armorAbsorb = true;
                    armorPart = 'Shoes';
                }
        }

        if (cannotBlock) {
            armorAbsorb = false;
            armorPart = null;
        }
        GFF.log(`Enemy attack rolled ${struckPart} (${armorPart}); armorAbsorb: ${armorAbsorb}, shieldDeflect: ${shieldDeflect})`);

        const armorAmt = Math.ceil(armorAbsorb ? .5 * damage : 0);
        const shieldAmt = Math.ceil(shieldDeflect ? .5 * damage : 0);
        const baseDamage = Math.max(damage - armorAmt - shieldAmt, 0);
        const statEffDamage = this.currentStatusEffect && this.currentStatusEffect.damageFunc ?
            this.currentStatusEffect.damageFunc() : 0;
        const gracePctInt = Math.ceil(PLAYER.getGrace() / 10);
        const graceBaseReduction = Math.round((gracePctInt / 100) * baseDamage);
        const graceEffectReduction = Math.round((gracePctInt / 100) * statEffDamage);
        const finalBaseDamage = Math.max(baseDamage - graceBaseReduction, 0);
        const finalEffectDamage = Math.max(statEffDamage - graceEffectReduction, 0);
        const finalDamage = finalBaseDamage + finalEffectDamage;

        // Fill in the values for the report
        this.attackTypeCalc.text = attack.attackName;
        this.attackEffectCaption.text = attack.statusEffect ? `Effect: ${attack.statusEffect.name}` : '';
        this.attackPowerCalc.text = `+ ${damage}`;
        this.armorCalc.text = armorAbsorb ? '- 50%' : '-';
        this.shieldCalc.text = shieldDeflect ? '- 50%' : '-';
        this.baseDamageCalc.text = `${baseDamage}`;
        this.statusEffectCaption.text = this.currentStatusEffect && statEffDamage > 0 ? `Status: ${this.currentStatusEffect.name}` : '';
        this.statusEffectCalc.text = this.currentStatusEffect && statEffDamage > 0 ? `+ ${statEffDamage}` : '';
        this.graceProtectionCalc.text = gracePctInt > 0 ? `- ${gracePctInt}%` : '0%';
        this.finalDamageCalc.text = `${finalDamage}`;

        return {
            damage: finalBaseDamage,
            armorPart: armorPart,
            armorAbsorb: armorAbsorb,
            shieldDeflect: shieldDeflect,
            statusEffectDamage: finalEffectDamage,
        }
    }

    private showEnemyAttackResult(nextStep: Function) {
        const newEffect: boolean = this.attackEffectCaption.text !== '';
        const existingEffect: boolean = this.statusEffectCalc.text !== '';

        this.enemyResultImage.setScale(0);
        this.enemyResultImage.setVisible(true).setAlpha(1.0);
        this.tweens.add({
            targets: this.enemyResultImage,
            duration: 200 / this.animSpeed,
            scale: 1.0,
            onComplete: () => {
                this.enemyReportTexts.forEach(t => t.setVisible(true).setAlpha(1.0));
                this.attackEffectCaption.setVisible(newEffect).setAlpha(1.0);
                this.statusEffectCaption.setVisible(existingEffect).setAlpha(1.0);
                this.statusEffectCalc.setVisible(existingEffect).setAlpha(1.0);
                nextStep();
            }
        });
    }

    private damagePlayerFaith(amount: number, soundKey: string, nextStep: Function) {
        if (amount <= 0) {
            nextStep();
            return;
        }
        this.sound.play(soundKey);

        // If the player is damaged by Fear, don't emit spirit balls - this is an "attack" from within
        if (soundKey !== 'scream') {
            this.playerParticleEmitter.explode(amount);
        }

        const faithWrapper: {value: number} = {value: PLAYER.getFaith()};
        const newFaith: number = Math.max(0, PLAYER.getFaith() - amount);
        this.tweens.add({
            targets: [faithWrapper],
            duration: 300 / this.animSpeed,
            value: newFaith,
            onUpdate: () => {
                PLAYER.setFaith(Math.floor(faithWrapper.value));
            },
            onComplete: () => {
                if (PLAYER.getFaith() <= 0) {
                    this.doDefeatSequence();
                } else {
                    nextStep();
                }
            }
        });
    }

    private damageEnemyResistance(amount: number) {
        if (amount <= 0) {
            this.tweens.add({
                targets: this.swordImage,
                alpha: 0,
                duration: 1000 / this.animSpeed,
                onComplete: () => {
                    this.setCurrentStage(BattleStage.END_PLAYER_TURN);
                }
            });
            return;
        }
        this.enemyParticleEmitter.explode(amount);
        const resWrapper: {value: number} = {value: ENEMY.getResistance()};
        const newRes: number = Math.max(0, ENEMY.getResistance() - amount);
        this.tweens.add({
            targets: [resWrapper],
            duration: 300 / this.animSpeed,
            value: newRes,
            onUpdate: () => {
                ENEMY.setResistance(Math.floor(resWrapper.value));
            },
            onComplete: () => {
                this.tweens.add({
                    targets: this.swordImage,
                    alpha: 0,
                    duration: 1000 / this.animSpeed,
                    onComplete: () => {
                        if (ENEMY.getResistance() <= 0) {
                            this.doVictorySequence();
                        } else {
                            this.setCurrentStage(BattleStage.END_PLAYER_TURN);
                        }
                    }
                });
            }
        });
    }

    private createNewStatusEffect(statusEffect: StatusEffect, nextStep: Function) {
        this.currentStatusEffect = statusEffect;
        this.statusEffectDuration = statusEffect.turns;
        this.statusEffectIcon.setTexture(statusEffect.iconKey);
        this.statusEffectIcon.setScale(0.1).setAlpha(1.0).setVisible(true);
        this.tweens.add({
            targets: this.statusEffectIcon,
            scale: 1.0,
            duration: 200 / this.animSpeed,
            onComplete: () => {
                this.tweens.add({
                    targets: this.statusEffectIcon,
                    scale: .5,
                    duration: 200 / this.animSpeed,
                    onComplete: () => {
                        const text = `${statusEffect === ENSNARE_EFFECT ? this.statusEffectDuration - 1 : this.statusEffectDuration}`;
                        this.statusEffectDurationText.setText(text).setVisible(true);
                        nextStep();
                    }
                });
            }
        });
    }

    /**
     * If called without a nextStep, we're just calling this to remove any animations
     * or timers associated with the status effect, most likely as the battle is ending.
     */
    private removeStatusEffect(nextStep?: Function) {
        switch (this.currentStatusEffect) {
            case POISON_EFFECT:
                this.stopPoisonPulse();
                break;
            case VEIL_EFFECT:
                this.stopSmoke(nextStep === undefined);
                break;
            case FEAR_EFFECT:
                // We only need to stop fear if the battle isn't ending, because fear is ended
                // differently for victory vs. defeat, so handled in that code instread.
                if (nextStep !== undefined) {
                    this.stopFear();
                }
                break;
            default:
        }
        this.currentStatusEffect = null;

        // If there's no next step
        if (nextStep === undefined) {
            return;
        }

        this.tweens.add({
            targets: this.statusEffectIcon,
            alpha: 0.0,
            duration: 200 / this.animSpeed,
            onComplete: () => {
                this.statusEffectDurationText.setVisible(false);
                nextStep();
            }
        });
    }

    private startPoisonPulse() {
        const tintColor = new GColor(0x22ff22);
        const startColor = Phaser.Display.Color.ValueToColor(0xffffff);
        const endColor = tintColor.phaser();
        const tintState = { t: 0 };
        this.poisonPulseTween = this.tweens.add({
            targets: tintState,
            t: 100,
            duration: 500 / this.animSpeed,
            yoyo: true,
            repeat: -1,
            onUpdate: () => {
                const c = Phaser.Display.Color.Interpolate.ColorWithColor(
                    startColor,
                    endColor,
                    100,
                    tintState.t
                );
                const tint = Phaser.Display.Color.GetColor(c.r, c.g, c.b);
                this.playerBaseImage.setTint(tint);
                this.playerArmImage.setTint(tint);
            }
        });
    }
    private stopPoisonPulse() {
        if (this.poisonPulseTween) {
            this.poisonPulseTween.stop();
            this.poisonPulseTween = null;
            this.playerBaseImage.clearTint();
            this.playerArmImage.clearTint();
        }
    }

    private stopSmoke(immediately: boolean = false) {
        if (immediately) {
            this.smokePuffSprites.forEach(s => s.setVisible(false).setAlpha(1.0).anims.stop());
            return;
        }
        this.tweens.add({
            targets: this.smokePuffSprites,
            duration: 500 / this.animSpeed,
            alpha: 0,
            onComplete: () => {
                this.smokePuffSprites.forEach(s => s.setVisible(false).setAlpha(1.0).anims.stop());
            }
        });
    }

    private doSnareStruggle() {
        this.eventText.text = 'Adam struggles to get free...';
        this.tweens.add({
            targets: [
                this.eventText
            ],
            duration: 500 / this.animSpeed,
            alpha: 1.0,
            onComplete: () => {
                this.time.delayedCall(500 / this.animSpeed, () => {
                    this.getSound().playSound('snare_struggle');
                    ANIM.wiggle(this, [this.playerAvatar, this.snareFullSprite], () => {
                        this.time.delayedCall(500 / this.animSpeed, () => {

                            // Figure out whether he actually breaks free
                            const chances = [1.0, .66, .33];
                            const chance = chances[this.statusEffectDuration - 1];
                            const roll = RANDOM.randPct();
                            const success = roll <= chance;
                            if (success) {
                                this.doBreakSnare(() => {
                                    this.setCurrentStage(BattleStage.ENEMY_ATTACK);
                                });
                            } else {
                                this.setCurrentStage(BattleStage.ENEMY_ATTACK);
                            }
                        });
                    });
                });
            }
        });
    }

    private doBreakSnare(nextStep: Function) {
        this.getSound().playSound('snare_break');
        this.snareFullSprite.play('snare_burst');
        this.snareFullSprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            this.snareFullSprite.setVisible(false);
            this.removeStatusEffect(() => {
                nextStep();
            });
        });
    }

    private startFear() {
        this.playerBaseImage.setTexture('adam_scared');
        const spawnDroplet = () => {
            const startX = this.playerAvatar.x + 60;
            const startY = this.playerAvatar.y + 26;
            const drop = this.add.image(startX, startY, 'sweat_drop').setAlpha(0).setScale(0.5).setOrigin(0.5, 0.5);
            // Fade in quickly
            this.tweens.add({
                targets: drop,
                alpha: 1,
                scale: 1.0,
                duration: 100,
                ease: 'Linear',
                onComplete: () => {
                    // Slide down the face
                    this.tweens.add({
                        targets: drop,
                        y: startY + 64,
                        alpha: 0,
                        duration: 600 / this.animSpeed,
                        ease: 'Linear',
                        onComplete: () => {
                            drop.destroy();
                        }
                    });
                }
            });
        };
        // spawn immediately
        spawnDroplet();
        // repeat every 2 seconds
        this.sweatTimer = this.time.addEvent({
            delay: 2000 / this.animSpeed,
            callback: spawnDroplet,
            callbackScope: this,
            loop: true
        });

        // Begin trembling
        this.trembleTween = this.tweens.add({
            targets: this.playerAvatar,
            x: APPROACH_GAP + 4,
            duration: 80 / this.animSpeed,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }

    private stopFear(revertToNormal: boolean = true) {
        // Stop looking so afraid
        if (revertToNormal) {
            this.playerBaseImage.setTexture('adam_base');
        }
        // Stop sweating
        if (this.sweatTimer) {
            this.sweatTimer.remove();
            this.sweatTimer = null;
        }
        // Stop trembling
        if (this.trembleTween) {
            this.trembleTween.stop();
            this.playerAvatar.x = APPROACH_GAP;
            this.trembleTween = null;
        }
    }

    private doEnemyAttack(attack: GEnemyAttack) {
        // Determine if this is a special attack; minions can use only one special attack per battle
        if (attack.attackName !== 'Basic' && ENEMY.getCurrentSpirit().type === 'minion') {
            this.specialAttackUsed = true;
        }

        // Evaluate the attack to get the amount of damage it will do:
        const result: EnemyTurnResult = this.evaluateEnemyAttack(attack);

        // The attack's sound play's immediately, as the animation begins:
        this.getSound().playSound(attack.soundKey);

        // There are four possibilities for sound(s) at the end:
        // 1) unprotected = 'splooge'
        // 2) armor only  = 'armor_hit'
        // 3) shield only = 'shield_hit'
        // 4) both armor and shield = 'shield_hit', followed immediately by 'armor_hit'
        let contactSound: string = result.armorAbsorb ? 'armor_hit' : 'splooge';
        let deflectSound: string|null = result.shieldDeflect ? 'shield_hit' : null;

        if (result.shieldDeflect) {
            // Raise Adam's shield when the attack is underway
            this.time.delayedCall(300 / this.animSpeed, () => {
                // Rotate the shield -30 degrees
                this.playerShieldImage.setRotation(Phaser.Math.DegToRad(-30));
                // Shift it over a little to the right
                this.playerShieldImage.setX(this.playerShieldImage.x + 15);
            });
        }

        attack.animFunc(() => {
            // If armor or shield is involved, show the armor_spark animation
            if (result.armorAbsorb || result.shieldDeflect) {
                // If shield deflects, play that sound right away
                if (deflectSound) {
                    this.getSound().playSound(deflectSound);
                }
                this.armorSparkImage.setVisible(true).setAlpha(1.0).setScale(0.2);
                this.tweens.add({
                    targets: this.armorSparkImage,
                    alpha: 0.0,
                    scale: 2.0,
                    duration: 250 / this.animSpeed,
                    onUpdate: () => {
                        // Randomly rotate the spark:
                        this.armorSparkImage.setRotation(Phaser.Math.DegToRad(RANDOM.randInt(0, 359)));
                    },
                    onComplete: () => {
                        this.armorSparkImage.setVisible(false);
                        // If the shield deflected, do the damage after a short delay so the sounds don't overlap too much
                        if (deflectSound) {
                            this.time.delayedCall(100 / this.animSpeed, () => {
                                this.damagePlayerFaith(result.damage, contactSound, () => {
                                    // Reset the shield's position (total block duration > 600ms, easily seen):
                                    this.time.delayedCall(300 / this.animSpeed, () => {
                                        this.playerShieldImage.setRotation(Phaser.Math.DegToRad(0));
                                        this.playerShieldImage.setX(this.playerShieldImage.x - 15);
                                    });
                                    // Finally, end the enemy's attack by showing the result and allowing player to proceed:
                                    this.endEnemyAttack(result);
                                });
                            });
                        } else {
                            this.damagePlayerFaith(result.damage, contactSound, () => {
                                // Finally, end the enemy's attack by showing the result and allowing player to proceed:
                                this.endEnemyAttack(result);
                            });
                        }
                    }
                });
                return;
            }
            this.damagePlayerFaith(result.damage, contactSound, () => {
                // Finally, end the enemy's attack by showing the result and allowing player to proceed:
                this.endEnemyAttack(result);
            });
        });
    }

    private endEnemyAttack(result: EnemyTurnResult) {
        // The enemy's attack just ended.
        // The first thing to do is show the result; we'll delay it a little.
        this.time.delayedCall(700 / this.animSpeed, () => {
            this.showEnemyAttackResult(() => {
                // Once the result is shown, do any per-round status effect events:
                if (this.currentStatusEffect && this.currentStatusEffect.roundFunc) {
                    this.currentStatusEffect.roundFunc();
                }
                if (this.currentStatusEffect && result.statusEffectDamage > 0) {
                    const statusEffect = this.currentStatusEffect;
                    this.time.delayedCall(400 / this.animSpeed, () => {
                        this.damagePlayerFaith(result.statusEffectDamage, statusEffect.roundSound ?? 'splooge', () => {
                            this.setCurrentStage(BattleStage.END_ENEMY_TURN);
                        });
                    });
                } else {
                    this.setCurrentStage(BattleStage.END_ENEMY_TURN);
                }
            });
        });
    }

    private doVictorySequence() {
        if (this.currentStatusEffect === FEAR_EFFECT) {
            this.stopFear(true);
        }
        this.getSound().stopMusic();
        this.getSound().playSound('victory');
        // Create tween to retreat enemy:
        this.tweens.add({
            targets: this.enemyAvatar,
            x: GFF.GAME_W,
            duration: APPROACH_TIME / this.animSpeed,
            onComplete: () => {
                this.setCurrentStage(BattleStage.VICTORY);
            }
        });
    }

    private doDefeatSequence() {
        this.getSound().fadeOutMusic(500 / this.animSpeed, () => {
            this.getSound().playSound('defeat');
            // Create tween to retreat player

            // If the player is afraid, stop the fear before retreating (otherwise, the tremble tween will bring him back):
            if (this.currentStatusEffect === FEAR_EFFECT) {
                this.stopFear(false);
            }

            // If the player is ensnared, play the snare break animation before retreating:
            if (this.currentStatusEffect === ENSNARE_EFFECT) {
                this.doBreakSnare(() => {
                    this.tweens.add({
                        targets: this.playerAvatar,
                        x: -this.playerBaseImage.width,
                        duration: APPROACH_TIME / this.animSpeed,
                        onComplete: () => {
                            this.setCurrentStage(BattleStage.DEFEAT);
                        }
                    });
                });
            } else {
                this.tweens.add({
                    targets: this.playerAvatar,
                    x: -this.playerBaseImage.width,
                    duration: APPROACH_TIME / this.animSpeed,
                    onComplete: () => {
                        this.setCurrentStage(BattleStage.DEFEAT);
                    }
                });
            }
        });
    }

    private endBattle(victory: boolean) {
        this.removeStatusEffect();
        this.destroyWordPools();
        this.reportOrphans();
        this.setInputMode(INPUT_DISABLED);
        this.fadeOut(1200 / this.animSpeed, undefined, () => {
            GFF.AdventureContent.resumeAfterBattlePreFadeIn(victory);
            GFF.ADVENTURE_MODE.switchTo(GFF.BATTLE_MODE);
            GFF.AdventureContent.fadeIn(500, undefined, () => {
                GFF.AdventureContent.resumeAfterBattlePostFadeIn(victory);
            });
        });
    }

    private reportOrphans() {
        const allTweens = this.tweens.tweens;

        console.log(`Total tweens: ${allTweens.length}`);

        allTweens.forEach((t, i) => {
            console.log(`[Tween ${i}]`, {
                playing: t.isPlaying(),
                paused: t.isPaused(),
                loop: t.loop,
                targets: t.targets,
            });
        });

        // const events = this.time.removeAllEvents();
    }

    private getRandomScriptureContext() {
        // Get a random verse from the player's books, based on the game type:
        if (REGISTRY.getString('gameType') === 'focused') {
            this.servedVerse = BIBLE.getFocusVerseFromBooks(this.playerBooks);
        } else {
            this.servedVerse = BIBLE.getRandomVerseFromBooks(this.playerBooks);
        }

        // Use the longest verse to make sure it fits:
        // this.servedVerse = BIBLE.getScriptureVerse('Esther', 8, 9) as GScripture;

        // Get the previous and next verses (if they exist)
        this.prevVerse = BIBLE.getPreviousVerse(this.servedVerse.book, this.servedVerse.chapter, this.servedVerse.verse);
        this.nextVerse = BIBLE.getNextVerse(this.servedVerse.book, this.servedVerse.chapter, this.servedVerse.verse);

        // Clear old verse line arrays:
        this.servedVerseLines.length = 0;
        this.prevVerseLines.length = 0;
        this.nextVerseLines.length = 0;

        // Clear old text and smoke objects from the containers, but don't destroy them:
        this.servedVerseContainer.removeAll(false);
        this.prevVerseContainer.removeAll(false);
        this.nextVerseContainer.removeAll(false);

        // Reset the objects in the pools so they're ready to be reused:
        this.resetWordPools();

        // Create the texts for the current, previous, and next verses (if they exist);
        // Only the served verse is visible at this point (though its alpha begins at 0 so it can be faded in.)
        this.createVerseText(this.servedVerse, this.servedVerseLines, this.servedVerseContainer);
        this.servedVerseContainer.setVisible(true);
        if (this.prevVerse) {
            this.createVerseText(this.prevVerse, this.prevVerseLines, this.prevVerseContainer);
            this.prevVerseContainer.setVisible(false);
        }
        if (this.nextVerse) {
            this.createVerseText(this.nextVerse, this.nextVerseLines, this.nextVerseContainer);
            this.nextVerseContainer.setVisible(false);
        }

        // Log the served verse:
        GFF.log(`Served verse: ${this.servedVerse.book} ${this.servedVerse.chapter}:${this.servedVerse.verse}`);
    }

    private createVerseText(ref: GScripture, lines: TextLine[], container: Phaser.GameObjects.Container): void {
        const text: string = BIBLE.getVerseText(ref.book, ref.chapter, ref.verse) as string;
        const tokens: string[] = text.split(' ');
        const smokePct = this.currentStatusEffect === VEIL_EFFECT ? this.statusEffectDuration * .2 : 0;
        const numSmokes: number = Math.ceil(tokens.length * smokePct);
        // Randomly select words to be smokes:
        const smokeIndices: Set<number> = new Set();
        while (smokeIndices.size < numSmokes) {
            smokeIndices.add(RANDOM.randInt(0, tokens.length - 1));
        }

        // Step through each token and create either a text or a smoke, adding it to the current line:
        let currentLine: TextLine = [];
        tokens.forEach((t, i) => {
            const obj = smokeIndices.has(i) ? this.fetchSmokeObj() : this.fetchWordObj(t);
            const lineWidth = this.getLineWidth(currentLine);
            if (lineWidth + obj.width > WORD_WRAP_WIDTH) {
                // This word would put us over the max width, so start a new line:
                lines.push(currentLine);
                currentLine = [];
            }
            currentLine.push(obj);
        });
        if (currentLine.length > 0) {
            lines.push(currentLine);
        }

        // Set alpha to 0 so it can fade in when needed:
        container.setAlpha(0);

        // Arrange the lines in the container
        // Text is always centered vertically, and centered horizontally if only one line
        const totalHeight: number = lines.length * lines[0][0].height;
        const totalWidth: number = this.getLongestLinePixels(lines);
        const startX: number = lines.length > 1 ? 0 : Math.round((this.scriptureFrame.width / 2) - (totalWidth / 2));
        let lineY: number = Math.round((this.scriptureFrame.height / 2) - (totalHeight / 2));
        let wordX: number = startX;
        lines.forEach((line) => {
            line.forEach(word => {
                container.add(word);
                word.setPosition(wordX, lineY).setAlpha(1).setVisible(true);
                if (word instanceof Phaser.GameObjects.Sprite) {
                    word.play('word_smoke');
                }
                wordX += word.width + TEXT_SPACE;
            });
            lineY += line[0].height;
            wordX = startX;
        });
    }

    private getLineWidth(line: TextLine): number {
        const spaceWidth = (line.length - 1) * TEXT_SPACE;
        return line.reduce((sum, word) => sum + word.width, 0) + spaceWidth;
    }

    private getLongestLinePixels(lines: TextLine[]): number {
        let longest: number = 0;
        lines.forEach(line => {
            const lineWidth = this.getLineWidth(line);
            if (lineWidth > longest) {
                longest = lineWidth;
            }
        });
        return longest;
    }

    private createWordPools() {
        this.wordSmokeSpritePool = [];
        for (let i = 0; i < MAX_WORD_SMOKES; i++) {
            this.wordSmokeSpritePool.push(this.createSmokeObj());
        }
        this.wordTextPool = [];
        for (let i = 0; i < MAX_WORD_TEXTS; i++) {
            this.wordTextPool.push(this.createWordObj());
        }
    }

    private destroyWordPools() {
        this.wordSmokeSpritePool.forEach(sprite => sprite.destroy());
        this.wordSmokeSpritePool = [];
        this.wordTextPool.forEach(text => text.destroy());
        this.wordTextPool = [];
    }

    private createWordObj(): Phaser.GameObjects.Text {
        const wordObj = this.add.text(0, 0, '', {
            color: SCRIPTURE_COLOR,
            fontFamily: 'averia_serif',
            fontSize: '16px',
            lineSpacing: -3
        }).setOrigin(0, 0).setVisible(false);
        return wordObj;
    }

    private createSmokeObj(): Phaser.GameObjects.Sprite {
        const smokeObj = this.add.sprite(0, 0, 'word_smoke').setOrigin(0, 0).setVisible(false);
        return smokeObj;
    }

    public update(_time: number, delta: number): void {
        this.updateStats();
        this.updateFrameRate(delta);
    }

    private resetWordPools() {
        this.wordSmokeSpritePool.forEach(sprite => sprite.setVisible(false).setAlpha(1.0).anims.stop());
        this.wordTextPool.forEach(text => text.setVisible(false).setAlpha(1.0).setText(''));
    }

    private fetchWordObj(text: string): Phaser.GameObjects.Text {
        return this.wordTextPool.find(textObj => !textObj.visible)!.setVisible(true).setText(text);
    }

    private fetchSmokeObj(): Phaser.GameObjects.Sprite {
        return this.wordSmokeSpritePool.find(sprite => !sprite.visible)!.setVisible(true).play('word_smoke');
    }

    private updateFrameRate(delta: number) {
        if (!REGISTRY.getBoolean('showFrameRate')) {
            this.frameRateText.setVisible(false);
            return;
        }
        this.frameRateText.setVisible(true);
        const fps = this.game.loop.actualFps;

        // track worst frame in this window
        this.maxDelta = Math.max(this.maxDelta, delta);
        this.sampleTimer += delta;

        // update once per second
        if (this.sampleTimer >= 1000) {
            const worst = this.maxDelta;

            // normalize spike severity (50ms = very bad)
            const pct = Phaser.Math.Clamp(worst / 50, 0, 1);

            const color = COLOR.getColorByPct(
                COLOR.WHITE,
                COLOR.RED,
                pct
            );

            this.frameRateText.setColor(color.str());

            this.frameRateText.setText(
                `FPS: ${Math.floor(fps)}\n` +
                `Frame: ${delta.toFixed(1)} ms\n` +
                `Worst: ${worst.toFixed(1)} ms`
            );

            // reset window
            this.maxDelta = 0;
            this.sampleTimer = 0;
        }
    }

    private updateStats() {
        // Update player:
        const playerRatio: number = PLAYER.getFaith() / PLAYER.getMaxFaith();
        const adjPlayerMeterWidth: number = BAR_WIDTH * playerRatio;
        this.playerBar.width = adjPlayerMeterWidth;
        this.playerMeterText.text = `Faith: ${PLAYER.getFaith()}/${PLAYER.getMaxFaith()}`;
        this.playerMeterTextShadow.text = this.playerMeterText.text;

        // Update enemy:
        const enemyRatio: number = ENEMY.getResistance() / ENEMY.getMaxResistance();
        const adjEnemyMeterWidth: number = BAR_WIDTH * enemyRatio;
        this.enemyBar.width = adjEnemyMeterWidth;
        this.enemyMeterText.text = `Resistance: ${ENEMY.getResistance()}/${ENEMY.getMaxResistance()}`;
        this.enemyMeterTextShadow.text = this.enemyMeterText.text;
    }
}