import { ARMORS } from "./armors";
import { BOOKS } from "./books";
import { COMMANDMENTS } from "./commandments";
import { FRUITS } from "./fruits";
import { GRoom } from "./GRoom";
import { GPlayerSprite } from "./objects/chars/GPlayerSprite";
import { GPerson } from "./types";

export namespace PLAYER {
    const START_FAITH: number = 40;
    let sprite: GPlayerSprite;
    let level: number = 0;
    let maxLevel: number = 50;
    let xp: number = 0;
    let maxXp: number = 10;
    let faith: number = 50;
    let maxFaith: number = 0;
    let grace: number = 10;
    let seeds: number = 0;
    let sermons: number = 0;
    let markedChestRoom: GRoom|null = null;
    let companion: GPerson|null = null;

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

    export function getRequiredXp(): number {
        return getXpNeededAtLevel(level) - xp;
    }

    export function getXpPct(): number {
        return Math.floor((getXp() / getXpNeededAtLevel(level)) * 100)
    }

    export function getXpBonus(): number {
        // The XP bonus is half of the required XP to level up.
        return Math.floor(getRequiredXp() / 2);
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

    export function getGrace(): number {
        return grace;
    }

    export function setGrace(amount: number) {
        grace = amount;
    }

    export function changeGrace(byAmount: number) {
        grace += byAmount;
        if (grace > getMaxGrace()) {
            grace = getMaxGrace();
        }
    }

    export function getMaxGrace(): number {
        return getMaxFaith();
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
        if (seeds > 99) {
            seeds = 99; // Cap seeds at 99
        }
    }

    export function getSermons(): number {
        return sermons;
    }

    export function changeSermons(byAmount: number) {
        sermons += byAmount;
        if (sermons > 99) {
            sermons = 99; // Cap sermons at 99
        }
    }

    export function getMarkedChestRoom(): GRoom|null {
        return markedChestRoom;
    }

    export function getCompanion(): GPerson|null {
        return companion;
    }

    export function setCompanion(person: GPerson|null): void {
        companion = person;
    }

    export function setMarkedChestRoom(chestRoom: GRoom|null): boolean {
        if (chestRoom === null) {
            markedChestRoom = chestRoom;
            return false;
        } else if (markedChestRoom === null) {
            markedChestRoom = chestRoom;
            return false;
        } else {
            markedChestRoom = chestRoom;
            return true;
        }
    }
}