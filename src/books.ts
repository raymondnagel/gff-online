import { GRandom } from "./GRandom";
import { GFF } from "./main";
import { GBookEntry } from "./types";

type BookState = 'missing'|'acquired'|'enabled';

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
        GRandom.shuffle(booksToFind);
    }

    export function getNextBookToFind(): string|undefined {
        return booksToFind.pop();
    }
}