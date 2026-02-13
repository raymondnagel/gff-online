import { GChurch } from "./GChurch";
import { RANDOM } from "./random";
import { GRoom } from "./GRoom";
import { GPerson, GSaveable } from "./types";
import { SAVE } from "./save";
import { RefFunction } from "./scenes/GLoadGameContent";

const TOWNS = [
    { name: "Antioch", adjective: "Antiochene" },
    { name: "Babylon", adjective: "Babylonian" },
    { name: "Berea", adjective: "Berean" },
    { name: "Cenchrea", adjective: "Cenchrean" },
    { name: "Colosse", adjective: "Colossian" },
    { name: "Corinth", adjective: "Corinthian" },
    { name: "Derbe", adjective: "Derbean" },
    { name: "Ephesus", adjective: "Ephesian" },
    { name: "Iconium", adjective: "Iconian" },
    { name: "Jerusalem", adjective: "Jerusalemite" },
    { name: "Laodicea", adjective: "Laodicean" },
    { name: "Lystra", adjective: "Lystran" },
    { name: "Pergamos", adjective: "Pergamene" },
    { name: "Philadelphia", adjective: "Philadelphian" },
    { name: "Philippi", adjective: "Philippian" },
    { name: "Rome", adjective: "Roman" },
    { name: "Sardis", adjective: "Sardian" },
    { name: "Smyrna", adjective: "Smyrnan" },
    { name: "Thessalonica", adjective: "Thessalonian" },
    { name: "Thyatira", adjective: "Thyatiran" },
];

export class GTown implements GSaveable {
    private name: string;
    private adjective: string;
    private rooms: GRoom[] = [];
    private church: GChurch;
    private travelAgencyLocation: GRoom;
    private flights: GTown[] = [];
    private people: GPerson[] = [];

    static {
        RANDOM.shuffle(TOWNS);
    }

    constructor() {
        const town = TOWNS.pop() as { name: string; adjective: string };
        this.name = town.name;
        this.adjective = town.adjective;
    }

    public getName() {
        return this.name;
    }

    public getAdjective() {
        return this.adjective;
    }

    public getFullName() {
        if (this.rooms.length <= 3) {
            return `Hamlet of ${this.name}`;
        }
        if (this.rooms.length <= 4) {
            return `Village of ${this.name}`;
        }
        if (this.rooms.length <= 5) {
            return `Town of ${this.name}`;
        }
        return `City of ${this.name}`;
    }

    public setChurch(church: GChurch) {
        this.church = church;
    }

    public getChurch(): GChurch {
        return this.church;
    }

    public setTravelAgencyLocation(room: GRoom) {
        this.travelAgencyLocation = room;
    }

    public getTravelAgencyLocation(): GRoom {
        return this.travelAgencyLocation;
    }

    public addFlight(destinationTown: GTown) {
        this.flights.push(destinationTown);
    }

    public getFlights(): GTown[] {
        return this.flights;
    }

    public addRoom(room: GRoom) {
        this.rooms.push(room);
    }

    public getRooms(): GRoom[] {
        return this.rooms;
    }

    public getPeople(): GPerson[] {
        return this.people;
    }

    public addPerson(person: GPerson) {
        this.people.push(person);
        person.homeTown = this;
    }

    public transferPersonToChurch(person: GPerson): boolean {
        const index: number = this.people.indexOf(person);
        if (index !== -1) {
            this.people.splice(index, 1);
            this.church.addPerson(person);
            return true;
        }
        return false;
    }

    public transferAnyoneToChurch() {
        this.church.addPerson(this.people.pop() as GPerson);
    }

    public toSaveObject(ids: Map<any, number>): object {
        return {
            name: this.name,
            adjective: this.adjective,
            rooms: this.getRooms().map(r => SAVE.idFor(r, ids)),
            church: SAVE.idFor(this.church, ids),
            travelAgencyLocation: SAVE.idFor(this.travelAgencyLocation, ids),
            flights: this.flights.map(f => SAVE.idFor(f, ids)),
            people: this.people.map(p => SAVE.idFor(p, ids)),
        };
    }

    public hydrateLoadedObject(context: any, refObj: RefFunction): void {
        this.name = context.name;
        this.adjective = context.adjective;
        this.rooms = context.rooms.map((id: string) => refObj(id));
        this.church = refObj(context.church);
        this.travelAgencyLocation = refObj(context.travelAgencyLocation);
        this.flights = context.flights.map((id: string) => refObj(id));
        this.people = context.people.map((id: string) => refObj(id));
    }
}