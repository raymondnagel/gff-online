import { GRoom } from "../GRoom";
import { SAVE } from "../save";
import { RefFunction } from "../scenes/GLoadGameContent";
import { STRING } from "../string";
import { GSaveable } from "../types";

/**
 * GRegion represents part of a GArea that should
 * be treated as a special section. The region is
 * added to rooms as a property; sharing the same
 * region makes rooms part of that region. Smaller
 * areas, such as the inside of buildings, contain
 * only one region.
 *
 * For example, a region might be 'Town of Ephesus', which may have
 * custom generation algorithms for scenery, as well as trigger
 * things when the region is first entered:
 * - set background image based on region
 * - show region title upon arrival to the region
 */
export abstract class GRegion implements GSaveable {
    private name: string;
    private fullName: string;
    private bgImage: string;
    private encBgImage: string;
    private terrainImage: string;
    private center: GRoom;
    private rooms: GRoom[] = [];

    protected constructor(
        regionName: string,
        bgImageName: string,
        encBgImageName: string,
        terrainImageName: string
    ) {
        this.name = regionName;
        this.fullName = STRING.capitalize(regionName);
        this.bgImage = bgImageName;
        this.encBgImage = encBgImageName;
        this.terrainImage = terrainImageName;
    }

    public setFullName(fullName: string) {
        this.fullName = fullName;
    }

    public getFullName(): string {
        return this.fullName;
    }

    public getName(): string {
        return this.name;
    }

    public getBgImageName(): string {
        return this.bgImage;
    }

    public getEncBgImageName(): string {
        return this.encBgImage;
    }

    public getMapTerrain(): string {
        return this.terrainImage;
    }

    public setCenter(room: GRoom) {
        this.center = room;
        this.rooms.push(room);
    }

    public getCenter(): GRoom {
        return this.center;
    }

    public addRoom(room: GRoom) {
        this.rooms.push(room);
    }

    public getRooms(): GRoom[] {
        return this.rooms;
    }

    public furnishRoom(room: GRoom) {
        // Add things that aren't dependent on the region type
        if (room.getChurch() !== null) {
            room.planChurch();
        }

        if (room.getStronghold() !== null) {
            room.planStronghold();
        }

        const addInternalObjects =
            room.getChurch() === null
            && room.getTown() === null
            && room.getStronghold() === null;

        // Now call the region-specific furnishing method
        this._furnishRoom(room, true, addInternalObjects);

        // Room furnishing is done; but some plans may require post-processing
        room.finalizeSceneryPlans();
    }

    protected abstract _furnishRoom(room: GRoom, partialWalls?: boolean, internalObjects?: boolean): void;

    public abstract isInterior(): boolean;

    public abstract getTemperature(): number;

    public toSaveObject(ids: Map<any, number>): object {
        return {
            name: this.name,
            fullName: this.fullName,
            bgImage: this.bgImage,
            encBgImage: this.encBgImage,
            terrainImage: this.terrainImage,
            center: SAVE.idFor(this.center, ids),
            rooms: this.rooms.map(r => SAVE.idFor(r, ids)),
        };
    }

    public hydrateLoadedObject(context: any, refObj: RefFunction): void {
        this.fullName = context.fullName; // A full name was set by the constructor, but it's not the full name we want
        this.center = refObj(context.center) as GRoom;
        this.rooms = context.rooms.map((id: number) => refObj(id) as GRoom);
    }
}
