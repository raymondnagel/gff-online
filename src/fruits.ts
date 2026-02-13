import { GQueue } from "./data/GQueue";
import { GChurch } from "./GChurch";
import { GLOSSARY } from "./glossary";
import { PLAYER } from "./player";
import { GGlossaryEntry, NINE } from "./types";

export namespace FRUITS {

    const fruitsQueue: GQueue<NINE> = new GQueue<NINE>();

    let fruits: boolean[] = [
        false, false, false, false, false, false, false, false, false, false
    ];

    export function toSaveObject(): any {
        return fruits;
    }

    export function fromSaveData(saveData: any) {
        for (let i = 0; i < fruits.length; i++) {
            fruits[i] = saveData[i] || false;
        }
    }

    export function lookupEntry(num: NINE): GGlossaryEntry {
        return GLOSSARY.lookupEntry(`fruit_${num}`) as GGlossaryEntry;
    }

    export function obtainFruit(num: NINE) {
        fruits[num - 1] = true;
        PLAYER.calcMaxFaith();
        PLAYER.giveGrace('major');
    }

    export function hasFruit(num: NINE): boolean {
        return fruits[num - 1];
    }

    export function getCount(): number {
        return fruits.reduce((count, value) => count + (value ? 1 : 0), 0);
    }

    export function hasFruitOfChurch(town: GChurch): boolean {
        const fruitNum = town.getFruitNum();
        if (fruitNum === null) {
            return true;
        }
        return hasFruit(fruitNum as NINE);
    }

    export function isFruitQueued(num: NINE): boolean {
        return fruitsQueue.contains(num)
    }

    export function queueFruit(num: NINE): void {
        if (!isFruitQueued(num)) {
            fruitsQueue.enqueue(num);
        }
    }

    export function dequeueFruit(): NINE|undefined {
        return fruitsQueue.dequeue();
    }
}