import { GTown } from "./GTown";
import { STATS } from "./stats";

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

    export function getDiscoveredTowns(): GTown[] {
        return getTowns().filter(town => town.getRooms().some(room => room.isDiscovered()));
    }

    export function getFlightsAvailable(): number {
        // We'll unlock one flight from the start, plus an additional one for every 25 rooms explored:
        const discoveredRooms: number = STATS.getIntegerStat('RoomsExplored');
        return Math.floor(discoveredRooms / 25) + 1;
    }

    export function scheduleFlights(towns: GTown[]) {
        const n = towns.length;
        const townIndices = towns.map((_, i) => i);
        const fixed = townIndices[0];
        const rotating = townIndices.slice(1); // all except the first town

        for (let round = 0; round < n - 1; round++) {
            const pairings: [number, number][] = [];

            // First pairing always includes the fixed town
            pairings.push([fixed, rotating[rotating.length - 1]]);

            for (let i = 0; i < (n / 2) - 1; i++) {
                pairings.push([rotating[i], rotating[rotating.length - 2 - i]]);
            }

            // Add flights reciprocally at the same index in the flight list
            for (const [aIdx, bIdx] of pairings) {
                towns[aIdx].addFlight(towns[bIdx]);
                towns[bIdx].addFlight(towns[aIdx]);
            }

            // Rotate the rotating array
            rotating.unshift(rotating.pop()!);
        }
    }
}