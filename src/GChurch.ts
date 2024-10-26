import { GRoom } from "./GRoom";
import { GTown } from "./GTown";
import { GPerson } from "./types";

export class GChurch {
    private name: string;
    private town: GTown;
    private people: GPerson[] = [];
    private worldRoom: GRoom;

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
    }

    public getWorldRoom(): GRoom {
        return this.worldRoom;
    }

    public getPeople(): GPerson[] {
        return this.people;
    }

    public addPerson(person: GPerson) {
        this.people.push(person);
    }
}