import { encode as msgPackEncode, decode as msgPackDecode } from "@msgpack/msgpack";
import { AREA } from "./area";
import { GFF } from "./main";
import { GPerson, GSaveable, GSaveableInterface, GSpirit } from "./types";
import { GRoom } from "./GRoom";
import { ENEMY } from "./enemy";
import { PEOPLE } from "./people";
import { TOWN } from "./town";
import { CHURCH } from "./church";
import { STRONGHOLD } from "./stronghold";
import { REGISTRY } from "./registry";
import { IntegerStats, STATS } from "./stats";
import { PLAYER } from "./player";
import { FRUITS } from "./fruits";
import { COMMANDMENTS } from "./commandments";
import { ARMORS } from "./armors";
import { BOOKS } from "./books";

export type FullSaveData = {
    registry: {
        [key: string]: any;
    };
    player: any;
    fruits: any;
    commandments: any;
    armors: any;
    books: any;
    stats: IntegerStats;
    enemies: any;
    people: any;
    towns: any;
    churches: any;
    strongholds: any;
    rooms: any;
    areas: any;
    regions: any;
    sectors: any;
}

/**
 * The SAVE namespace contains procedures and logic for saving
 * and loading the game state.
 *
 * For saving, we will have already decided on a save method
 * and name before calling saveGame(), which performs the save
 * using the chosen method.
 *
 * For loading, we will have already obtained the save data
 * (from a file upload or IndexedDB), and the actual loading
 * process is performed in the Load Game mode using the save
 * data stored in the registry.
 */
export namespace SAVE {
    /**
     * The method of saving and the name of the save file are
     * already determined by the UI before this function is called.
     */
    export function saveGame(saveName: string, downloadFile: boolean = true) {
        /**
         * Step 1: Gather all data collections to be saved
         */
        const enemies = ENEMY.getSpirits();
        const people = PEOPLE.getPersons();
        const towns = TOWN.getTowns();
        const churches = CHURCH.getChurches();
        const strongholds = STRONGHOLD.getStrongholds();
        const rooms = [
            ...AREA.WORLD_AREA.getRooms(),
            ...AREA.TOWER_AREA.getRooms(),
            ...AREA.DUNGEON_AREA.getRooms(),
            ...AREA.KEEP_AREA.getRooms(),
            ...AREA.FORTRESS_AREA.getRooms(),
            ...AREA.CASTLE_AREA.getRooms(),
            ...AREA.CHURCH_AREAS.flatMap(area => area.getRooms()),
        ];
        const areas = [
            AREA.WORLD_AREA,
            AREA.TOWER_AREA,
            AREA.DUNGEON_AREA,
            AREA.KEEP_AREA,
            AREA.FORTRESS_AREA,
            AREA.CASTLE_AREA,
            ...AREA.CHURCH_AREAS,
        ];
        const regions = Array.from(new Set(rooms.map(room => room.getRegion())));
        const sectors = Array.from(new Set(rooms.map(room => room.getSector()).filter(sector => sector !== null)));

        /**
         * Step 2: Register IDs for all objects to be saved
         */
        const idRegistry = new Map<any, number>();

        idArray(enemies, idRegistry);
        idArray(people, idRegistry);
        idArray(towns, idRegistry);
        idArray(churches, idRegistry);
        idArray(strongholds, idRegistry);
        idArray(rooms, idRegistry);
        idArray(areas, idRegistry);
        idArray(regions, idRegistry);
        idArray(sectors, idRegistry);

        /**
         * Step 3: Create save data objects, replacing references with IDs
         */
        const enemiesData = saveArray(enemies, idRegistry);
        const peopleData = saveArray(people, idRegistry);
        const townsData = saveArray(towns, idRegistry);
        const churchesData = saveArray(churches, idRegistry);
        const strongholdsData = saveArray(strongholds, idRegistry);
        const roomsData = saveArray(rooms, idRegistry);
        const areasData = saveArray(areas, idRegistry);
        const regionsData = saveArray(regions, idRegistry);
        const sectorsData = saveArray(sectors, idRegistry);

        /**
         * Step 4: Save additional data
         * (simple data that isn't ID'd, but may reference ID'd objects)
         */
        const registryData = REGISTRY.getAll();
        const statsData = STATS.toSaveObject();
        const playerData = PLAYER.toSaveObject(idRegistry);
        const fruitsData = FRUITS.toSaveObject();
        const commandmentsData = COMMANDMENTS.toSaveObject();
        const armorsData = ARMORS.toSaveObject();
        const booksData = BOOKS.toSaveObject();

        /**
         * Step 5: Combine into full save data object
         */
        const fullSaveData: FullSaveData = {
            "registry": registryData,
            "player": playerData,
            "fruits": fruitsData,
            "commandments": commandmentsData,
            "armors": armorsData,
            "books": booksData,
            "stats": statsData,
            "enemies": enemiesData,
            "people": peopleData,
            "towns": townsData,
            "churches": churchesData,
            "strongholds": strongholdsData,
            "rooms": roomsData,
            "areas": areasData,
            "regions": regionsData,
            "sectors": sectorsData,
        };

        /**
         * Step 6: Convert to bytes
         */
        // const bytes = new TextEncoder().encode(JSON.stringify(fullSaveData)); // Plain text JSON
        const bytes = msgPackEncode(fullSaveData); // MessagePack binary format

        /**
         * Step 7: Perform the save action
         * Initially, only "Export" (download file) is supported.
         */
        if (downloadFile) {
            downloadSaveFile(bytes, `${saveName}.gffsave`);
        } else {
            saveToIndexedDb(saveName, bytes);
        }

        /**
         * Step 8: Play a sound to indicate the game was saved
         */
        GFF.AdventureContent.getSound().playSound('success');
    }

