import { ARMORS } from "../armors";
import { BOOKS } from "../books";
import { COLOR } from "../colors";
import { COMMANDMENTS } from "../commandments";
import { GInputMode } from "../GInputMode";
import { GFF } from "../main";
import { GEnemySprite } from "../objects/chars/GEnemySprite";
import { GPersonSprite } from "../objects/chars/GPersonSprite";
import { GMenuCheckOption } from "../objects/components/GMenuCheckOption";
import { GMenuRadioGroup } from "../objects/components/GMenuRadioGroup";
import { GMenuRadioOption } from "../objects/components/GMenuRadioOption";
import { GMenuSection } from "../objects/components/GMenuSection";
import { GMenuTextOption } from "../objects/components/GMenuTextOption";
import { GTextOptionButton } from "../objects/components/GTextOptionButton";
import { PLAYER } from "../player";
import { REGISTRY } from "../registry";
import { SAVE } from "../save";
import { GDifficulty } from "../types";
import { GContentScene } from "./GContentScene";

type CheckFunction = (labelText: string, checkState: boolean) => void;
type FontSize = 'sm'|'md'|'lg';

const FONT_SIZE_MAP: { [key in FontSize]: string } = {
    sm: '28px',
    md: '40px',
    lg: '60px'
};

const INPUT_DEFAULT: GInputMode = new GInputMode('mainmenu.default');
const MENU_TITLE_Y: number = 150; // Y position for the main menu title
const MENU_OPTIONS_Y: number = 230; // Y position for the menu options
const CENTER_X: number = 512; // Center X position for menu options
const LEFT_COL_X: number = 280; // Left column X position for menu options
const RIGHT_COL_X: number = 540; // Right column X position for menu options
const OPTION_GAP: number = 20; // Vertical gap between options
const EXTRA_GAP: number = 40; // Extra space where needed

const COLOR_SCHEME = {
    title: COLOR.GOLD_1,
    optionDefault: COLOR.GOLD_2,
    optionHighlight: COLOR.GOLD_3,
};

export class GMainMenuContent extends GContentScene {

    private mainMenuSection: GMenuSection;
    private newGameOptionsSection: GMenuSection;
    private currentMenuSection: GMenuSection|null = null;
    private descriptionText: Phaser.GameObjects.Text;
    private lastInputType: 'keyboard'|'mouse' = 'keyboard';

    constructor() {
        super("MainMenuContent");
        this.setContainingMode(GFF.MAINMENU_MODE);
    }

    public preload(): void {
    }

    public create(): void {
        // Create the background image
        const background = this.add.image(0, 0, 'main_menu_bg').setOrigin(0, 0);

        // Create the description text
        this.descriptionText = this.add.text(CENTER_X, 690, ``, {
            color: COLOR_SCHEME.title.str(),
            fontFamily: 'dyonisius',
            fontSize: FONT_SIZE_MAP.sm
        }).setOrigin(0.5, 0);

        // Initialize the menu sections
        this.initMainMenu();
        this.initNewGameOptions();

        // Play the looping theme music
        this.getSound().playMusic('saints');

        // Fade in the background
        this.fadeIn(1000, undefined, () => {
            GFF.setMouseVisible(true);
            this.displayMenuSection(this.mainMenuSection);
        });

        this.initInputMode();
    }

    private displayMenuSection(menuSection: GMenuSection): void {
        // Clear the previous section
        this.currentMenuSection?.setVisible(false);

        // Display the new section
        this.currentMenuSection = menuSection;

        // Add the options to the scene
        this.currentMenuSection.setVisible(true);

        // Set the focus on the first option if the keyboard is active
        if (this.lastInputType === 'keyboard') {
            this.currentMenuSection.getOptions()[0].setFocus();
        } else {
            this.currentMenuSection?.clearFocusHighlight();
        }
    }

