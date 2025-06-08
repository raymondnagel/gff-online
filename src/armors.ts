import { GLOSSARY } from "./glossary";
import { PLAYER } from "./player";
import { RANDOM } from "./random";
import { GGlossaryEntry } from "./types";

type Six = 1|2|3|4|5|6;

export namespace ARMORS {

    /**
     * Unlike the other collectibles, armors are not shuffled.
     * Each armor is always found in the associated stronghold:
     * - Tower of Deception  (Girdle of Truth)
     * - Dungeon of Doubt    (Shield of Faith)
     * - Keep of Wickedness  (Breastplate of Righteousness)
     * - Fortress of Enmity  (Preparation of Peace)
     * - Castle of Perdition (Helmet of Salvation)
     */

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