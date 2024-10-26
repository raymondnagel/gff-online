import { GTown } from "./GTown";

export namespace TOWN {
    let towns: GTown[] = [];

    export function addTown(town: GTown) {
        towns.push(town);
    }

    export function getTowns() {
        return towns;
    }
}