    private initMainMenu(): void {
        this.mainMenuSection = new GMenuSection(this, "Main Menu", COLOR_SCHEME.title, MENU_TITLE_Y);

        let optionY: number = MENU_OPTIONS_Y;
        optionY = OPTION_GAP + this.mainMenuSection.addOption(this.initTextOption(CENTER_X, optionY, "New Game", 'md',
            `Begin a new game as our hero, Adam Cesar`, () => {
            this.displayMenuSection(this.newGameOptionsSection);
        }));

        optionY = OPTION_GAP + this.mainMenuSection.addOption(this.initTextOption(CENTER_X, optionY, "Continue Game", 'md',
            `Continue a previously saved game`, () => {
            this.continueGame();
        }));

        optionY = OPTION_GAP + this.mainMenuSection.addOption(this.initTextOption(CENTER_X, optionY, "Duel Mode", 'md',
            `Share a friendly head-to-head scripture battle with a friend`, () => {
            console.log('Duel Mode - (not implemented yet)');
        }));

        optionY = OPTION_GAP + this.mainMenuSection.addOption(this.initTextOption(CENTER_X, optionY, "Top Scores", 'md',
            `View the list of top 10 scores`, () => {
            console.log('Top Scores - (not implemented yet)');
        }));

        optionY = OPTION_GAP + this.mainMenuSection.addOption(this.initTextOption(CENTER_X, optionY, "View Glossary", 'md',
            `See how game elements were derived from the Bible`, () => {
            console.log('View Glossary - (not implemented yet)');
        }));

        optionY = OPTION_GAP + this.mainMenuSection.addOption(this.initTextOption(CENTER_X, optionY, "Options", 'md',
            `Configure options for Audio, Video, and Gameplay`, () => {
            console.log('Options - (not implemented yet)');
        }));

        optionY = OPTION_GAP + this.mainMenuSection.addOption(this.initTextOption(CENTER_X, optionY, "Credits", 'md',
            `View a list of people who worked hard to create this game`, () => {
            console.log('Credits - (not implemented yet)');
        }));

        optionY = OPTION_GAP + this.mainMenuSection.addOption(this.initTextOption(CENTER_X, optionY, "Exit Game", 'md',
            `The grace of our Lord Jesus Christ be with your spirit. Amen.`, () => {
            console.log('Exit Game - (not implemented yet)');
        }));

        this.mainMenuSection.getOptions().forEach(option => {
            option.setDescriptionHost(this.descriptionText);
        });
    }