    /**
     * Test function to decode the loaded save data and then re-save it
     * as plain-text JSON (not MessagePack) to verify that save and load
     * are working correctly and that we can restore all data.
     */
    export function resaveLoadedGameData() {
        const fullSaveData: FullSaveData = decodeLoadedSaveData();
        const bytes = new TextEncoder().encode(JSON.stringify(fullSaveData));
        downloadSaveFile(bytes, 'plain_resave.gffsave');
    }

    /**
     * Look up the ID for a given object from the idRegistry.
     * If the object is null or undefined, return it in place of an ID.
     * (This allows us to call idFor on optional objects without extra checks.)
     */
    export function idFor(obj: GSaveable|GSaveableInterface|null|undefined, idRegistry: Map<any, number>): string|null|undefined {
        if (obj === null || obj === undefined) {
            return obj;
        }
        const id = idRegistry.get(obj);
        if (id === undefined) {
            // When this line is hit, it stops execution; but at least we get a log message
            // so we can investigate what is missing.
            GFF.log(`No ID found for object: ${JSON.stringify(obj)}`, true);
            return null;
        } else {
            return `#${id}`;
        }
    }

    function idArray(objects: GSaveable[]|GSaveableInterface[], idRegistry: Map<any, number>) {
        objects.forEach(obj => {
            idObject(obj, idRegistry);
        });
    }

    function idObject(obj: GSaveable|GSaveableInterface, idRegistry: Map<any, number>) {
        if (!idRegistry.has(obj)) {
            idRegistry.set(obj, idRegistry.size);
        }
    }

    function saveArray(objects: GSaveable[]|GSaveableInterface[], idRegistry: Map<any, number>): any {
        return objects.map(obj => {
            return saveObject(obj, idRegistry);
        });
    }

    function saveObject(obj: GSaveable|GSaveableInterface, idRegistry: Map<any, number>): any {
        // Most objects are GSaveable and can just call toSaveObject()
        if (isGSaveable(obj)) {
            return {
                "id": idRegistry.get(obj),
                "data": obj.toSaveObject(idRegistry),
            };
        // Other objects (like GPerson and GSpirit) are GSaveableInterface,
        // so we need to call the appropriate save function for their type
        } else if ('type' in obj) {
            return {
                "id": idRegistry.get(obj),
                "data": ENEMY.toSaveObject(obj as GSpirit, idRegistry),
            };
        } else if ('spriteKeyPrefix' in obj) {
            return {
                "id": idRegistry.get(obj),
                "data": PEOPLE.toSaveObject(obj as GPerson, idRegistry),
            };
        }
    }

    function isGSaveable(x: unknown): x is GSaveable {
        return (
            typeof x === "object" &&
            x !== null &&
            "toSaveObject" in x &&
            typeof (x as any).toSaveObject === "function"
        );
    }

    // Called from saveGame() if doing an export save (download file)
    function downloadSaveFile(bytes: Uint8Array, fileName: string) {
        // Copy into a fresh ArrayBuffer so TS knows it's not SharedArrayBuffer
        const copy = new Uint8Array(bytes.byteLength);
        copy.set(bytes);

        const blob = new Blob([copy.buffer], { type: "application/octet-stream" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();

        URL.revokeObjectURL(url);
    }

    // Called from saveGame() if doing a regular save (to IndexedDB)
    function saveToIndexedDb(_saveName: string, _bytes: Uint8Array) {
        console.log('Saving to IndexedDB is not yet implemented.');
    }

    // Called from Main Menu when continuing a saved game; save slot already chosen in UI
    export function loadFromIndexedDb(_saveSlot: number) {
        console.log('Loading from IndexedDB is not yet implemented.');
        /**
         * This will get the loaded save data from IndexedDB
         * and put in the REGISTRY, similar to uploadSaveFile().
         *
         * Then, the Load Game mode can proceed to load the game
         * from the save data in the REGISTRY.
         */
    }

    // Called from Main Menu when continuing a saved game; file already chosen in UI
    export function uploadSaveFile(_filePath: string) {
        console.log('Uploading a save file is not yet implemented.');
        /**
         * This will get the loaded save data from a file upload
         * and put in the REGISTRY, similar to loadFromIndexedDb().
         *
         * Then, the Load Game mode can proceed to load the game
         * from the save data in the REGISTRY.
         */
    }

    export function decodeLoadedSaveData(): FullSaveData {
        const saveData: Uint8Array = REGISTRY.get('loadedSaveData');
        return msgPackDecode(saveData) as FullSaveData;
    }
}