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
import { GEnemyAttack, GScripture } from "../types";
import { GContentScene } from "./GContentScene";
import { STATS } from "../stats";
import { REGISTRY } from "../registry";
import { ARMORS } from "../armors";

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
const BASE_SCORE_COLOR: string = '#555555';
const FINAL_SCORE_COLOR: string = '#ffffff';
const ATTACK_CAPTION_COLOR: string = '#a90000';
const ATTACK_CALC_COLOR: string = '#ff3737';

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

export class GBattleContent extends GContentScene {

    private enemyPortraitImage: Phaser.GameObjects.Image;
    private playerMeterImage: Phaser.GameObjects.Image;
    private enemyMeterImage: Phaser.GameObjects.Image;
    private vsImage: Phaser.GameObjects.Image;
    private playerBaseImage: Phaser.GameObjects.Image;
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

    private scriptureText: Phaser.GameObjects.Text;

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

    private playerParticleEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
    private enemyParticleEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

    private enemyAttacks: {element: GEnemyAttack, weight: number}[];
    private enemyAttackSlashSprite: Phaser.GameObjects.Sprite;

    private playerBooks: string[];
    private bookWheelRepeats: number = 0;

    private animSpeed: number = 1;

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
        this.scriptureText = this.add.text(GFF.GAME_W / 2, SCROLL_Y + 105, '', {
            color: SCRIPTURE_COLOR,
            fontFamily: 'averia_serif',
            fontSize: '16px',
            lineSpacing: -2
        }).setOrigin(.5, .5).setWordWrapWidth(WORD_WRAP_WIDTH);

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
            duration: 300,
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