    private initNewGameOptions(): void {
        // Radio groups for difficulty, game type, and books order
        const difficultyGroup: GMenuRadioGroup = new GMenuRadioGroup();
        const gameTypeGroup: GMenuRadioGroup = new GMenuRadioGroup();
        const booksOrderGroup: GMenuRadioGroup = new GMenuRadioGroup();

        this.newGameOptionsSection = new GMenuSection(this, "New Game", COLOR_SCHEME.title, MENU_TITLE_Y);

        // Start Left column at the top:
        let optionY: number = MENU_OPTIONS_Y;

        // Difficulty group
        optionY = OPTION_GAP + this.newGameOptionsSection.addOtherComponent(this.initHeader(LEFT_COL_X, optionY, "Difficulty:", 'md'));
        optionY = OPTION_GAP + this.newGameOptionsSection.addOption(this.initRadioOption(LEFT_COL_X, optionY, "Babe", 'sm', difficultyGroup,
            `Out of the mouth of babes and sucklings thou hast perfected praise`, (_labelText: string, checkState: boolean) => {
            if (checkState) {
                REGISTRY.set('difficulty', GFF.DIFFICULTY_BABE.index);
            }
        }));
        optionY = OPTION_GAP + this.newGameOptionsSection.addOption(this.initRadioOption(LEFT_COL_X, optionY, "Disciple", 'sm', difficultyGroup,
            `If ye continue in my word, then are ye my disciples indeed`, (_labelText: string, checkState: boolean) => {
            if (checkState) {
                REGISTRY.set('difficulty', GFF.DIFFICULTY_DISCIPLE.index);
            }
        }));
        optionY = OPTION_GAP + this.newGameOptionsSection.addOption(this.initRadioOption(LEFT_COL_X, optionY, "Soldier", 'sm', difficultyGroup,
            `Thou therefore endure hardness, as a good soldier of Jesus Christ`, (_labelText: string, checkState: boolean) => {
            if (checkState) {
                REGISTRY.set('difficulty', GFF.DIFFICULTY_SOLDIER.index);
            }
        }));

        // Start Right column at the top:
        optionY = MENU_OPTIONS_Y;

        // Game type group
        optionY = OPTION_GAP + this.newGameOptionsSection.addOtherComponent(this.initHeader(RIGHT_COL_X, optionY, "Game Type:", 'md'));
        optionY = OPTION_GAP + this.newGameOptionsSection.addOption(this.initRadioOption(RIGHT_COL_X, optionY, "Classic", 'sm', gameTypeGroup,
            `All verses from enabled books can appear in battles - a real challenge!`, (_labelText: string, checkState: boolean) => {
            if (checkState) {
                REGISTRY.set('gameType', 'classic');
            }
        }));
        optionY = EXTRA_GAP + this.newGameOptionsSection.addOption(this.initRadioOption(RIGHT_COL_X, optionY, "Focused", 'sm', gameTypeGroup,
            `Only a small selection of verses from enabled books can appear in battles`, (_labelText: string, checkState: boolean) => {
            if (checkState) {
                REGISTRY.set('gameType', 'focused');
            }
        }));

        // Books order group
        optionY = OPTION_GAP + this.newGameOptionsSection.addOtherComponent(this.initHeader(RIGHT_COL_X, optionY, "Books Order:", 'md'));
        optionY = OPTION_GAP + this.newGameOptionsSection.addOption(this.initRadioOption(RIGHT_COL_X, optionY, "Random", 'sm', booksOrderGroup,
            `Begin with the Gospel of John; other books will be found in a random order`, (_labelText: string, checkState: boolean) => {
            if (checkState) {
                REGISTRY.set('booksOrder', 'random');
            }
        }));
        optionY = EXTRA_GAP + this.newGameOptionsSection.addOption(this.initRadioOption(RIGHT_COL_X, optionY, "Canonical", 'sm', booksOrderGroup,
            `Begin with the Book of Genesis; other books will be found in canonical order`, (_labelText: string, checkState: boolean) => {
            if (checkState) {
                REGISTRY.set('booksOrder', 'canonical');
            }
        }));

        // Start game or go back to the main menu
        optionY = OPTION_GAP + this.newGameOptionsSection.addOption(this.initTextOption(CENTER_X, optionY, "Start Game", 'md',
            `Start the game with selected options`, () => {
            this.beginNewGame();
        }));
        optionY = OPTION_GAP + this.newGameOptionsSection.addOption(this.initTextOption(CENTER_X, optionY, "Back", 'md',
            `Return to the Main Menu`, () => {
            this.displayMenuSection(this.mainMenuSection);
        }));

        this.newGameOptionsSection.setVisible(false);

        // Init default options:
        this.newGameOptionsSection.getOptions().filter(
            option => option instanceof GMenuTextOption && (
                option.text === 'Disciple' ||
                option.text === 'Classic' ||
                option.text === 'Random'
            )
        ).forEach(option => {
            option.onClick(false);
        });

        this.newGameOptionsSection.getOptions().forEach(option => {
            option.setDescriptionHost(this.descriptionText);
        });
    }

    private initHeader(x: number, y: number, text: string, size: FontSize): Phaser.GameObjects.Text {
        return this.add.text(x, y, text, {
            color: COLOR_SCHEME.optionDefault.str(),
            fontFamily: 'dyonisius',
            fontSize: FONT_SIZE_MAP[size]
        }).setOrigin(0, 0);
    }

