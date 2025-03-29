import { GLOSSARY } from "./glossary";
import { PLAYER } from "./player";
import { RANDOM } from "./random";
import { GGlossaryEntry } from "./types";

type Six = 1|2|3|4|5|6;

export namespace ARMORS {

    let armors: boolean[] = [
        false, false, false, false, false, false
    ];

    export function lookupEntry(num: Six): GGlossaryEntry {
        return GLOSSARY.lookupEntry(`armor_${num}`) as GGlossaryEntry;
    }

    export function setArmor(num: Six, has: boolean) {
        armors[num - 1] = has;
        PLAYER.calcMaxFaith();
    }

    export function hasArmor(index: number): boolean {
        return armors[index];
    }

    export function getCount(): number {
        return armors.reduce((count, value) => count + (value ? 1 : 0), 0);
    }
}