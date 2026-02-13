import { GStrongholdArea } from "../areas/GStrongholdArea";
import { GRoom } from "../GRoom";
import { SAVE } from "../save";
import { RefFunction } from "../scenes/GLoadGameContent";
import { GSaveable } from "../types";

export abstract class GStronghold implements GSaveable {
    private name: string;
    private index: number;
    private buildingKey: string;
    private worldRoom: GRoom;
    private interiorArea: GStrongholdArea;

    constructor(name: string, index: number, buildingKey: string) {
        this.name = name;
        this.index = index;
        this.buildingKey = buildingKey;
    }

    public setInteriorArea(interiorArea: GStrongholdArea) {
        this.interiorArea = interiorArea;
        this.interiorArea.setStrongholdIndex(this.index);
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

    public abstract getStoneTint(): number;

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

    public toSaveObject(ids: Map<any, number>): object {
        return {
            name: this.name,
            index: this.index,
            buildingKey: this.buildingKey,
            worldRoom: SAVE.idFor(this.worldRoom, ids),
            interiorArea: SAVE.idFor(this.interiorArea, ids),
        };
    }

    public hydrateLoadedObject(context: any, refObj: RefFunction): void {
        this.name = context.name;
        this.index = context.index;
        this.buildingKey = context.buildingKey;
        this.worldRoom = refObj(context.worldRoom);
        this.interiorArea = refObj(context.interiorArea);
    }
}