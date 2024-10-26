import { GPerson } from "./types";

export namespace PEOPLE {
    let people: GPerson[] = [];
    let capturedPeople: GPerson[] = [];

    export function addPerson(person: GPerson) {
        people.push(person);
    }

    export function getPersons() {
        return people;
    }

    export function addCapturedPerson(person: GPerson) {
        capturedPeople.push(person);
    }

    export function getCapturedPersons() {
        return capturedPeople;
    }
}