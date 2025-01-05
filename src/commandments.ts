import { GLOSSARY } from "./glossary";
import { GRandom } from "./GRandom";
import { GGlossaryEntry } from "./types";

type Ten = 1|2|3|4|5|6|7|8|9|10;

export namespace COMMANDMENTS {

    // List of books left to find. Next book is popped off the list.
    let commandmentsToFind: Ten[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    let commandments: boolean[] = [
        false, false, false, false, false, false, false, false, false, false
    ];

    export function initCommandments() {
        shuffleCommandmentsToFind();
    }

    export function lookupEntry(num: Ten): GGlossaryEntry {
        return GLOSSARY.lookupEntry(`cmd_${num}`) as GGlossaryEntry;
    }

    export function setCommandment(num: Ten, has: boolean) {
        commandments[num - 1] = has;
    }

    export function hasCommandment(index: number): boolean {
        return commandments[index];
    }

    export function getCount(): number {
        return 10;//mmandments.reduce((count, value) => count + (value ? 1 : 0), 0);
    }

    export function shuffleCommandmentsToFind() {
        GRandom.shuffle(commandmentsToFind);
    }

    export function getNextCommandmentToFind(): string|undefined {
        const cmdNum: Ten|undefined = commandmentsToFind.pop();
        return cmdNum === undefined
            ? undefined
            : `cmd_${cmdNum}`;
    }
}