import { GStrongholdArea } from "../areas/GStrongholdArea";
import { GRoom } from "../GRoom";

export abstract class GStronghold {
    private name: string;
    private index: number;
    private buildingKey: string;
    private worldRoom: GRoom;
    private interiorArea: GStrongholdArea;

    constructor(name: string, index: number, buildingKey: string, interiorArea: GStrongholdArea) {
        this.name = name;
        this.index = index;
        this.buildingKey = buildingKey;
        this.interiorArea = interiorArea;
        this.interiorArea.setStrongholdIndex(index);
    }

    public getName(): string {
        return this.name;
    }

    public getBuildingKey(): string {
        return this.buildingKey;
    }

    public getIndex(): number {
        return this.index;
    }

    public abstract getProphetThemeText(): string;
    public abstract getProphetArmourText(): string;
    public abstract getProphetBossText(): string;

    public setWorldRoom(room: GRoom) {
        this.worldRoom = room;
        GRoom.createPortal(this.worldRoom, this.interiorArea.getEntranceRoom());
    }

    public getWorldRoom(): GRoom {
        return this.worldRoom;
    }
}