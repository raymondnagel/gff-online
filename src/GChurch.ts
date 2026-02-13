import { GChurchArea } from "./areas/GChurchArea";
import { GRoom } from "./GRoom";
import { GTown } from "./GTown";
import { SAVE } from "./save";
import { RefFunction } from "./scenes/GLoadGameContent";
import { GPerson, GSaveable } from "./types";

export class GChurch implements GSaveable {
    private name: string;
    private town: GTown;
    private fruitNum: number|null = null;
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

    public setFruitNum(num: number|null) {
        this.fruitNum = num;
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
        this.interiorArea.setName(this.town.getName() + ' Church Building');
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

    public toSaveObject(ids: Map<any, number>): object {
        return {
            name: this.name,
            town: SAVE.idFor(this.town, ids),
            fruitNum: this.fruitNum,
            worldRoom: SAVE.idFor(this.worldRoom, ids),
            interiorArea: SAVE.idFor(this.interiorArea, ids),
            people: this.people.map(p => SAVE.idFor(p, ids)),
        };
    }

    public hydrateLoadedObject(context: any, refObj: RefFunction): void {
        this.name = context.name;
        this.town = refObj(context.town);
        this.fruitNum = context.fruitNum;
        this.worldRoom = refObj(context.worldRoom);
        this.people = context.people.map((id: string) => refObj(id));
        this.setInteriorArea(refObj(context.interiorArea));
    }
}