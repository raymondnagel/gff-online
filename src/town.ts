import { GTown } from "./GTown";

export namespace TOWN {

    export const TOWN_COUNT: number = 10;

    let towns: GTown[] = [];

    export function addTown(town: GTown) {
        towns.push(town);
    }

    export function getTowns() {
        return towns;
    }
}