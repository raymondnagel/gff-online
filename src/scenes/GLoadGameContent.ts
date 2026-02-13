import 'phaser';
import { GBaseScene } from './GBaseScene';
import { GWorldArea } from '../areas/GWorldArea';
import { GFF } from '../main';
import { GInputMode } from '../GInputMode';
import { GChurchArea } from '../areas/GChurchArea';
import { GStrongholdArea } from '../areas/GStrongholdArea';
import { GTowerRegion } from '../regions/GTowerRegion';
import { GDungeonRegion } from '../regions/GDungeonRegion';
import { GKeepRegion } from '../regions/GKeepRegion';
import { GFortressRegion } from '../regions/GFortressRegion';
import { GCastleRegion } from '../regions/GCastleRegion';
import { SAVE, FullSaveData } from '../save';
import { ENEMY } from '../enemy';
import { PEOPLE } from '../people';
import { GColor, GPerson, GSaveable, GSpirit } from '../types';
import { GSector } from '../regions/GSector';
import { GRegion } from '../regions/GRegion';
import { GPlainRegion } from '../regions/GPlainRegion';
import { GForestRegion } from '../regions/GForestRegion';
import { GTundraRegion } from '../regions/GTundraRegion';
import { GSwampRegion } from '../regions/GSwampRegion';
import { GDesertRegion } from '../regions/GDesertRegion';
import { GMountRegion } from '../regions/GMountRegion';
import { GStrongholdRegion } from '../regions/GStrongholdRegion';
import { GChurchRegion } from '../regions/GChurchRegion';
import { GTown } from '../GTown';
import { GChurch } from '../GChurch';
import { GStronghold } from '../strongholds/GStronghold';
import { GArea } from '../areas/GArea';
import { GStrongholdTower } from '../strongholds/GStrongholdTower';
import { GStrongholdFortress } from '../strongholds/GStrongholdFortress';
import { GStrongholdKeep } from '../strongholds/GStrongholdKeep';
import { GStrongholdDungeon } from '../strongholds/GStrongholdDungeon';
import { GStrongholdCastle } from '../strongholds/GStrongholdCastle';
import { GRoom } from '../GRoom';
import { AREA } from '../area';
import { TOWN } from '../town';
import { CHURCH } from '../church';
import { STRONGHOLD } from '../stronghold';
import { REGISTRY } from '../registry';
import { STATS } from '../stats';
import { PLAYER } from '../player';
import { FRUITS } from '../fruits';
import { COMMANDMENTS } from '../commandments';
import { ARMORS } from '../armors';
import { BOOKS } from '../books';
import { RANDOM } from '../random';
import { COLOR } from '../colors';

type IdRegistry = Map<number, any>;

export type RefFunction = (id: number|string) => any;
type InitFunction = (context: any, refObj: RefFunction) => any;
type HydrateFunction = (id: number, context: any, refObj: RefFunction) => any;

type CollectionInfo = {
    name: string,
    collection: any[],
    initFunc: InitFunction,
    hydrateFunc?: HydrateFunction
};

const INPUT_DISABLED: GInputMode = new GInputMode('loadgame.disabled');
const INPUT_PROMPTENTER: GInputMode = new GInputMode('loadgame.prompt_enter');

const LOAD_COLOR: number     = COLOR.WHITE.num();
const PROGRESS_COLOR: number = COLOR.GREY_3.num();
const PROGRESS_LENGTH: number = 512;

export class GLoadGameContent extends GBaseScene {
    private bgImage: Phaser.GameObjects.Image;
    private loadBar: Phaser.GameObjects.Rectangle;
    private progressBar: Phaser.GameObjects.Rectangle;
    private progressText: Phaser.GameObjects.Text;
    private promptText: Phaser.GameObjects.Text;
    private titleText: Phaser.GameObjects.Text;

    private saveData: FullSaveData;
    private static idRegistry: IdRegistry = new Map<number, any>();

    constructor() {
        super("LoadGameContent");
        this.setContainingMode(GFF.LOADGAME_MODE);
        GFF.genLog('GLoadGameContent constructed');
    }

