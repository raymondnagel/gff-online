import { GFF } from "./main";
import { GEnemySprite } from "./objects/chars/GEnemySprite";
import { PLAYER } from "./player";
import { RANDOM } from "./random";
import { RefFunction } from "./scenes/GLoadGameContent";
import { GSpirit } from "./types";

const REL_XP_DEC_PER_LEVEL: number = .1;

export namespace ENEMY {

    export const BOSS_SPIRITS: GSpirit[] = [
        {
            type: 'Mammon',
            name: 'Mammon',
            level: 0,
            introduced: false,
            portraitKey: 'mammon_circle',
            avatarKey: 'battle_mammon',
        },
        {
            type: 'Beelzebub',
            name: 'Beelzebub',
            level: 0,
            introduced: false,
            portraitKey: 'beelzebub_circle',
            avatarKey: 'battle_beelzebub',
        },
        {
            type: 'Belial',
            name: 'Belial',
            level: 0,
            introduced: false,
            portraitKey: 'belial_circle',
            avatarKey: 'battle_belial',
        },
        {
            type: 'Legion',
            name: 'Legion',
            level: 0,
            introduced: false,
            portraitKey: 'legion_circle',
            avatarKey: 'battle_legion',
        },
        {
            type: 'Apollyon',
            name: 'Apollyon',
            level: 0,
            introduced: false,
            portraitKey: 'apollyon_circle',
            avatarKey: 'battle_apollyon',
        },
        {
            type: 'Lucifer',
            name: 'Lucifer',
            level: 0,
            introduced: false,
            portraitKey: 'lucifer_circle',
            avatarKey: 'battle_lucifer',
        },
        {
            type: 'Dragon',
            name: 'Dragon',
            level: 0,
            introduced: false,
            portraitKey: 'dragon_circle',
            avatarKey: 'battle_dragon_upright',
        },
    ];

    let spirits: GSpirit[] = [];
    let maxResistance: number = 50;
    let resistance: number = 50;
    let portrait: string;
    let avatar: string;
    let spirit: GSpirit;
    let sprite: GEnemySprite|null;

    export function toSaveObject(spirit: GSpirit, _ids: Map<any, number>): object {
        return {
            type: spirit.type,
            name: spirit.name,
            level: spirit.level,
            introduced: spirit.introduced,
            portraitKey: spirit.portraitKey,
            avatarKey: spirit.avatarKey,
        };
    }

    export function hydrateSpirit(_id: number, _context: any, _refObj: RefFunction): void {
        /**
         * GSpirit doesn't actually have references to any other objects,
         * so we don't need to do anything here. Maybe that will change someday.
         * In the meantime, I added this empty method just to be consistent with GPerson.
         */
    }

    export function getXpValue(): number {
        /**
         * This formula ensures several things:
         * 1. Getting to level 1 requires defeating five level 0 enemies
         * 2. The number of equal-level enemies to defeat increases slowly and smoothly
         * 3. Reaching max level will require defeating approximately 10 equal-level enemies
         * 4. Algorithm in PLAYER.getXpNeededAtLevel can be adjusted without affecting the above.
         */
        const enemyLevel = spirit.level;
        /**
         * Passing in 1.0 as the modifier gives us the "base" XP needed without difficulty adjustments,
         * which lets us scale the needed XP without also scaling the XP for defeating enemies.
         * (Scaling both together would defeat the whole purpose of scaling the needed XP.)
         *
         * Also, since scaling the needed XP makes the player level faster or slower, it means he
         * will level after fighting less or more enemies; and since the fought enemy levels up after
         * each fight, this will also make enemies gradually weaker or stronger based on the difficulty.
         */
        return PLAYER.getXpNeededAtLevel(enemyLevel, 1.0) / (5 + (enemyLevel * REL_XP_DEC_PER_LEVEL));
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

    export function getSprite(): GEnemySprite|null {
        return sprite;
    }

    export function init(enemy: GEnemySprite|null, enemySpirit: GSpirit, enemyPortrait: string, enemyAvatar: string) {
        sprite = enemy;
        spirit = enemySpirit;
        portrait = enemyPortrait;
        avatar = enemyAvatar;
        setMaxResistance(GFF.getDifficulty().enemyBaseResist + (GFF.getDifficulty().enemyResistPerLevel * enemySpirit.level));
        setResistance(getMaxResistance());
    }

    export function initBoss(bossSpirit: GSpirit) {
        sprite = null;
        bossSpirit.level = PLAYER.getLevel();
        spirit = bossSpirit;
        portrait = bossSpirit.portraitKey!;
        avatar = bossSpirit.avatarKey!;
        setMaxResistance(Math.floor(PLAYER.getMaxFaith() * GFF.getDifficulty().bossResistPct));
        setResistance(getMaxResistance());
    }

    /**
     * I want 3 rules for level up:
     * AFTER FIGHTING AN ENEMY:
     * 1. The enemy just fought gains 1 level
     * ON PLAYER LEVEL-UP:
     * 2. The current lowest-level enemy becomes the player's level
     * 3. Random half of enemies lower than the player gain 1 level
     */
    export function levelUp() {
        spirit.level = Math.min(50, spirit.level + 1);
    }

    export function levelUpLowerEnemies() {
        const lowestLevel = Math.min(...spirits.map(s => s.level));
        const lowestSpirit = spirits.find(s => s.level === lowestLevel);
        if (lowestSpirit) {
            lowestSpirit.level = PLAYER.getLevel();
        }

        const lowerSpirits = spirits.filter(s => s.level < PLAYER.getLevel());
        RANDOM.shuffle(lowerSpirits);
        const halfToLevel = Math.ceil(lowerSpirits.length / 2);
        for (let i = 0; i < halfToLevel; i++) {
            lowerSpirits[i].level = Math.min(50, lowerSpirits[i].level + 1);
        }
    }

    export function addSpirit(spirit: GSpirit) {
        spirits.push(spirit);
    }

    export function getSpirits(): GSpirit[] {
        return spirits;
    }
}