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

const BAR_COLOR: number = 0xff0000;
const GOLD_COLOR: string = '#d5ccb4';
const SCRIPTURE_COLOR: string = '#663420';
const TEXT_COLOR: string = '#ffffff';
const TEXT_SHADOW: string ='#333333';
const HIT_CAPTION_COLOR: string = '#00b2b2';
const HIT_REF_COLOR: string = '#00ffff';
const MISS_CAPTION_COLOR: string = '#a90000';
const MISS_REF_COLOR: string = '#ff3737';
const ACTUAL_CAPTION_COLOR: string = '#b2691c';
const ACTUAL_REF_COLOR: string = '#ffd639';
const FINAL_SCORE_COLOR: string = '#dc00ff';

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
const RESULT_IMG_Y: number = 468;
const SCORE_CAPTION_X: number = 416;
const SCORE_CALC_X: number = 554;
const PLAYER_PARTICLE_X: number = 120;
const ENEMY_PARTICLE_X: number = 904;

const INPUT_PROMPTENTER: GInputMode = new GInputMode('battle.prompt_enter');
const INPUT_REFBOOK: GInputMode = new GInputMode('battle.ref_book');
const INPUT_REFCHAPTER: GInputMode = new GInputMode('battle.ref_chapter');
const INPUT_REFVERSE: GInputMode = new GInputMode('battle.ref_verse');
const INPUT_DISABLED: GInputMode = new GInputMode('battle.disabled');

enum BattleStage {
    NONE      = 0,  // We're in an automatic process, not waiting for the player to do anything.
    BOOK      = 1,  // Waiting for the player to select a book and press Enter.
    CHAPTER   = 2,  // Waiting for the player to type a chapter # and press Enter.
    VERSE     = 3,  // Waiting for the player to type a verse # and press Enter.
    END_GUESS = 4,  // Player has made a guess; attack sequence is in progress.
    END_TURN  = 5,  // Player has taken his turn, and the result is displayed. Press Enter to take enemy's turn.
    VICTORY   = 6   // Player is victorious! Press Enter to leave the battle.
    /**
     * When the player is defeated, the battle will exit automatically after a short delay.
     * This is acceptable and preferred for a few reasons:
     * 1) Since the battle ends with the enemy's turn, there is no score to show
     * 2) Since there is nothing to read, there's no need to wait for the player to press Enter
     * 3) It's probably better to not let the player stare at a defeat screen for too long :(
     * 4) We don't need to wait for the player to be ready before returning to AdventureMode;
     *    when he is at 0 faith, he won't be attacked by enemies, so there is no danger.
     */
};

export class GBattleContent extends GContentScene {

    private bgImage: Phaser.GameObjects.Image;
    private enemyPortraitImage: Phaser.GameObjects.Image;
    private playerMeterImage: Phaser.GameObjects.Image;
    private enemyMeterImage: Phaser.GameObjects.Image;
    private vsImage: Phaser.GameObjects.Image;
    private playerAvatar: Phaser.GameObjects.Image;
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
    private booksMultCaption: Phaser.GameObjects.Text;
    private booksMultCalc: Phaser.GameObjects.Text;
    private bonusScoreCaption: Phaser.GameObjects.Text;
    private bonusScoreCalc: Phaser.GameObjects.Text;
    private finalScoreCaption: Phaser.GameObjects.Text;
    private finalScoreCalc: Phaser.GameObjects.Text;

    private playerParticleEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
    private enemyParticleEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

    private enemyAttacks: {element: GEnemyAttack, weight: number}[];
    private enemyAttackSlashSprite: Phaser.GameObjects.Sprite;

    private playerBooks: string[];

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
        this.bgImage = this.add.image(0, 0, GFF.BATTLE_MODE.getBgImage()).setOrigin(0, 0);

        // Player and Enemy avatars:
        this.createAvatars(PLAYER.getAvatar(), ENEMY.getAvatar());

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