        // Particle emitters (for damage):
        this.playerParticleEmitter = this.add.particles(PLAYER_PARTICLE_X, GUESS_SCRIPTURE_Y, 'light_particle', {
            lifespan: 2000,
            speed: { min: 500, max: 1000 },
            alpha: { start: 1.0, end: 0.0},
            gravityY: 2000,
            blendMode: Phaser.BlendModes.NORMAL,
            emitting: false
        });
        this.enemyParticleEmitter = this.add.particles(ENEMY_PARTICLE_X, GUESS_SCRIPTURE_Y, 'dark_particle', {
            lifespan: 2000,
            speed: { min: 500, max: 1000 },
            gravityY: 2000,
            blendMode: Phaser.BlendModes.NORMAL,
            emitting: false
        });
        this.animSpeed = REGISTRY.getNumber('battleSpeed');
        this.currentStage = BattleStage.NONE;
        this.getSound().playMusic('onward');
        this.createAnimations();
        this.createPlayerResult();
        this.createEnemyResult();
        this.loadEnemyAttacks();
        this.showUI();
    }

    private initInputModes() {
        // INPUT_PROMPTENTER is active while waiting for the user to press Enter:
        INPUT_PROMPTENTER.setScene(this);
        INPUT_PROMPTENTER.onKeyDown((keyEvent: KeyboardEvent) => {
            switch(keyEvent.key) {
                case 'Enter':
                    if (this.currentStage === BattleStage.END_PLAYER_TURN) {
                        this.doEnemyAttack();
                    } else if (this.currentStage === BattleStage.VICTORY) {
                        this.endBattle(true);
                    }
                    break;
            }
        });

        // INPUT_REFBOOK is active when the user should guess the book:
        INPUT_REFBOOK.setScene(this);
        INPUT_REFBOOK.allowRepeats(['ArrowUp', 'ArrowDown']);
        INPUT_REFBOOK.onKeyDown((keyEvent: KeyboardEvent) => {
            this.bookWheelRepeats = keyEvent.repeat ? this.bookWheelRepeats + 1 : 0;
            switch(keyEvent.key) {
                case 'ArrowUp':
                    this.bookWheel.scrollUp(this.bookWheelRepeats);
                    break;
                case 'ArrowDown':
                    this.bookWheel.scrollDown(this.bookWheelRepeats);
                    break;
                case 'Enter':
                    this.completeCurrentPart();
                    break;
            }
        });

        // INPUT_REFCHAPTER is active when the user should guess the chapter:
        INPUT_REFCHAPTER.setScene(this);
        INPUT_REFCHAPTER.onKeyDown((keyEvent: KeyboardEvent) => {
            switch(keyEvent.key) {
                case 'Enter':
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

        // INPUT_REFVERSE is active when the user should guess the verse:
        INPUT_REFVERSE.setScene(this);
        INPUT_REFVERSE.onKeyDown((keyEvent: KeyboardEvent) => {
            switch(keyEvent.key) {
                case 'Enter':
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

    private createAnimations() {
        this.enemyAttackSlashSprite = this.add.sprite(PLAYER_PARTICLE_X, GUESS_SCRIPTURE_Y, 'slash').setOrigin(0, .5);
        this.enemyAttackSlashSprite.setVisible(false);
        if (!this.anims.exists('slash')) {
            this.anims.create({
                key: 'slash',
                frames: this.anims.generateFrameNumbers(
                    'slash',
                    { start: 0, end: 7 }
                ),
                frameRate: (24)
            });
        }
        this.anims.get('slash').frameRate = 24 * this.animSpeed;
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

        this.attackPowerCaption = this.add.text(0, 0, 'Attack Power', smallTextStyle).setOrigin(0, 0).setVisible(false);
        this.attackPowerCaption.setColor(REPORT_TEXT_COLOR);
        this.attackPowerCalc = this.add.text(0, 0, '+ 100', smallTextStyle).setOrigin(0, 0).setVisible(false);
        this.attackPowerCalc.setColor(REPORT_TEXT_COLOR);

        this.armorCaption = this.add.text(0, 0, 'Armor Absorb', smallTextStyle).setOrigin(0, 0).setVisible(false);
        this.armorCaption.setColor(REPORT_TEXT_COLOR);
        this.armorCalc = this.add.text(0, 0, '+ 50%', smallTextStyle).setOrigin(0, 0).setVisible(false);
        this.armorCalc.setColor(REPORT_TEXT_COLOR);

        this.shieldCaption = this.add.text(0, 0, 'Shield Deflect', smallTextStyle).setOrigin(0, 0).setVisible(false);
        this.shieldCaption.setColor(REPORT_TEXT_COLOR);
        this.shieldCalc = this.add.text(0, 0, '+ 50%', smallTextStyle).setOrigin(0, 0).setVisible(false);
        this.shieldCalc.setColor(REPORT_TEXT_COLOR);

        this.baseDamageCaption = this.add.text(0, 0, 'Base Damage:', bigTextStyle).setOrigin(0, 0).setVisible(false);
        this.baseDamageCaption.setColor(BASE_SCORE_COLOR);
        this.baseDamageCalc = this.add.text(0, 0, '100', bigTextStyle).setOrigin(0, 0).setVisible(false);
        this.baseDamageCalc.setColor(BASE_SCORE_COLOR);

        this.statusEffectCaption = this.add.text(0, 0, 'Status: Burning', smallTextStyle).setOrigin(0, 0).setVisible(false);
        this.statusEffectCaption.setColor(REPORT_TEXT_COLOR);
        this.statusEffectCalc = this.add.text(0, 0, '+ 10', smallTextStyle).setOrigin(0, 0).setVisible(false);
        this.statusEffectCalc.setColor(REPORT_TEXT_COLOR);

        this.graceProtectionCaption = this.add.text(0, 0, 'Grace Bonus', smallTextStyle).setOrigin(0, 0).setVisible(false);
        this.graceProtectionCaption.setColor(REPORT_TEXT_COLOR);
        this.graceProtectionCalc = this.add.text(0, 0, '- 100%', smallTextStyle).setOrigin(0, 0).setVisible(false);
        this.graceProtectionCalc.setColor(REPORT_TEXT_COLOR);

        this.finalDamageCaption = this.add.text(0, 0, 'Final Damage:', bigTextStyle).setOrigin(0, 0).setVisible(false);
        this.finalDamageCaption.setColor(FINAL_SCORE_COLOR);
        this.finalDamageCalc = this.add.text(0, 0, '100', bigTextStyle).setOrigin(0, 0).setVisible(false);
        this.finalDamageCalc.setColor(FINAL_SCORE_COLOR);
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
        let y: number = 486 + (newEffect ? 0 : 10) + (existingEffect ? 0 : 10);

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

    private loadEnemyAttacks() {
        const ENEMY_ATTACKS: GEnemyAttack[] = [
            {
                attackName: 'basic attack',
                enemies: ['minion', 'Mammon', 'Beelzebub', 'Belial', 'Legion', 'Apollyon', 'Lucifer', 'Dragon'],
                minLevel: 0,
                weight: 3,
                text: '_ attacks!',
                soundKey: 'kapow',
                actionFunction: () => {this.doEnemyAttackBasic();}
            }
        ];

        this.enemyAttacks = [];
        ENEMY_ATTACKS.forEach(a => {
            // Check if the enemy is eligible for this attack:
            if (a.enemies.includes(ENEMY.getCurrentSpirit().type) && a.minLevel <= ENEMY.getCurrentSpirit().level) {
                // Eligible: add to array of attacks:
                this.enemyAttacks.push({element: a, weight: a.weight});
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
            duration: 300,
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
        const shoesImage = this.add.image(24, 240, 'adam_shoes').setOrigin(0, 0).setVisible(ARMORS.hasArmor(4));
        const breastplateImage = this.add.image(21, 72, 'adam_breastplate').setOrigin(0, 0).setVisible(ARMORS.hasArmor(3));
        const girdleImage = this.add.image(37, 132, 'adam_girdle').setOrigin(0, 0).setVisible(ARMORS.hasArmor(5));
        const armImage = this.add.image(17, 116, 'adam_arm').setOrigin(0, 0);
        const shieldImage = this.add.image(0, 97, 'adam_shield').setOrigin(0, 0).setVisible(ARMORS.hasArmor(2));
        const helmetImage = this.add.image(35, 0, 'adam_helmet').setOrigin(0, 0).setVisible(ARMORS.hasArmor(1));

        this.playerAvatar = this.add.container(0, 0);
        this.playerAvatar.add([
            this.playerBaseImage,
            shoesImage,
            breastplateImage,
            girdleImage,
            armImage,
            shieldImage,
            helmetImage,
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
                this.eventText.text = 'Adam missed!';
                this.getSound().playSound('miss').once('complete', () => {
                    this.setCurrentStage(BattleStage.END_PLAYER_TURN);
                });
            }
        });
    }

    private doEnemyAttack() {
        this.setInputMode(INPUT_DISABLED);
        const chosenAttack: GEnemyAttack = RANDOM.randElementWeighted(this.enemyAttacks) as GEnemyAttack;

        this.tweens.add({
            targets: [
                this.scrollOpenImage,
                this.scriptureText,
                this.eventText,
                this.resultImage,
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
            ],
            duration: 500 / this.animSpeed,
            alpha: 0.0,
            onComplete: () => {
                this.eventText.alpha = 1.0;
                this.eventText.setVisible(true);
                this.eventText.text = chosenAttack.text.replace('_', ENEMY.getCurrentSpirit().name);
                this.time.delayedCall(700 / this.animSpeed, () => {
                    this.getSound().playSound(chosenAttack.soundKey);
                    chosenAttack.actionFunction();
                });
            }
        });
    }

    private beginRound() {
        this.time.delayedCall(500 / this.animSpeed, () => {
            this.serveScroll();
        });
    }

    private serveScroll() {
        // Let the scroll fly in!
        this.scrollClosedImage.setPosition(GFF.GAME_W / 2, GFF.GAME_H)
            .setVisible(true).setScale(0).setAngle(0);

        // Prepare side rolls and open scroll:
        this.leftRollImage.setPosition(LEFT_ROLL_START_X, SCROLL_Y).setVisible(false);
        this.rightRollImage.setPosition(RIGHT_ROLL_START_X, SCROLL_Y).setVisible(false);
        this.scrollOpenImage.setVisible(false);
        this.scrollOpenImage.alpha = 1.0;
        this.scriptureText.setVisible(false);
        this.scriptureText.alpha = 1.0;

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
                                this.showRandomVerse();
                            }
                        });
                    }
                }
            ]
        });
    }

    public showRandomVerse() {
        // Get a random verse from the player's books, based on the game type:
        if (REGISTRY.getString('gameType') === 'focused') {
            this.servedVerse = BIBLE.getFocusVerseFromBooks(this.playerBooks);
        } else {
            this.servedVerse = BIBLE.getRandomVerseFromBooks(this.playerBooks);
        }
        GFF.log(`Served verse: ${this.servedVerse.book} ${this.servedVerse.chapter}:${this.servedVerse.verse}`);
        this.scriptureText.setVisible(true);
        this.scriptureText.text = this.servedVerse.verseText;
        this.scriptureText.setAlpha(0.0);

        // Use this instead to show the longest verse in the Bible and make sure it fits:
        // const scripture: string|null = BIBLE.getVerseText('Esther', 8, 9) as string;
        // this.scriptureText.text = scripture;

        this.tweens.add({
            targets: this.scriptureText,
            duration: 500 / this.animSpeed,
            alpha: 1.0,
            onComplete: () => {
                this.allowGuess();
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
        switch (this.currentStage) {
            case BattleStage.BOOK:
                this.setInputMode(INPUT_DISABLED);
                this.setCurrentStage(BattleStage.CHAPTER);
                break;
            case BattleStage.CHAPTER:
                if (this.chapterEntry.isEnteredTextValid()) {
                    this.setInputMode(INPUT_DISABLED);
                    this.setCurrentStage(BattleStage.VERSE);
                } else {
                    this.getSound().playSound('error_buzz');
                }
                break;
            case BattleStage.VERSE:
                if (this.verseEntry.isEnteredTextValid()) {
                    this.setInputMode(INPUT_DISABLED);
                    this.setCurrentStage(BattleStage.PLAYER_ATTACK);
                } else {
                    this.getSound().playSound('error_buzz');
                }
                break;
            default:
        }
    }

    private setCurrentStage(guessStage: BattleStage) {

        const setup: Function = () => {
            // Set new stage:
            this.currentStage = guessStage;
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
                    this.showGuessResult();
                    break;
                case BattleStage.VICTORY:
                    this.showGuessResult();
                    this.setInputMode(INPUT_PROMPTENTER);
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
        this.setInputMode(INPUT_DISABLED);
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

    private showGuessResult() {
        this.setInputMode(INPUT_PROMPTENTER);

        const perfect: boolean = this.perfectBonusCalc.text === '+ 100';

        this.resultImage.setScale(0);
        this.resultImage.setVisible(true).setAlpha(1.0);
        this.tweens.add({
            targets: this.resultImage,
            duration: 300 / this.animSpeed,
            scale: 1.0,
            onComplete: () => {
                this.guessCaption.setVisible(true).setAlpha(1.0);
                this.guessReference.setVisible(true).setAlpha(1.0);
                this.actualCaption.setVisible(true).setAlpha(1.0);
                this.actualReference.setVisible(true).setAlpha(1.0);
                this.chapterScoreCaption.setVisible(true).setAlpha(1.0);
                this.chapterScoreCalc.setVisible(true).setAlpha(1.0);
                this.verseScoreCaption.setVisible(true).setAlpha(1.0);
                this.verseScoreCalc.setVisible(true).setAlpha(1.0);
                this.perfectBonusCaption.setVisible(perfect).setAlpha(1.0);
                this.perfectBonusCalc.setVisible(perfect).setAlpha(1.0);
                this.baseScoreCaption.setVisible(true).setAlpha(1.0);
                this.baseScoreCalc.setVisible(true).setAlpha(1.0);
                this.booksMultCaption.setVisible(true).setAlpha(1.0);
                this.booksMultCalc.setVisible(true).setAlpha(1.0);
                this.graceBonusCaption.setVisible(true).setAlpha(1.0);
                this.graceBonusCalc.setVisible(true).setAlpha(1.0);
                this.finalScoreCaption.setVisible(true).setAlpha(1.0);
                this.finalScoreCalc.setVisible(true).setAlpha(1.0);
            }
        });
    }

    private damagePlayerFaith(amount: number) {
        this.playerParticleEmitter.explode(amount);
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
                this.tweens.add({
                    targets: this.eventText,
                    duration: 200 / this.animSpeed,
                    alpha: 0.0,
                    delay: 1000 / this.animSpeed,
                    onComplete: () => {
                        if (PLAYER.getFaith() <= 0) {
                            this.doDefeatSequence();
                        } else {
                            this.beginRound();
                        }
                    }
                });
            }
        });
    }

    private damageEnemyResistance(amount: number) {
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

    private doEnemyAttackBasic() {
        // Get enemy's base damage:
        const baseDamage: number = ENEMY.getBaseDamage();

        // Do sprite animation:
        this.enemyAttackSlashSprite.setVisible(true);
        this.enemyAttackSlashSprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            // Hide sprite:
            this.enemyAttackSlashSprite.setVisible(false);
            // Play sound and decrease player's faith:
            this.getSound().playSound('splooge');
            this.damagePlayerFaith(baseDamage);
        });
        this.enemyAttackSlashSprite.play('slash');
    }

    private doVictorySequence() {
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
            // Create tween to retreat player:
            this.tweens.add({
                targets: this.playerAvatar,
                x: -this.playerBaseImage.width,
                duration: APPROACH_TIME / this.animSpeed,
                onComplete: () => {
                    this.getSound().playSound('enemy_laugh').once('complete', () => {
                        this.endBattle(false);
                    });
                }
            });
        });
    }

    private endBattle(victory: boolean) {
        this.setInputMode(INPUT_DISABLED);
        this.fadeOut(1200 / this.animSpeed, undefined, () => {
            GFF.AdventureContent.resumeAfterBattlePreFadeIn(victory);
            GFF.ADVENTURE_MODE.switchTo(GFF.BATTLE_MODE);
            GFF.AdventureContent.fadeIn(500, undefined, () => {
                GFF.AdventureContent.resumeAfterBattlePostFadeIn(victory);
            });
        });
    }

    public update(_time: number, _delta: number): void {
        this.updateStats();
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