import { RANDOM } from "./random";
import { GFF } from "./main";
import { GBookEntry } from "./types";
import { PLAYER } from "./player";

type BookState = 'missing'|'acquired'|'enabled';

/**
 * There are 66 books in a full game (random Bible, or Bible-in-order):
 * - the player begins with 1 (given to him in the opening scene)
 * - 5 books are placed in each stronghold (25 total)
 * - 30 books are scattered across the world map
 * - 10 books will be gifted to the player by saints
 *
 * For OT-only games, 39 books:
 * - player begins with 1
 * - 3 in each stronghold (total 15)
 * - 20 scattered across the world map
 * - 3 gifted by saints
 *
 * For NT-only games, 27 books:
 * - player begins with 1
 * - 2 in each stronghold (total 10)
 * - 13 scattered across the world map
 * - 3 gifted by saints
 */

export namespace BOOKS {

    // List of books left to find. Next book is popped off the list.
    let booksToFind: string[] = [];

    // List of entries similar to glossary; used for find-popups and Glossary screen.
    let entries: GBookEntry[];

    // List of books in the player's inventory. Tri-state.
    let books: Map<string, BookState> = new Map<string, BookState>();

    export function initBooks() {
        entries = GFF.GAME.cache.json.get('books_info');
        entries.forEach(b => {
            books.set(b.name, 'missing');
            booksToFind.push(b.name);
        });
    }

    export function getAllBookEntries(): GBookEntry[] {
        return entries;
    }

    export function lookupEntry(name: string): GBookEntry|undefined {
        return entries.find(entry => entry.name === name);
    }

    export function isBookObtained(name: string): boolean {
        return books.get(name) !== 'missing';
    }

    export function isBookEnabled(name: string): boolean {
        return books.get(name) === 'enabled';
    }

    export function obtainBook(name: string) {
        books.set(name, 'acquired');
        PLAYER.calcMaxFaith();
        PLAYER.giveGrace('major');
    }

    export function setBookEnabled(name: string, enabled: boolean) {
        books.set(name, enabled ? 'enabled' : 'acquired');
    }

    export function getEnabledBooks(): string[] {
        return Array.from(books.entries())
            .filter(([_, value]) => value === 'enabled')
            .map(([key, _]) => key);
    }

    export function getAllBooks(): string[] {
        return Array.from(books.entries()).map(([key, _]) => key);
    }

    export function getObtainedCount(): number {
        return Array.from(books.values())
            .filter(state => state !== "missing").length;
    }

    export function isOnlyEnabledBook(bookName: string): boolean {
        const enabledBooks: string[] = getEnabledBooks();
        return enabledBooks.length === 1 && enabledBooks[0] === bookName;
    }

    export function isNewTestament(bookName: string): boolean {
        return entries.findIndex(entry => entry.name === bookName) >= 40;
    }

    export function startWithBook(bookName: string) {
        const index = booksToFind.findIndex(obj => obj === bookName);
        booksToFind.splice(index, 1);
        obtainBook(bookName);
        setBookEnabled(bookName, true);
    }

    export function shuffleBooksToFind() {
        RANDOM.shuffle(booksToFind);
    }

    export function reverseBooksToFind() {
        booksToFind.reverse();
    }

    export function getNextBookToFind(): string|undefined {
        return booksToFind.pop();
    }

    export function getRandomBookName(): string {
        const books: GBookEntry[] = GFF.GAME.cache.json.get('books_info');
        return (RANDOM.randElement(books) as GBookEntry).name;
    }
}