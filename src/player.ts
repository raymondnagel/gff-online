import { ARMORS } from "./armors";
import { BOOKS } from "./books";
import { COMMANDMENTS } from "./commandments";
import { FRUITS } from "./fruits";
import { GPlayerSprite } from "./objects/chars/GPlayerSprite";

export namespace PLAYER {
    const START_FAITH: number = 40;
    let sprite: GPlayerSprite;
    let level: number = 0;
    let maxLevel: number = 50;
    let xp: number = 0;
    let maxXp: number = 10;
    let faith: number = 50;
    let maxFaith: number = 0;
    let seeds: number = 0;
    let sermons: number = 0;

    export function getName(): string {
        return 'Adam';
    }

    export function getAvatar(): string {
        return 'battle_amc';
    }

    export function getSprite(): GPlayerSprite {
        return sprite;
    }

    export function setSprite(playerSprite: GPlayerSprite) {
        sprite = playerSprite;
    }

    export function getLevel(): number {
        return level;
    }

    export function canLevelUp(): boolean {
        return level < maxLevel && xp >= maxXp;
    }

    export function levelUp() {
        level++;
        xp -= maxXp;
        maxXp = getXpNeededAtLevel(level);
        calcMaxFaith();
    }

    export function getXp(): number {
        return xp;
    }

    export function addXp(amount: number) {
        xp += amount;
    }

    export function getMaxXp(): number {
        return maxXp;
    }

    export function getXpNeededAtLevel(currentLevel: number): number {
        return Math.floor(Math.pow(10, 1 + (.1 * currentLevel)));
    }

    export function getFaith(): number {
        return faith;
    }

    export function setFaith(amount: number) {
        faith = amount;
    }

    export function changeFaith(byAmount: number) {
        faith += byAmount;
        if (faith > getMaxFaith()) {
            faith = getMaxFaith();
        }
    }

    export function getMaxFaith(): number {
        return maxFaith;
    }

    export function calcMaxFaith(): void {
        maxFaith = START_FAITH +
            (level * 10) +
            (COMMANDMENTS.getCount() * 5) +
            (BOOKS.getObtainedCount() * 5) +
            (FRUITS.getCount() * 5) +
            (ARMORS.getCount() * 5); // Add companion bonus (5)
    }

    export function getSeeds(): number {
        return seeds;
    }

    export function changeSeeds(byAmount: number) {
        seeds += byAmount;
    }

    export function getSermons(): number {
        return sermons;
    }

    export function changeSermons(byAmount: number) {
        sermons += byAmount;
    }
}