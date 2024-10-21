import { GPlayerSprite } from "./objects/chars/GPlayerSprite";

export namespace PLAYER {
    let sprite: GPlayerSprite;
    let level: number = 0;
    let maxLevel: number = 50;
    let xp: number = 0;
    let maxXp: number = 10;
    let maxFaith: number = 50;
    let faith: number = 50;
    let seeds: number = 0;
    let sermons: number = 0;

    let books: string[] = [
        // 'John'
        'Genesis',
        'Exodus',
        'Leviticus',
        'Numbers',
        'Deuteronomy',
        'Joshua',
        'Judges',
        'Ruth',
        '1 Samuel',
        '2 Samuel',
        '1 Kings',
        '2 Kings',
        '1 Chronicles',
        '2 Chronicles',
        'Ezra',
        'Nehemiah',
        'Esther',
        'Job',
        // 'Psalms',
        // 'Proverbs',
        // 'Ecclesiastes',
        // 'Song of Solomon',
        // 'Isaiah',
        // 'Jeremiah',
        // 'Lamentations',
        // 'Ezekiel',
        // 'Daniel',
        // 'Hosea',
        // 'Joel',
        // 'Amos',
        // 'Obadiah',
        // 'Jonah',
        // 'Micah',
        // 'Nahum',
        // 'Habakkuk',
        // 'Zephaniah',
        // 'Haggai',
        // 'Zechariah',
        // 'Malachi',
        // 'Matthew',
        // 'Mark',
        // 'Luke',
        // 'John',
        // 'Acts',
        // 'Romans',
        // '1 Corinthians',
        // '2 Corinthians',
        // 'Galatians',
        // 'Ephesians',
        // 'Philippians',
        // 'Colossians',
        // '1 Thessalonians',
        // '2 Thessalonians',
        // '1 Timothy',
        // '2 Timothy',
        // 'Titus',
        // 'Philemon',
        // 'Hebrews',
        // 'James',
        // '1 Peter',
        // '2 Peter',
        // '1 John',
        // '2 John',
        // '3 John',
        // 'Jude',
        // 'Revelation'
    ];

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
        if (faith > maxFaith) {
            faith = maxFaith;
        }
    }

    export function getMaxFaith(): number {
        return maxFaith;
    }

    export function setMaxFaith(amount: number) {
        maxFaith = amount;
    }

    export function changeMaxFaith(byAmount: number) {
        maxFaith += byAmount;
    }

    export function getBooks(): string[] {
        return books;
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