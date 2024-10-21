import { GRandom } from "./GRandom";
import { GFF } from "./main";
import { GScripture } from "./types";

export class GBible {

    public static getVerseText(bookName: string, chapterNo: number, verseNo: number): string | null {
        // Access the loaded XML data
        const kjvXml: XMLDocument = GFF.GAME.cache.xml.get('kjv') as XMLDocument;

        // Construct XPath-like query to find the verse
        const verseNode = kjvXml.querySelector(
            `testament > book[name="${bookName}"] > chapter[no="${chapterNo}"] > verse[no="${verseNo}"]`
        );

        // If verseNode exists, return its text content
        return verseNode ? verseNode.textContent : null;
    }

    public static getAllChaptersForBook(bookName: string): Element[] {
        // Access the loaded XML data
        const kjvXml: XMLDocument = GFF.GAME.cache.xml.get('kjv') as XMLDocument;

        // Select all chapters within the specified book
        return Array.from(kjvXml.querySelectorAll(`testament > book[name="${bookName}"] > chapter`) as NodeListOf<Element>);
    }

    public static getAllVersesForBook(bookName: string): Element[] {
        // Access the loaded XML data
        const kjvXml: XMLDocument = GFF.GAME.cache.xml.get('kjv') as XMLDocument;

        // Select all verses within the specified book
        return Array.from(kjvXml.querySelectorAll(`testament > book[name="${bookName}"] > chapter > verse`) as NodeListOf<Element>);
    }

    public static getRandomVerseFromBook(bookName: string): GScripture {
        // Get all verses from from the book:
        const verses: Element[] = this.getAllVersesForBook(bookName);

        // Pick a random verse
        const randomIndex: number = GRandom.randInt(0, verses.length - 1);
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

    public static getRandomVerseFromBooks(books: string[]): GScripture {
        return this.getRandomVerseFromBook(GRandom.randElement(books) as string);
    }

}