    private initTextOption(x: number, y: number, text: string, size: FontSize, descriptionText: string, clickFunction: Function): GMenuTextOption {
        const textOption: GMenuTextOption = new GMenuTextOption(this, x, y, text, descriptionText, {
            color: COLOR_SCHEME.optionDefault.str(),
            fontFamily: 'dyonisius',
            fontSize: FONT_SIZE_MAP[size]
        }).setOrigin(0.5, 0);
        textOption.setClickFunction(clickFunction);
        textOption.setColorScheme(COLOR_SCHEME.optionDefault, COLOR_SCHEME.optionHighlight);
        return textOption;
    }

    private initCheckOption(x: number, y: number, text: string, size: FontSize, descriptionText: string, checkFunction: CheckFunction, clickFunction?: Function): GMenuCheckOption {
        const checkOption: GMenuCheckOption = new GMenuCheckOption(this, x, y, text, COLOR_SCHEME.optionDefault, descriptionText, {
            color: COLOR_SCHEME.optionDefault.str(),
            fontFamily: 'dyonisius',
            fontSize: FONT_SIZE_MAP[size]
        });
        if (clickFunction) {
            checkOption.setClickFunction(clickFunction);
        }
        checkOption.setCheckFunction(checkFunction);
        checkOption.setColorScheme(COLOR_SCHEME.optionDefault, COLOR_SCHEME.optionHighlight);
        checkOption.setCheckColor(COLOR_SCHEME.title);
        return checkOption;
    }

    private initRadioOption(x: number, y: number, text: string, size: FontSize, radioGroup: GMenuRadioGroup, descriptionText: string, checkFunction: CheckFunction): GMenuRadioOption {
        const radioOption: GMenuRadioOption = new GMenuRadioOption(this, x, y, text, COLOR_SCHEME.optionDefault, descriptionText, {
            color: COLOR_SCHEME.optionDefault.str(),
            fontFamily: 'dyonisius',
            fontSize: FONT_SIZE_MAP[size]
        });
        radioOption.setRadioGroup(radioGroup);
        radioOption.setCheckFunction(checkFunction);
        radioOption.setColorScheme(COLOR_SCHEME.optionDefault, COLOR_SCHEME.optionHighlight);
        radioOption.setCheckColor(COLOR_SCHEME.title);
        return radioOption;
    }

    private beginNewGame(): void {
        GFF.AdventureContent.getSound().playSound('amen');

        /**
         * Initialize the new game with selected options.
         * Everything listed here will be loaded from a save file
         * when continuing a game.
         */
        GFF.log('Starting new game with options:');
        GFF.log(`Difficulty: ${GFF.getDifficulty().levelName}`);
        GFF.log(`Game Type: ${REGISTRY.get('gameType')}`);
        GFF.log(`Books Order: ${REGISTRY.get('booksOrder')}`);

        // Init some registry values:
        REGISTRY.set('canSaintGift', true);

        // Init Commandments:
        COMMANDMENTS.initCommandments();

        // Create the people:
        GPersonSprite.createAllPeople();

        // Create the enemies:
        GEnemySprite.createAllSpirits();

        // Init Bible books:
        BOOKS.initBooks();
        if (REGISTRY.get('booksOrder') === 'random') {
            BOOKS.startWithBook('John');
            BOOKS.shuffleBooksToFind();
        } else {
            BOOKS.startWithBook('Genesis');
            BOOKS.reverseBooksToFind();
        }

        // Initialize player:
        PLAYER.init();

        // Determine whether to skip the intro:
        switch (REGISTRY.getNumber('skipIntro')) {
            case 1:
                // Skip entire intro and start the game immediately;
                // We have to give Adam everything that he would normally get in the intro.
                REGISTRY.set('doIntro', false);
                PLAYER.beBornAgain();
                BOOKS.obtainFirstBook();
                ARMORS.obtainArmor(1);
                break;
            default:
                // For any other value, show the intro.
                // Other values will be used in the opening cutscene to skip certain parts.
                REGISTRY.set('doIntro', true);
        }

        // Transition to the world build mode
        this.getSound().fadeOutMusic(1000);
        this.fadeOut(1000, undefined, () => {
            GFF.WORLDBUILD_MODE.switchTo(GFF.MAINMENU_MODE);
        });
    }

