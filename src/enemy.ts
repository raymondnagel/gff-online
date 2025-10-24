import { GFF } from "./main";
import { GEnemySprite } from "./objects/chars/GEnemySprite";
import { PLAYER } from "./player";
import { GSpirit } from "./types";

const REL_XP_DEC_PER_LEVEL: number = .3;

export namespace ENEMY {
    let spirits: GSpirit[] = [];
    let maxResistance: number = 50;
    let resistance: number = 50;
    let portrait: string;
    let avatar: string;
    let spirit: GSpirit;
    let sprite: GEnemySprite;

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
        return GFF.getDifficulty().enemyBaseAttack + (GFF.getDifficulty().enemyAttackPerLevel * spirit.level);
    }

    export function getCurrentSpirit(): GSpirit {
        return spirit;
    }

    export function getPortrait(): string {
        return portrait;
    }

    export function getAvatar(): string {
        return avatar;
    }

    export function getSprite(): GEnemySprite {
        return sprite;
    }

    export function init(enemy: GEnemySprite, enemySpirit: GSpirit, enemyPortrait: string, enemyAvatar: string) {
        sprite = enemy;
        spirit = enemySpirit;
        portrait = enemyPortrait;
        avatar = enemyAvatar;
        setMaxResistance(GFF.getDifficulty().enemyBaseResist + (GFF.getDifficulty().enemyResistPerLevel * enemySpirit.level));
        setResistance(getMaxResistance());
    }

    export function levelUp() {
        spirit.level = Math.min(50, spirit.level + 1);
    }

    export function addSpirit(spirit: GSpirit) {
        spirits.push(spirit);
    }

    export function getSpirits(): GSpirit[] {
        return spirits;
    }
}