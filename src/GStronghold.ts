import { GRoom } from "./GRoom";

export class GStronghold {
    private name: string;
    private worldRoom: GRoom;

    constructor(name: string) {
        this.name = name;
    }

    public getName(): string {
        return this.name;
    }

    public setWorldRoom(room: GRoom) {
        this.worldRoom = room;
    }

    public getWorldRoom(): GRoom {
        return this.worldRoom;
    }
}