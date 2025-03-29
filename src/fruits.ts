import { GLOSSARY } from "./glossary";
import { PLAYER } from "./player";
import { RANDOM } from "./random";
import { GGlossaryEntry } from "./types";

type Nine = 1|2|3|4|5|6|7|8|9;

export namespace FRUITS {

    // List of fruits left to find. Next fruit is popped off the list.
    let fruitsToFind: Nine[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    let fruits: boolean[] = [
        false, false, false, false, false, false, false, false, false, false
    ];

    export function initFruits() {
        shuffleFruitsToFind();
    }

    export function lookupEntry(num: Nine): GGlossaryEntry {
        return GLOSSARY.lookupEntry(`fruit_${num}`) as GGlossaryEntry;
    }

    export function setFruit(num: Nine, has: boolean) {
        fruits[num - 1] = has;
        PLAYER.calcMaxFaith();
    }

    export function hasFruit(index: number): boolean {
        return fruits[index];
    }

    export function getCount(): number {
        return fruits.reduce((count, value) => count + (value ? 1 : 0), 0);
    }

    export function shuffleFruitsToFind() {
        RANDOM.shuffle(fruitsToFind);
    }

    export function getNextFruitToFind(): string|undefined {
        const fruitNum: Nine|undefined = fruitsToFind.pop();
        return fruitNum === undefined
            ? undefined
            : `fruit_${fruitNum}`;
    }
}