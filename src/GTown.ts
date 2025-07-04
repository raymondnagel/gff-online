import { GChurch } from "./GChurch";
import { RANDOM } from "./random";
import { GRoom } from "./GRoom";
import { GPerson } from "./types";

const TOWN_NAMES: string[] = [
    'Ephesus',
    'Smyrna',
    'Pergamos',
    'Thyatira',
    'Sardis',
    'Philadelphia',
    'Laodicea',
    'Jerusalem',
    'Rome',
    'Corinth',
    'Colosse',
    'Philippi',
    'Thessalonica',
    'Berea',
    'Antioch',
    'Babylon',
    'Iconium',
    'Lystra',
    'Derbe'
];

export class GTown {
    private name: string;
    private rooms: GRoom[] = [];
    private church: GChurch;
    private travelAgencyLocation: GRoom;
    private flights: GTown[] = [];
    private people: GPerson[] = [];

    static {
        RANDOM.shuffle(TOWN_NAMES);
    }

    constructor() {
        this.name = TOWN_NAMES.pop() as string;
    }

    public getName() {
        return this.name;
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
}