        this.enemyLevelText = this.add.text(ENEMY_LEVEL_TEXT_X, LEVEL_TEXT_Y, ENEMY.getSpirit().level + '', {
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

        this.enemyNameTextShadow = this.add.text(ENEMY_NAME_X + 2, NAME_Y + 2, ENEMY.getSpirit().name, {
            color: TEXT_SHADOW,
            fontFamily: 'dyonisius',
            fontSize: '24px'
        }).setOrigin(1, 0).setVisible(false);
        this.enemyNameText = this.add.text(ENEMY_NAME_X, NAME_Y, ENEMY.getSpirit().name, {
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

        this.currentStage = BattleStage.NONE;
        this.getSound().playMusic('onward');
        this.createAnimations();
        this.createGuessResult();
        this.loadEnemyAttacks();
        this.showUI();
    }

    private initInputModes() {
        // INPUT_PROMPTENTER is active while waiting for the user to press Enter:
        INPUT_PROMPTENTER.setScene(this);
        INPUT_PROMPTENTER.onKeyDown((keyEvent: KeyboardEvent) => {
            switch(keyEvent.key) {
                case 'Enter':
                    if (this.currentStage === BattleStage.END_TURN) {
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
            switch(keyEvent.key) {
                case 'ArrowUp':
                    this.bookWheel.scrollUp(0);
                    break;
                case 'ArrowDown':
                    this.bookWheel.scrollDown(0);
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
                frameRate: 24
            });
        }
    }

    private createGuessResult() {
        const smallTextStyle = {
            color: '#ffffff',
            fontFamily: 'dyonisius',
            fontSize: '16px'
        };
        const bigTextStyle = {
            color: '#ffffff',
            fontFamily: 'dyonisius',
            fontSize: '20px'
        };
        const smallGap: number = 20;
        const largeGap: number = 30;

        this.resultImage = this.add.image(GFF.GAME_W / 2, RESULT_IMG_Y, 'eval_back').setOrigin(.5, 0).setVisible(false);

        let y: number = 498;
        this.guessCaption = this.add.text(GFF.GAME_W / 2, y, 'Guessed Reference:', smallTextStyle).setOrigin(.5, 0).setVisible(false);
        y += smallGap;
        this.guessReference = this.add.text(GFF.GAME_W / 2, y, 'Genesis 20:20', bigTextStyle).setOrigin(.5, 0).setVisible(false);
        y += largeGap;

        this.actualCaption = this.add.text(GFF.GAME_W / 2, y, 'Actual Reference:', smallTextStyle).setOrigin(.5, 0).setVisible(false);
        this.actualCaption.setColor(ACTUAL_CAPTION_COLOR);
        y += smallGap;
        this.actualReference = this.add.text(GFF.GAME_W / 2, y, 'Genesis 20:20', bigTextStyle).setOrigin(.5, 0).setVisible(false);
        this.actualReference.setColor(ACTUAL_REF_COLOR);
        y += largeGap;

        this.chapterScoreCaption = this.add.text(SCORE_CAPTION_X, y, 'Chapter Score:', smallTextStyle).setOrigin(0, 0).setVisible(false);
        this.chapterScoreCalc = this.add.text(SCORE_CALC_X, y, '100', smallTextStyle).setOrigin(0, 0).setVisible(false);
        y += smallGap;

        this.verseScoreCaption = this.add.text(SCORE_CAPTION_X, y, 'Verse Score:', smallTextStyle).setOrigin(0, 0).setVisible(false);
        this.verseScoreCalc = this.add.text(SCORE_CALC_X, y, '100 x 100%', smallTextStyle).setOrigin(0, 0).setVisible(false);
        y += smallGap;

        this.bonusScoreCaption = this.add.text(SCORE_CAPTION_X, y, 'Bonus Score:', smallTextStyle).setOrigin(0, 0).setVisible(false);
        this.bonusScoreCalc = this.add.text(SCORE_CALC_X, y, '100', smallTextStyle).setOrigin(0, 0).setVisible(false);
        y += largeGap;

        this.booksMultCaption = this.add.text(SCORE_CAPTION_X, y, 'Books Multiplier:', smallTextStyle).setOrigin(0, 0).setVisible(false);
        this.booksMultCalc = this.add.text(SCORE_CALC_X, y, '200 x 66', smallTextStyle).setOrigin(0, 0).setVisible(false);
        y += smallGap;

        this.finalScoreCaption = this.add.text(SCORE_CAPTION_X, y, 'Final Score:', bigTextStyle).setOrigin(0, 0).setVisible(false);
        this.finalScoreCaption.setColor(FINAL_SCORE_COLOR);
        this.finalScoreCalc = this.add.text(SCORE_CALC_X, y, '13200', bigTextStyle).setOrigin(0, 0).setVisible(false);
        this.finalScoreCalc.setColor(FINAL_SCORE_COLOR);
    }

    private loadEnemyAttacks() {
        const ENEMY_ATTACKS: GEnemyAttack[] = [
            {
                attackName: 'basic attack',
                enemies: ['imp'],
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
            if (a.enemies.includes(ENEMY.getSpirit().type) && a.minLevel <= ENEMY.getSpirit().level) {
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

    private createAvatars(heroImageKey: string, enemyImageKey: string) {
        // Player and enemy begin off the screen
        this.playerAvatar = this.add.image(0, 0, heroImageKey).setOrigin(0, 0);
        this.playerAvatar.setPosition(-this.playerAvatar.width, AVATAR_BOTTOM - this.playerAvatar.height);
        this.enemyAvatar = this.add.image(0, 0, enemyImageKey).setOrigin(0, 0);
        this.enemyAvatar.setPosition(GFF.GAME_W, AVATAR_BOTTOM - this.enemyAvatar.height);
    }

    private doApproach() {
        // Get final destinations:
        const playerDestX: number = APPROACH_GAP;
        // (enemies come in different sizes; if the normal size makes him too close, only come as far as the player)
        const enemyDestX: number = Math.max(GFF.GAME_W - APPROACH_GAP - this.enemyAvatar.width, GFF.GAME_W - APPROACH_GAP - this.playerAvatar.width);

        // Create tween to advance player:
        this.tweens.add({
            targets: this.playerAvatar,
            x: playerDestX,
            duration: APPROACH_TIME,
            onComplete: () => {
                this.beginRound();
            }
        });
        // Create tween to advance enemy:
        this.tweens.add({
            targets: this.enemyAvatar,
            x: enemyDestX,
            duration: APPROACH_TIME
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
            duration: 200,
            onComplete: () => {
                this.tweens.add({
                    targets: this.swordImage,
                    x: SWORD_RETRACT_X,
                    duration: 500,
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
            duration: 200,
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
            duration: 200,
            alpha: 0,
            onComplete: () => {
                this.eventText.text = 'Adam missed!';
                this.getSound().playSound('miss').once('complete', () => {
                    this.setCurrentStage(BattleStage.END_TURN);
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
                this.resultImage,
                this.guessCaption,
                this.guessReference,
                this.actualCaption,
                this.actualReference,
                this.chapterScoreCaption,
                this.chapterScoreCalc,
                this.verseScoreCaption,
                this.verseScoreCalc,
                this.booksMultCaption,
                this.booksMultCalc,
                this.bonusScoreCaption,
                this.bonusScoreCalc,
                this.finalScoreCaption,
                this.finalScoreCalc
            ],
            duration: 500,
            alpha: 0.0,
            onComplete: () => {
                this.eventText.alpha = 1.0;
                this.eventText.setVisible(true);
                this.eventText.text = chosenAttack.text.replace('_', ENEMY.getSpirit().name);
                this.time.delayedCall(700, () => {
                    this.getSound().playSound(chosenAttack.soundKey);
                    chosenAttack.actionFunction();
                });
            }
        });
    }

    private beginRound() {
        this.time.delayedCall(500, () => {
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
            duration: 900
        });
        this.tweens.chain({
            targets: this.scrollClosedImage,
            duration: 900,
            tweens: [
                {
                    // Phase 1: Rise up
                    y: this.cameras.main.height * 0.3,
                    ease: 'Quad.easeOut',
                    duration: 600
                },
                {
                    // Phase 2: Fall back down
                    y: finalY,
                    ease: 'Power1',
                    duration: 300,
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
                            duration: 500,
                            x: LEFT_ROLL_END_X
                        });
                        this.tweens.add({
                            targets: this.rightRollImage,
                            duration: 500,
                            x: RIGHT_ROLL_END_X
                        });
                        this.tweens.add({
                            targets: crop,
                            duration: 500,
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
            this.servedVerse = BIBLE.getFocusedVerseFromBooks(this.playerBooks);
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
            duration: 500,
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
        this.time.delayedCall(500, () => {
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
                    this.setCurrentStage(BattleStage.END_GUESS);
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
                case BattleStage.END_GUESS:
                    this.finishGuess();
                    break;
                case BattleStage.END_TURN:
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
            case BattleStage.END_GUESS:
                setup();
                break;
            case BattleStage.END_TURN:
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
            duration: 500,
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
            duration: 500,
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
            duration: 200,
            alpha: 0.0,
            delay: 500,
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
        const verseBase: number = Math.floor(Math.max(0, 100 - (verseDiff * verseStep)));

        const hit: boolean = this.bookText.text === this.servedVerse.book;
        const perfect: boolean = hit && guessChapter === actualChapter && guessVerse === actualVerse;

        const bonusScore: number = perfect ? 100 : 0;

        const subTotal: number = Math.floor(bonusScore + chapterBase + ( (chapterBase / 100) * verseBase));
        const books: number = this.playerBooks.length;
        const finalScore: number = Math.floor(subTotal * books);

        this.guessCaption.text = 'Guessed Reference:';
        this.guessReference.text = `${this.bookText.text} ${guessChapter}:${guessVerse}`;
        this.actualCaption.text = 'Actual Reference:';
        this.actualReference.text = `${this.servedVerse.book} ${actualChapter}:${actualVerse}`;

        if (hit) {
            STATS.changeInt('Hits', 1);
            STATS.recordBookResult(this.servedVerse.book, true);
            if (perfect) {
                // Perfect!
                this.guessCaption.setText('Reference Correct: BONUS!');
                this.guessCaption.setColor(ACTUAL_CAPTION_COLOR);
                this.guessReference.setColor(ACTUAL_REF_COLOR);
                this.getSound().playSound('success');
                STATS.changeInt('CriticalHits', 1);
            } else {
                // At least the book was right...
                this.guessCaption.setColor(HIT_CAPTION_COLOR);
                this.guessReference.setColor(HIT_REF_COLOR);
            }
            this.chapterScoreCalc.text = chapterBase + '';
            this.verseScoreCalc.text = `${verseBase} x ${chapterBase}%`;
            this.bonusScoreCalc.text = bonusScore + '';
            this.booksMultCalc.text = `${subTotal} x ${books}`;
            this.finalScoreCalc.text = finalScore + '';

            // High score?
            STATS.checkNewHighScore(finalScore);

            return finalScore;
        } else {
            // We totally missed the book!
            STATS.changeInt('Misses', 1);
            STATS.recordBookResult(this.servedVerse.book, false);
            this.guessCaption.setColor(MISS_CAPTION_COLOR);
            this.guessReference.setColor(MISS_REF_COLOR);
            this.chapterScoreCalc.text = '0';
            this.verseScoreCalc.text = '0 x 0';
            this.bonusScoreCalc.text = '0';
            this.booksMultCalc.text = `0 x ${books}`;
            this.finalScoreCalc.text = '0';
            return 0;
        }
    }

    private showGuessResult() {
        this.setInputMode(INPUT_PROMPTENTER);
        this.resultImage.setVisible(true).setAlpha(1.0);
        this.guessCaption.setVisible(true).setAlpha(1.0);
        this.guessReference.setVisible(true).setAlpha(1.0);
        this.actualCaption.setVisible(true).setAlpha(1.0);
        this.actualReference.setVisible(true).setAlpha(1.0);
        this.chapterScoreCaption.setVisible(true).setAlpha(1.0);
        this.chapterScoreCalc.setVisible(true).setAlpha(1.0);
        this.verseScoreCaption.setVisible(true).setAlpha(1.0);
        this.verseScoreCalc.setVisible(true).setAlpha(1.0);
        this.booksMultCaption.setVisible(true).setAlpha(1.0);
        this.booksMultCalc.setVisible(true).setAlpha(1.0);
        this.bonusScoreCaption.setVisible(true).setAlpha(1.0);
        this.bonusScoreCalc.setVisible(true).setAlpha(1.0);
        this.finalScoreCaption.setVisible(true).setAlpha(1.0);
        this.finalScoreCalc.setVisible(true).setAlpha(1.0);
    }

    private damagePlayerFaith(amount: number) {
        this.playerParticleEmitter.explode(amount);
        const faithWrapper: {value: number} = {value: PLAYER.getFaith()};
        const newFaith: number = Math.max(0, PLAYER.getFaith() - amount);
        this.tweens.add({
            targets: [faithWrapper],
            duration: 300,
            value: newFaith,
            onUpdate: () => {
                PLAYER.setFaith(Math.floor(faithWrapper.value));
            },
            onComplete: () => {
                this.tweens.add({
                    targets: this.eventText,
                    duration: 200,
                    alpha: 0.0,
                    delay: 1000,
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
            duration: 300,
            value: newRes,
            onUpdate: () => {
                ENEMY.setResistance(Math.floor(resWrapper.value));
            },
            onComplete: () => {
                this.tweens.add({
                    targets: this.swordImage,
                    alpha: 0,
                    duration: 1000,
                    onComplete: () => {
                        if (ENEMY.getResistance() <= 0) {
                            this.doVictorySequence();
                        } else {
                            this.setCurrentStage(BattleStage.END_TURN);
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
            duration: APPROACH_TIME,
            onComplete: () => {
                this.setCurrentStage(BattleStage.VICTORY);
            }
        });
    }

    private doDefeatSequence() {
        this.getSound().fadeOutMusic(500, () => {
            this.getSound().playSound('defeat');
            // Create tween to retreat player:
            this.tweens.add({
                targets: this.playerAvatar,
                x: -this.playerAvatar.width,
                duration: APPROACH_TIME,
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
        this.fadeOut(1200, undefined, () => {
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