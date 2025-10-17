import { GStrongholdArea } from "../areas/GStrongholdArea";
import { GRoom } from "../GRoom";

export abstract class GStronghold {
    private name: string;
    private buildingKey: string;
    private worldRoom: GRoom;
    private interiorArea: GStrongholdArea;

    constructor(name: string, buildingKey: string, interiorArea: GStrongholdArea) {
        this.name = name;
        this.buildingKey = buildingKey;
        this.interiorArea = interiorArea;
    }

    public getName(): string {
        return this.name;
    }

    public getBuildingKey(): string {
        return this.buildingKey;
    }

    public setWorldRoom(room: GRoom) {
        this.worldRoom = room;
        GRoom.createPortal(this.worldRoom, this.interiorArea.getEntranceRoom());
    }

    public getWorldRoom(): GRoom {
        return this.worldRoom;
    }
}