    public preload(): void {
        this.createObjects();
        this.initInputModes();
        this.setInputMode(INPUT_DISABLED);

        /**
         * At this point, there should be something in the UI to allow
         * picking a save file.
         */
        this.saveData = SAVE.decodeLoadedSaveData();

        // No longer needed, and it's large, so remove it to free up memory.
        // Even worse, if we keep it, it would be re-added to the save file!
        REGISTRY.remove('loadedSaveData');
    }

    private initInputModes() {
        // INPUT_PROMPTENTER is active while waiting for the user to press Enter:
        INPUT_PROMPTENTER.setScene(this);
        INPUT_PROMPTENTER.onKeyDown((keyEvent: KeyboardEvent) => {
            if (keyEvent.key === 'Enter') {
                this.setInputMode(INPUT_DISABLED);
                this.tweens.killAll();
                this.promptText.setAlpha(1);
                this.fadeOut(500, undefined, () => {
                    GFF.ADVENTURE_MODE.switchTo(GFF.LOADGAME_MODE);
                });
            }
        });

        // INPUT_DISABLED is active during game loading;
        // no additional initialization is needed, since it won't do anything.
        INPUT_DISABLED.setScene(this);

        // Send keyboard input to the current InputMode:
        this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
            this.getInputMode()?.processKeyDown(event);
        });
    }

    private createObjects() {
        const bgImageKey = `load_bg_${RANDOM.randInt(1, 4)}`;
        this.bgImage = this.add.image(0, 0, bgImageKey).setOrigin(0, 0);

        this.titleText = this.add.text(GFF.GAME_W / 2, GFF.GAME_H / 2, 'Loading Game...', {
            fontFamily: 'dyonisius',
            fontSize: 36,
            color: COLOR.WHITE.str(),
            stroke: COLOR.GREY_1.str(),
            strokeThickness: 6
        }).setOrigin(.5, .5);

        this.loadBar = this.add.rectangle(
            GFF.GAME_W / 2,
            GFF.GAME_H - 20,
            PROGRESS_LENGTH + 4,
            32,
            LOAD_COLOR
        ).setOrigin(.5, 1);

        this.progressBar = this.add.rectangle(
            (GFF.GAME_W / 2) - (PROGRESS_LENGTH / 2),
            GFF.GAME_H - 22,
            0,
            28,
            PROGRESS_COLOR
        ).setOrigin(0, 1);

        this.progressText = this.add.text(
            GFF.GAME_W / 2,
            GFF.GAME_H - 36,
            '0%',
            { fontFamily: 'oxygen', fontSize: 14, color: COLOR.BLACK.str() }
        ).setOrigin(.5, .5);

        this.promptText = this.add.text(GFF.GAME_W / 2, GFF.GAME_H / 2, 'Press Enter to start!', {
            fontFamily: 'dyonisius',
            fontSize: 36,
            color: COLOR.WHITE.str(),
            stroke: COLOR.GREY_1.str(),
            strokeThickness: 6
        }).setOrigin(.5, .5).setAlpha(0);
    }

    public setProgress(description: string, current: number, goal: number) {
        const ratio: number = current / goal;
        this.progressBar.width = ratio * PROGRESS_LENGTH;

        // Calculate the percent:
        const percent: number = Math.floor(ratio * 100);
        this.progressText.setText(`${description}: ${percent}%`);
    }

    private collectionList: CollectionInfo[];
    public create(): void {
        GFF.genLog('GLoadGameContent.create()');

        // Fade in the scene, then start loading the game state:
        this.fadeIn(1000, undefined, () => {
            this.loadGameState();
        });
    }

    private loadGameState() {
        const saveData = this.saveData;

        this.collectionList = [
            { name: 'people', collection: saveData.people, initFunc: this.initPerson, hydrateFunc: PEOPLE.hydratePerson },
            { name: 'enemies', collection: saveData.enemies, initFunc: this.initSpirit, hydrateFunc: ENEMY.hydrateSpirit },
            { name: 'sectors', collection: saveData.sectors, initFunc: this.initSector },
            { name: 'regions', collection: saveData.regions, initFunc: this.initRegion },
            { name: 'areas', collection: saveData.areas, initFunc: this.initArea },
            { name: 'towns', collection: saveData.towns, initFunc: this.initTown },
            { name: 'churches', collection: saveData.churches, initFunc: this.initChurch },
            { name: 'strongholds', collection: saveData.strongholds, initFunc: this.initStronghold },
            { name: 'rooms', collection: saveData.rooms, initFunc: this.initRoom },
        ];

        // Other preparation
        AREA.CHURCH_AREAS = []; // We'll push to this as we create churches, but it must be assigned

        // First pass: create the basic objects and store them in the registry by their IDs.
        this.buildCollectionObjects(0);
    }

    private loadFinalData() {
        /**
         * Load some data outside of the collection system, since they are
         * single objects that will load in an instant, not arrays of objects
         * that need to be loaded one at a time to show progress.
         */

        const registryData = this.saveData.registry;
        for (const key in registryData) {
            REGISTRY.set(key, registryData[key]);
        }

        STATS.fromSaveData(this.saveData.stats);

        FRUITS.fromSaveData(this.saveData.fruits);

        COMMANDMENTS.fromSaveData(this.saveData.commandments);

        ARMORS.fromSaveData(this.saveData.armors);

        BOOKS.fromSaveData(this.saveData.books);

        // Do player data last; max faith will be calculated based on inventory
        const playerData = this.saveData.player;
        PLAYER.fromSaveData(playerData, GLoadGameContent.objFor);
    }

    /**
     * buildCollectionObjects() is the "first pass" of the loading process.
     * We'll step through each item in the collection, calling its initFunc
     * to create the basic object and store it in the registry by its ID.
     */
    private buildCollectionObjects(collectionIndex: number) {
        // Get a collection of objects from the JSON by index
        const collectionInfo: CollectionInfo = this.collectionList[collectionIndex];
        let itemIndex = 0;

        const timer: Phaser.Time.TimerEvent = this.time.addEvent({
            callback: () => {
                // Call a function to process a single object from the collection, and return whether there are more objects to process
                if (this.initCollectionObject(collectionInfo, itemIndex)) {
                    // If true, increment, update progress, and continue
                    itemIndex++;
                    this.setProgress(`Remembering ${collectionInfo.name}`, itemIndex, collectionInfo.collection.length);
                } else {
                    // If false...
                    timer.destroy();
                    // If there are more collections to process, move on to the next one
                    if (collectionIndex < this.collectionList.length - 1) {
                        this.buildCollectionObjects(collectionIndex + 1);
                    // Otherwise, we're done loading the save, and we'll prompt for Enter to continue to the game
                    } else {
                        this.hydrateObjects(0);
                    }
                }
            },
            delay: 5,
            loop: true,
        });
    }

    private initCollectionObject(collectionInfo: CollectionInfo, itemIndex: number): boolean {
        // Get the next item from the collection at the given index
        const item = collectionInfo.collection[itemIndex];
        // Get the ID of the item, and check that it's not already in the registry (if it is, we'll just ignore it)
        if (!GLoadGameContent.idRegistry.has(item.id)) {
            // Create a new object instance by calling the initFunc
            const newObj = collectionInfo.initFunc(item.data, GLoadGameContent.objFor);
            // Update the registry with the new object and its ID
            GLoadGameContent.idRegistry.set(item.id, newObj);
        }
        // Return whether there are more items to process
        return itemIndex < collectionInfo.collection.length - 1;
    }

    /**
     * hydrateObjects() is the "second pass" of the loading process.
     * We'll step through each item in the collection, get the object
     * from the registry by its ID, and call its hydrateLoadedObject() method
     * (or the hydrateFunc, in the case of interfaces) to fill in the
     * properties that reference other objects.
     */
    private hydrateObjects(collectionIndex: number) {
        // Get a collection of objects from the JSON by index
        const collectionInfo: CollectionInfo = this.collectionList[collectionIndex];
        let itemIndex = 0;

        const timer: Phaser.Time.TimerEvent = this.time.addEvent({
            callback: () => {
                // Call a function to process a single object from the collection, and return whether there are more objects to process
                if (this.hydrateCollectionObject(collectionInfo, itemIndex)) {
                    // If true, increment, update progress, and continue
                    itemIndex++;
                    this.setProgress(`Reconnecting ${collectionInfo.name}`, itemIndex, collectionInfo.collection.length);
                } else {
                    // If false...
                    timer.destroy();
                    // If there are more collections to process, move on to the next one
                    if (collectionIndex < this.collectionList.length - 1) {
                        this.hydrateObjects(collectionIndex + 1);
                    // Otherwise, we're done loading the save, and we'll prompt for Enter to continue to the game
                    } else {
                        this.time.delayedCall(500, () => {
                            this.loadFinalData();
                            this.loadBar.setVisible(false);
                            this.progressBar.setVisible(false);
                            this.progressText.setVisible(false);
                            this.titleText.setVisible(false);
                            this.setInputMode(INPUT_PROMPTENTER);
                            this.tweens.add({
                                targets: this.promptText,
                                alpha: { from: 0, to: 1 },
                                duration: 700,
                                yoyo: true,
                                repeat: -1,
                                ease: 'Linear'
                            });
                        })
                    }
                }
            },
            delay: 5,
            loop: true,
        });
    }

    private hydrateCollectionObject(collectionInfo: CollectionInfo, itemIndex: number): boolean {
        // Get the next item from the collection at the given index
        const item = collectionInfo.collection[itemIndex];
        // Get the object from the registry by its ID
        const obj = GLoadGameContent.idRegistry.get(item.id);
        // Call the correct hydrate function to fill in its references
        if (collectionInfo.hydrateFunc) {
            collectionInfo.hydrateFunc(item.id, item.data, GLoadGameContent.objFor);
        } else {
            // We assume that if there isn't a hydrateFunc, then the object itself
            // is a GSaveable, with its own hydrateLoadedObject() method to call
            (obj as GSaveable).hydrateLoadedObject(item.data, GLoadGameContent.objFor);
        }
        // Return whether there are more items to process
        return itemIndex < collectionInfo.collection.length - 1;
    }

    private static objFor(id: number|string|null): any {
        if (id === null) {
            return null;
        }
        const numId = typeof id === 'string' ? Number(id.slice(1)) : id;
        return GLoadGameContent.idRegistry.get(numId);
    }

    /**
     * Init function for each collection creates a basic object instance,
     * calling the correct constructor with arguments supplied by the context.
     * If there are external references to these objects, such as AREA.WORLD_AREA,
     * they can be assigned here as well.
     */

    private initPerson(context: any, _refObj: RefFunction): GPerson {
        const person: GPerson = {
            firstName: context.firstName,
            lastName: context.lastName,
            preferredName: context.preferredName,
            spriteKeyPrefix: context.spriteKeyPrefix,
            gender: context.gender,
            voice: context.voice,
            faith: context.faith,
            familiarity: context.familiarity,
            nameLevel: context.nameLevel,
            reprobate: context.reprobate,
            convert: context.convert,
            captive: context.captive,
            specialGift: context.specialGift,
            bio1: context.bio1,
            bio2: context.bio2,
            favoriteBook: context.favoriteBook,
            conversations: context.conversations,
            homeTown: null, // Hydrate later
        };
        PEOPLE.addPerson(person);
        return person;
    }

    private initSpirit(context: any, _refObj: RefFunction): GSpirit {
        const spirit: GSpirit = {
            type: context.type,
            name: context.name,
            level: context.level,
            introduced: context.introduced,
            portraitKey: context.portraitKey,
            avatarKey: context.avatarKey
        };
        ENEMY.addSpirit(spirit);
        return spirit;
    }

    private initSector(context: any, _refObj: RefFunction): GSector {
        return new GSector(
            new GColor(context.color)
        );
    }

    private initRegion(context: any, _refObj: RefFunction): GRegion {
        /**
         * Region data mostly comes from the subclass, so we don't
         * need to pull much from the context.
         */
        switch (context.name) {
            case 'plain':
                return new GPlainRegion();
            case 'forest':
                return new GForestRegion();
            case 'desert':
                return new GDesertRegion();
            case 'swamp':
                return new GSwampRegion();
            case 'tundra':
                return new GTundraRegion();
            case 'mountains':
                return new GMountRegion();
            case 'church':
                return new GChurchRegion();
        }
        switch (context.fullName) {
            case 'Tower of Deception':
                return new GTowerRegion();
            case 'Dungeon of Doubt':
                return new GDungeonRegion();
            case 'Keep of Wickedness':
                return new GKeepRegion();
            case 'Fortress of Enmity':
                return new GFortressRegion();
            case 'Castle of Perdition':
                return new GCastleRegion();
        }
        throw new Error(`Unknown region type: ${context.name} / ${context.fullName}`);
    }

    private initArea(context: any, refObj: RefFunction): GArea {
        switch (context.name) {
            case 'Land of Allegoria':
                AREA.WORLD_AREA = new GWorldArea();
                return AREA.WORLD_AREA;
            case 'Tower of Deception':
                AREA.TOWER_AREA = GLoadGameContent.initStrongholdArea(context, refObj);
                return AREA.TOWER_AREA;
            case 'Dungeon of Doubt':
                AREA.DUNGEON_AREA = GLoadGameContent.initStrongholdArea(context, refObj);
                return AREA.DUNGEON_AREA;
            case 'Keep of Wickedness':
                AREA.KEEP_AREA = GLoadGameContent.initStrongholdArea(context, refObj);
                return AREA.KEEP_AREA;
            case 'Fortress of Enmity':
                AREA.FORTRESS_AREA = GLoadGameContent.initStrongholdArea(context, refObj);
                return AREA.FORTRESS_AREA;
            case 'Castle of Perdition':
                AREA.CASTLE_AREA = GLoadGameContent.initStrongholdArea(context, refObj);
                return AREA.CASTLE_AREA;
            case 'Gloomy Tomb':
                // Doesn't exist yet; ignore for now
                // return new GCaveArea();
            default:
                // All other areas in the game are church interiors
                const churchArea = new GChurchArea();
                AREA.CHURCH_AREAS.push(churchArea);
                return churchArea;
        }
    }

    private static initStrongholdArea(context: any, refObj: RefFunction): GStrongholdArea {
        return new GStrongholdArea(
            context.name,
            context.bossIndex,
            refObj(context.region) as GStrongholdRegion,
            context.armorKey,
            context.width,
            context.height,
            context.groundFloor,
            new Array(context.numFloors).fill('') // Passes through the length of the array as numFloors
        );
    }

    private initTown(_context: any, _refObj: RefFunction): GTown {
        const town = new GTown();
        TOWN.addTown(town);
        return town;
    }

    private initChurch(context: any, refObj: RefFunction): GChurch {
        const church = new GChurch(refObj(context.town) as GTown);
        CHURCH.addChurch(church);
        return church;
    }

    private initStronghold(context: any, _refObj: RefFunction): GStronghold {
        switch (context.name) {
            case 'Tower of Deception':
                const tower = new GStrongholdTower();
                STRONGHOLD.addStronghold(tower);
                return tower;
            case 'Dungeon of Doubt':
                const dungeon = new GStrongholdDungeon();
                STRONGHOLD.addStronghold(dungeon);
                return dungeon;
            case 'Keep of Wickedness':
                const keep = new GStrongholdKeep();
                STRONGHOLD.addStronghold(keep);
                return keep;
            case 'Fortress of Enmity':
                const fortress = new GStrongholdFortress();
                STRONGHOLD.addStronghold(fortress);
                return fortress;
            case 'Castle of Perdition':
                const castle = new GStrongholdCastle();
                STRONGHOLD.addStronghold(castle);
                return castle;
        }
        throw new Error(`Unknown stronghold type: ${context.name}}`);
    }

    private initRoom(context: any, refObj: RefFunction): GRoom {
        return new GRoom(
            context.floor,
            context.x,
            context.y,
            refObj(context.area) as GArea,
        );
    }
}