    private continueGame(): void {
        GFF.AdventureContent.getSound().playSound('amen');

        /**
         * Continue a game from a savefile.
         *
         * While load functionality is in development, transition directly
         * to the Load Game mode. When it's ready, we'll show a dialog to
         * allow selecting a savefile.
         *
         * The eventual plan will be to have 2 ways to save/load:
         * - save/load in IndexedDB with a custom UI save slot system
         * - download/upload a JSON file as an Import/Export option
         *
         * Both options should be accessible from the Main Menu UI;
         * so before switching to the Load Game mode, we'll already
         * have loaded the savefile data into memory via either option.
         *
         * So we'll either call:
         * - SAVE.loadFromIndexedDb()
         * - SAVE.uploadSaveFile()
         *
         * For now we'll just load a static test savefile and save that
         * in the registry for the Load Game mode to use.
         */
        GFF.log('Continuing saved game...');

        // Load the test savefile here and put it in the registry;
        // don't bother putting this in SAVE, since it's just for testing.
        this.loadTestSaveFile();

        // Transition to the load game mode
        this.getSound().fadeOutMusic(1000);
        this.fadeOut(1000, undefined, () => {
            GFF.LOADGAME_MODE.switchTo(GFF.MAINMENU_MODE);
        });
    }

    private loadTestSaveFile(): void {
        fetch("/assets/_test_saves/test_save.gffsave")
            .then(res => res.arrayBuffer())
            .then(buf => {
                REGISTRY.set('loadedSaveData', new Uint8Array(buf));
                // Re-save the loaded data as plain-text JSON for verification:
                SAVE.resaveLoadedGameData();
            });
    }

    private initInputMode() {
        INPUT_DEFAULT.setScene(this);
        INPUT_DEFAULT.allowRepeats(['ArrowUp', 'ArrowDown']);
        INPUT_DEFAULT.onKeyDown((keyEvent: KeyboardEvent) => {
            GFF.setMouseVisible(false);
            switch(keyEvent.key) {
                case 'ArrowUp':
                    this.currentMenuSection?.focusPreviousOption();
                    break;
                case 'ArrowDown':
                    this.currentMenuSection?.focusNextOption();
                    break;
                case 'Enter':
                    // Only process Enter key if the last input was from the keyboard;
                    // otherwise, Enter might submit an indexed item that is not already highlighted.
                    if (this.lastInputType === 'keyboard') {
                        const selectedOption = this.currentMenuSection?.getFocusedOption();
                        if (selectedOption) {
                            selectedOption.onClick();
                        }
                    } else {
                        this.currentMenuSection?.restoreFocusHighlight();
                    }
                    break;
            }
            this.lastInputType = 'keyboard';
        });
        this.setInputMode(INPUT_DEFAULT);

        // Send keyboard input to the current InputMode:
        this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
            this.getInputMode()?.processKeyDown(event);
        });
        this.input.keyboard?.on('keyup', (event: KeyboardEvent) => {
            this.getInputMode()?.processKeyUp(event);
        });

        this.input.on('pointermove', (_pointer: Phaser.Input.Pointer) => {
            if (this.lastInputType === 'keyboard') {
                this.lastInputType = 'mouse';
                this.currentMenuSection?.clearFocusHighlight();
                GFF.setMouseVisible(true);
            }
        });
    }

    public update(_time: number, _delta: number): void {
    }
}