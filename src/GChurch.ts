import { GChurchArea } from "./areas/GChurchArea";
import { GRoom } from "./GRoom";
import { GTown } from "./GTown";
import { GPerson } from "./types";

export class GChurch {
    private name: string;
    private town: GTown;
    private fruitNum: number|null = null;
    private people: GPerson[] = [];
    private worldRoom: GRoom;
    private interiorArea: GChurchArea;

    constructor(town: GTown, fruitNum: number|null) {
        this.name = `Church at ${town.getName()}`;
        this.town = town;
        this.fruitNum = fruitNum;
    }

    public getName(): string {
        return this.name;
    }

    public getTown(): GTown {
        return this.town;
    }

    public getFruitNum(): number|null {
        return this.fruitNum;
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

    public isEveryPersonMet(): boolean {
        return this.people.every(person => person.familiarity > 0);
    }

    public addPerson(person: GPerson) {
        // Adding a person to the church also converts them!
        person.faith = 100;
        person.nameLevel = 2;
        person.reprobate = false;
        this.people.push(person);
    }
}