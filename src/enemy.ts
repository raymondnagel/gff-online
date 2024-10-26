import { GFF } from "./main";
import { GCharSprite } from "./objects/chars/GCharSprite";
import { GPlayerSprite } from "./objects/chars/GPlayerSprite";
import { PLAYER } from "./player";
import { GSpirit } from "./types";

const REL_XP_DEC_PER_LEVEL: number = .3;

export namespace ENEMY {
    let imps: GSpirit[] = [];
    let maxResistance: number = 50;
    let resistance: number = 50;
    let portrait: string;
    let avatar: string;
    let spirit: GSpirit;
    let sprite: GCharSprite;

    export function getXpValue(): number {
        /**
         * This formula ensures several things:
         * 1. Getting to level 1 requires defeating five level 0 enemies
         * 2. The number of equal-level enemies to defeat increases slowly and smoothly
         * 3. Reaching max level will required defeating no more than 20 equal-level enemies
         * 4. Algorithm in PLAYER.getXpNeededAtLevel can be adjusted without affecting the above.
         */
        const enemyLevel = spirit.level;
        return PLAYER.getXpNeededAtLevel(enemyLevel) / (5 + (enemyLevel * REL_XP_DEC_PER_LEVEL));
    }

    export function getResistance(): number {
        return resistance;
    }

    export function setResistance(amount: number) {
        resistance = amount;
    }

    export function changeResistance(byAmount: number) {
        resistance += byAmount;
        if (resistance > maxResistance) {
            resistance = maxResistance;
        }
    }

    export function getMaxResistance(): number {
        return maxResistance;
    }

    export function setMaxResistance(amount: number) {
        maxResistance = amount;
    }

    export function changeMaxResistance(byAmount: number) {
        maxResistance += byAmount;
    }

    export function getBaseDamage() {
        return GFF.Difficulty.enemyBaseAttack + (GFF.Difficulty.enemyAttackPerLevel * spirit.level);
    }

    export function getSpirit(): GSpirit {
        return spirit;
    }

    export function getPortrait(): string {
        return portrait;
    }

    export function getAvatar(): string {
        return avatar;
    }

    export function getSprite(): GCharSprite {
        return sprite;
    }

    export function init(enemy: GCharSprite, enemySpirit: GSpirit, enemyPortrait: string, enemyAvatar: string) {
        sprite = enemy;
        spirit = enemySpirit;
        portrait = enemyPortrait;
        avatar = enemyAvatar;
        setMaxResistance(GFF.Difficulty.enemyBaseResist + (GFF.Difficulty.enemyResistPerLevel * enemySpirit.level));
        setResistance(getMaxResistance());
    }

    export function addImp(impSpirit: GSpirit) {
        imps.push(impSpirit);
    }

    export function getImps(): GSpirit[] {
        return imps;
    }
}