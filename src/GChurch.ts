import { GChurchArea } from "./areas/GChurchArea";
import { GRoom } from "./GRoom";
import { GTown } from "./GTown";
import { GPerson } from "./types";

export class GChurch {
    private name: string;
    private town: GTown;
    private people: GPerson[] = [];
    private worldRoom: GRoom;
    private interiorArea: GChurchArea;

    constructor(town: GTown) {
        this.name = `Church at ${town.getName()}`;
        this.town = town;
    }

    public getName(): string {
        return this.name;
    }

    public getTown(): GTown {
        return this.town;
    }

    public setWorldRoom(room: GRoom) {
        this.worldRoom = room;
        GRoom.createPortal(this.worldRoom, this.interiorArea.getRoomAt(0, 0, 0) as GRoom);
    }

    public getWorldRoom(): GRoom {
        return this.worldRoom;
    }

    public setInteriorArea(area: GChurchArea) {
        this.interiorArea = area;
        this.interiorArea.setName(this.town.getName() + ' Church Building')
    }

    public getInteriorArea(): GChurchArea {
        return this.interiorArea;
    }

    public getPeople(): GPerson[] {
        return this.people;
    }

    public addPerson(person: GPerson) {
        this.people.push(person);
    }
}