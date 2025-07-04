import { GLOSSARY } from "./glossary";
import { PLAYER } from "./player";
import { GGlossaryEntry, SIX } from "./types";


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

    export function lookupEntry(num: SIX): GGlossaryEntry {
        return GLOSSARY.lookupEntry(`armor_${num}`) as GGlossaryEntry;
    }

    export function obtainArmor(num: SIX) {
        armors[num - 1] = true;
        PLAYER.calcMaxFaith();
        PLAYER.giveGrace('major');
    }

    export function hasArmor(index: number): boolean {
        return armors[index];
    }

    export function getCount(): number {
        return armors.reduce((count, value) => count + (value ? 1 : 0), 0);
    }
}