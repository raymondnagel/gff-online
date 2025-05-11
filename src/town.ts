import { GTown } from "./GTown";

export namespace TOWN {

    export const TOWN_COUNT: number = 10;

    let towns: GTown[] = [];

    export function addTown(town: GTown) {
        towns.push(town);
    }

    export function getTowns(exceptTown?: GTown): GTown[] {
        if (exceptTown) {
            return towns.filter(town => town !== exceptTown);
        }
        return towns;
    }
}