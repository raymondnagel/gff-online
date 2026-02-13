import { GLOSSARY } from "./glossary";
import { PLAYER } from "./player";
import { RANDOM } from "./random";
import { GGlossaryEntry, TEN } from "./types";


export namespace COMMANDMENTS {

    // List of commandments left to find. Next commandment is popped off the list.
    let commandmentsToFind: TEN[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    let commandments: boolean[] = [
        false, false, false, false, false, false, false, false, false, false
    ];

    export function initCommandments() {
        shuffleCommandmentsToFind();
    }

    export function toSaveObject(): any {
        return commandments;
    }

    export function fromSaveData(saveData: any) {
        for (let i = 0; i < commandments.length; i++) {
            commandments[i] = saveData[i] || false;
        }
    }

    export function lookupEntry(num: TEN): GGlossaryEntry {
        return GLOSSARY.lookupEntry(`cmd_${num}`) as GGlossaryEntry;
    }

    export function obtainCommandment(num: TEN) {
        commandments[num - 1] = true;
        PLAYER.calcMaxFaith();
        PLAYER.giveGrace('major');
    }

    export function hasCommandment(index: number): boolean {
        return commandments[index];
    }

    export function getCount(): number {
        return commandments.reduce((count, value) => count + (value ? 1 : 0), 0);
    }

    export function shuffleCommandmentsToFind() {
        RANDOM.shuffle(commandmentsToFind);
    }

    export function getNextCommandmentToFind(): string|undefined {
        const cmdNum: TEN|undefined = commandmentsToFind.pop();
        return cmdNum === undefined
            ? undefined
            : `cmd_${cmdNum}`;
    }
}