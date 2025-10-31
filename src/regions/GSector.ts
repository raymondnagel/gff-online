import { GStrongholdArea } from "../areas/GStrongholdArea";
import { ARRAY } from "../array";
import { GRoom } from "../GRoom";
import { GColor } from "../types";

/**
 * GSector is like a lesser version of GRegion, giving us a way to
 * group rooms together within a stronghold (GRegion is already used
 * for the stronghold as a whole).
 *
 * The main purpose of a sector is to allow meaningful wall placement
 * (without making the stronghold maze-like), and to allow for "gates"
 * between sectors that can be used for locked doors.
 *
 * They need not be named or have any special properties.
 */
export class GSector {
    private center: GRoom;
    private rooms: GRoom[] = [];
    private connected: boolean = false;
    private color: GColor;

    public constructor(color: GColor) {
        this.color = color;
    }

    public getColor(): GColor {
        return this.color;
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

    public containsRoom(room: GRoom): boolean {
        return this.rooms.includes(room);
    }

    public connectExplicitly() {
        this.connected = true;
    }

    public isConnected(): boolean {
        return this.connected
    }

    public static mergeSectors(fromSector: GSector, toSector: GSector) {
        while (fromSector.getRooms().length > 0) {
            const room = fromSector.getRooms().pop() as GRoom;
            room.setSector(toSector);
        }
    }

    public static connectSectors(sectorA: GSector, sectorB: GSector) {
        if (sectorA.isConnected() || sectorB.isConnected()) {
            sectorA.connected = true;
            sectorB.connected = true;
        }
    }
}
