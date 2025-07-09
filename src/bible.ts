import { RANDOM } from "./random";
import { GFF } from "./main";
import { GScripture } from "./types";

export type FocusVerses = {
    book: string;
    refs: string[];
};

export namespace BIBLE {

    export function getVerseText(bookName: string, chapterNo: number, verseNo: number): string | null {
        // Access the loaded XML data
        const kjvXml: XMLDocument = GFF.GAME.cache.xml.get('kjv') as XMLDocument;

        // Construct XPath-like query to find the verse
        const verseNode = kjvXml.querySelector(
            `testament > book[name="${bookName}"] > chapter[no="${chapterNo}"] > verse[no="${verseNo}"]`
        );

        // If verseNode exists, return its text content
        return verseNode ? verseNode.textContent : null;
    }

    export function getAllBooks(): string[] {
        // Access the loaded XML data
        const kjvXml: XMLDocument = GFF.GAME.cache.xml.get('kjv') as XMLDocument;

        // Select all book elements and extract their names
        const bookElements: NodeListOf<Element> = kjvXml.querySelectorAll('testament > book');
        return Array.from(bookElements).map(book => book.getAttribute('name') || '');
    }

    export function getAllChaptersForBook(bookName: string): Element[] {
        // Access the loaded XML data
        const kjvXml: XMLDocument = GFF.GAME.cache.xml.get('kjv') as XMLDocument;

        // Select all chapters within the specified book
        return Array.from(kjvXml.querySelectorAll(`testament > book[name="${bookName}"] > chapter`) as NodeListOf<Element>);
    }

    export function getAllVersesForChapter(bookName: string, chapterNo: number): GScripture[] {
        // Access the loaded XML data
        const kjvXml: XMLDocument = GFF.GAME.cache.xml.get('kjv') as XMLDocument;

        // Select all verses within the specified book and chapter
        const verseElements: Element[] = Array.from(kjvXml.querySelectorAll(
            `testament > book[name="${bookName}"] > chapter[no="${chapterNo}"] > verse`
        ) as NodeListOf<Element>);

        // Map the verse elements to GScripture objects
        return verseElements.map((verseNode: Element) => {
            const verseText = verseNode.textContent ?? '';
            const verseNo = parseInt(verseNode.getAttribute('no') || '0');
            return {
                book: bookName,
                chapter: chapterNo,
                verse: verseNo,
                verseText: verseText
            };
        });
    }

    export function getAllVersesForBook(bookName: string): Element[] {
        // Access the loaded XML data
        const kjvXml: XMLDocument = GFF.GAME.cache.xml.get('kjv') as XMLDocument;

        // Select all verses within the specified book
        return Array.from(kjvXml.querySelectorAll(`testament > book[name="${bookName}"] > chapter > verse`) as NodeListOf<Element>);
    }

    export function getRandomVerseFromBook(bookName: string): GScripture {
        // Get all verses from the book:
        const verses: Element[] = getAllVersesForBook(bookName);

        // Pick a random verse
        const randomIndex: number = RANDOM.randInt(0, verses.length - 1);
        const randomVerseNode: Element = verses[randomIndex] as Element;

        // Extract the verse text, chapter number, and verse number
        const verseText = randomVerseNode.textContent ?? '';
        const chapterNo = parseInt(randomVerseNode.parentElement?.getAttribute('no') || '0');
        const verseNo = parseInt(randomVerseNode.getAttribute('no') || '0');

        return {
            book: bookName,
            chapter: chapterNo,
            verse: verseNo,
            verseText: verseText
        };
    }

    export function getBookRelativeTo(bookName: string, offset: number): string|null {
        // Get all books from the XML
        const kjvXml: XMLDocument = GFF.GAME.cache.xml.get('kjv') as XMLDocument;
        const bookElements: NodeListOf<Element> = kjvXml.querySelectorAll('testament > book');

        // Find the index of the specified book
        const bookNames: string[] = Array.from(bookElements).map(book => book.getAttribute('name') || '');
        const currentIndex: number = bookNames.indexOf(bookName);

        // Calculate the new index with the offset
        const newIndex: number = currentIndex + offset;

        // Check if the new index is within bounds
        if (newIndex >= 0 && newIndex < bookNames.length) {
            return bookNames[newIndex];
        }
        return null; // Return null if out of bounds
    }

    export function getLastChapterForBook(bookName: string): number {
        // Access the loaded XML data
        const kjvXml: XMLDocument = GFF.GAME.cache.xml.get('kjv') as XMLDocument;

        // Select the last chapter of the specified book
        const lastChapterNode = kjvXml.querySelector(
            `testament > book[name="${bookName}"] > chapter:last-of-type`
        ) as Element;

        // Return the last chapter as a number
        return parseInt(lastChapterNode.getAttribute('no') as string);
    }

    export function getLastVerseForChapter(bookName: string, chapterNo: number): number {
        // Access the loaded XML data
        const kjvXml: XMLDocument = GFF.GAME.cache.xml.get('kjv') as XMLDocument;

        // Select the last verse of the specified chapter
        const lastVerseNode = kjvXml.querySelector(
            `testament > book[name="${bookName}"] > chapter[no="${chapterNo}"] > verse:last-of-type`
        ) as Element;

        // Return the last verse as a number
        return parseInt(lastVerseNode.getAttribute('no') as string);
    }

    export function getRandomVerseFromBooks(books: string[]): GScripture {
        return getRandomVerseFromBook(RANDOM.randElement(books) as string);
    }

    export function getFocusedVerseFromBooks(books: string[]): GScripture {
        return getFocusedVerseFromBook(RANDOM.randElement(books) as string);
    }

    export function getFocusedVerseFromBook(bookName: string): GScripture {
        // Get all focus verses for the book:
        const focusVersesByBook: FocusVerses[] = GFF.GAME.cache.json.get('focus_scripture');
        const focusVerses: FocusVerses = focusVersesByBook.find(b => b.book === bookName) as FocusVerses;

        // Pick a random verse
        const ref: string = RANDOM.randElement(focusVerses.refs) as string;

        // Extract the chapter number and verse number
        const [chapterNo, verseNo] = ref.split(':').map(Number);

        // Get the verse text
        const verseText: string = getVerseText(bookName, chapterNo, verseNo) as string;

        return {
            book: bookName,
            chapter: chapterNo,
            verse: verseNo,
            verseText: verseText
        };
    }

}