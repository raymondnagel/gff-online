import { GRoom } from "../GRoom";
import { Dir9, GSceneryDef } from "../types";

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
export abstract class GRegion {
    private name: string;
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
        this.bgImage = bgImageName;
        this.encBgImage = encBgImageName;
        this.terrainImage = terrainImageName;
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

        // Temporarily disable scenery planning for town rooms
        if (room.getTown() === null) {
            this._furnishRoom(room);
        }
    }

    protected abstract _furnishRoom(room: GRoom): void;

    public abstract isInterior(): boolean;

    public abstract getTemperature(): number;

    public abstract getWalls(): Record<Dir9, GSceneryDef|null>;
}
