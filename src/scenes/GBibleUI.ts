import { BIBLE } from "../bible";
import { COLOR } from "../colors";
import { GInputMode } from "../GInputMode";
import { GFF } from "../main";
import { GOptionGroup } from "../objects/components/GOptionGroup";
import { GScrollPane } from "../objects/components/GScrollPane";
import { GTextButton } from "../objects/components/GTextButton";
import { GTextOptionButton } from "../objects/components/GTextOptionButton";
import { GScripture } from "../types";
import { GUIScene } from "./GUIScene";

const INPUT_DEFAULT: GInputMode = new GInputMode('bible.default');

const PAGE_LEFT_X: number = 222;  // X position for the left page
const PAGE_RIGHT_X: number = 536; // X position for the right page
const PAGE_Y: number = 125;       // Y position for both pages
const PAGE_WIDTH: number = 264;   // Width for both pages
const PAGE_HEIGHT: number = 426;  // Height for both pages

const BOOK_TITLE_GAP: number = 16;   // Gap after book title
const CHAPTER_TITLE_GAP: number = 8; // Gap after chapter title
const VERSE_GAP: number = 4;         // Gap between verses

/**
 * The Bible subscreen gives the player an in-game Bible simulation.
 *
 * First, the Bible is closed, and the player can click on it to open it.
 * Once it's open, the player can select a book and chapter to read.
 * When a book is selected, the Bible displays chapter 1 by default.
 *
 * The player can then select a chapter, which will switch the Bible to that chapter.
 *
 * The Bible is designed to show one chapter at a time. When the chapter is selected,
 * all pages required to display the chapter will be calculated and loaded.
 *
 * If the chapter does not fit on the left page, it continues on the right page.
 * If it does not fit on both pages, the player can click a "Next" button to turn the page.
 *
 * "Next" button will allow the player to continue on within the same book; if the
 * current chapter has not ended, it will continue within the same chapter. If the
 * chapter has ended, it will continue to the next chapter.
 */

type DoublePage = {
    chapter: number; // Chapter for the double page (long chapters can span multiple double pages)
    firstVerse: number; // First verse on the left page
    lastVerse: number;  // Last verse on the right page
    verseTexts: Phaser.GameObjects.Text[]; // Verse texts for the set of both pages
};

type BookSelection = {
    bookName: string; // Name of the book
    button: GTextOptionButton; // Button to select the book
};

export class GBibleUI extends GUIScene {

    private backgroundImage: Phaser.GameObjects.Image;
    private bibleClosedImage: Phaser.GameObjects.Image;
    private bibleOpenImage: Phaser.GameObjects.Image;
    private emptyPageImage: Phaser.GameObjects.Image;
    private bibleOpen: boolean = false;
    private instructionTextLeft: Phaser.GameObjects.Text;
    private instructionTextRight: Phaser.GameObjects.Text;

    private currentChapterVerses: GScripture[] = [];
    private bookTitleText: Phaser.GameObjects.Text;
    private chapterTitleText: Phaser.GameObjects.Text;
    private verseTexts: Phaser.GameObjects.Text[] = [];

    private booksScrollPane: GScrollPane; // Scroll pane for book selection
    private booksGroup: GOptionGroup; // Group for book selection buttons
    private bookSelections: BookSelection[] = []; // Array of book selections

    private chaptersScrollPane: GScrollPane; // Scroll pane for chapter selection
    private chaptersGroup: GOptionGroup; // Group for chapter selection buttons
    private chapterSelections: GTextOptionButton[] = []; // Array of book selections

    private nextButton: GTextButton; // Button to go to the next page
    private previousButton: GTextButton; // Button to go to the previous page

    // All double pages for the current chapter
    private chapterDoublePages: DoublePage[] = [];
    private currentDoublePageIndex: number = 0;

    constructor() {
        super("BibleUI");

        this.setContainingMode(GFF.BIBLE_MODE);
    }

    public preload(): void {
    }

    public create(): void {
        super.create();
        this.backgroundImage = this.add.image(0, 0, 'rock_bg').setOrigin(0, 0);
        this.add.text(512, 20, 'The Holy Bible', {
            color: COLOR.GREY_1.str(),
            fontFamily: 'dyonisius',
            fontSize: '48px'
        }).setOrigin(.5, 0);

        this.instructionTextLeft = this.add.text(160, 320, 'Click the Bible to open it; then select a book and chapter to read.', {
            color: COLOR.GREY_1.str(),
            fontFamily: 'averia_serif',
            fontSize: '32px'
        }).setOrigin(.5, .5).setWordWrapWidth(250, true);

        this.instructionTextRight = this.add.text(864, 320, 'You can also press ↑ ↓ to change the book, and ← → to turn the page.', {
            color: COLOR.GREY_1.str(),
            fontFamily: 'averia_serif',
            fontSize: '32px'
        }).setOrigin(.5, .5).setWordWrapWidth(250, true);

        // Init Bible
        this.initBible();

        this.setSubscreen();
        this.initInputMode();

        // For design:
        // this.createTileGuidelines();
        // this.initDesignMode();
    }

    private initBible() {
        // Start fresh with a closed Bible, in case we've visited this subscreen before:
        this.bibleOpen = false;
        this.clearCurrentChapter();

        // Closed Bible
        this.bibleClosedImage = this.add.image(512, 88, 'bible_closed').setOrigin(.5, 0);
        this.bibleClosedImage.setVisible(true);
        this.bibleClosedImage.setInteractive();
        this.bibleClosedImage.on('pointerdown', () => {
            this.loadChapter('Psalms', 1);
        });

        // Open Bible
        this.bibleOpenImage = this.add.image(512, 88, 'bible_open').setOrigin(.5, 0);
        this.bibleOpenImage.setVisible(false);

        // Empty Page Design
        this.emptyPageImage = this.add.image(PAGE_RIGHT_X + (PAGE_WIDTH / 2), PAGE_Y + (PAGE_HEIGHT / 2), 'page_cross').setOrigin(.5, .5);
        this.emptyPageImage.setVisible(false);

        // Previous Page button
        this.previousButton = new GTextButton(this, 0, 0, '< Page', () => {
             this.previousPage();
        }).setVisible(false);
        this.previousButton.setCustomClickSound(null);
        this.previousButton.setPosition(PAGE_LEFT_X, PAGE_Y + PAGE_HEIGHT + 90);

        // Next Page button
        this.nextButton = new GTextButton(this, 0, 0, 'Page >', () => {
            this.nextPage();
        }).setVisible(false);
        this.nextButton.setCustomClickSound(null);
        this.nextButton.setPosition(PAGE_RIGHT_X + PAGE_WIDTH - this.nextButton.width, PAGE_Y + PAGE_HEIGHT + 90);

        // Book selection
        this.initBookSelection();

        // Chapter selection
        this.initChapterSelection();
    }

    private initBookSelection() {
        this.booksGroup = new GOptionGroup();
        this.bookSelections = [];
        this.booksScrollPane = new GScrollPane(this, 21, PAGE_Y, 114, 480, 0).setVisible(false);
        const books: string[] = BIBLE.getAllBooks();
        for (let b = 0; b < books.length; b++) {
            const bookButton = new GTextOptionButton(this, 0, b * 20, books[b], () => {
                this.loadChapter(books[b], 1);
            }, {
                color: '#ffffff',
                backgroundColor: '#555555',
                fontFamily: 'averia_serif',
                fontSize: '12px',
                padding: {
                    top: 3,
                    left: 3,
                    right: 3,
                    bottom: 3
                }
            });
            this.booksScrollPane.addContent(bookButton);
            this.bookSelections.push({
                bookName: books[b],
                button: bookButton
            });
            bookButton.setOptionGroup(this.booksGroup);
        }
    }

    private initChapterSelection() {
        this.chaptersGroup = new GOptionGroup();
        this.chaptersScrollPane = new GScrollPane(this, GFF.GAME_W - 135, PAGE_Y, 114, 480, 0).setVisible(false);
    }

    private updateChapterSelection(book: string) {
        // Clear the chapter scroll pane and reset the chapter selections:
        this.chaptersGroup.removeAllOptions();
        this.chaptersScrollPane.removeAll(true);
        this.chapterSelections = [];

        const lastChapter: number = BIBLE.getLastChapterForBook(book);
        const chapterType: string = book === 'Psalms' ? 'Psalm' : 'Chapter';

        for (let c = 0; c < lastChapter; c++) {
            const chapterNumber: number = c + 1;
            const chapterButton = new GTextOptionButton(this, 0, c * 20, `${chapterType} ${chapterNumber}`, () => {
                this.loadChapter(book, chapterNumber);
            }, {
                color: '#ffffff',
                backgroundColor: '#555555',
                fontFamily: 'averia_serif',
                fontSize: '12px',
                padding: {
                    top: 3,
                    left: 3,
                    right: 3,
                    bottom: 3
                }
            });
            this.chaptersScrollPane.addContent(chapterButton);
            this.chapterSelections.push(chapterButton);
            chapterButton.setOptionGroup(this.chaptersGroup);
        }
    }

    private getBookButtonByName(bookName: string): GTextOptionButton {
        // Find the book button by its name:
        const bookSelection: BookSelection = this.bookSelections.find(selection => selection.bookName === bookName) as BookSelection;
        return bookSelection.button;
    }

    private previousPage() {
        if (!this.bibleOpen) {
            return;
        }
        // If the DoublePage index = 0, the beginning of the chapter is shown: "Previous Page" will load the previous chapter, and then show the last DoublePage of the chapter.
        // If the current chapter = 1, "Previous Page" will load the last chapter of the previous book (if there is one), and then show the last DoublePage of that chapter.
        if (this.currentDoublePageIndex > 0) {
            // If we are not on the first double page, just go back one double page:
            this.setDoublePageWithinChapter(this.currentDoublePageIndex - 1);
        } else {
            // If we are on the first double page, we need to load the previous chapter:
            const currentChapter: number = this.currentChapterVerses[0].chapter;
            const currentBook: string = this.currentChapterVerses[0].book;
            const previousChapter: number = currentChapter - 1;

            if (previousChapter < 1) {
                // If there is no previous chapter for the current book,
                // we need to load the previous book's last chapter:
                const previousBook: string|null = BIBLE.getBookRelativeTo(currentBook, -1);
                if (previousBook) {
                    // Load the last chapter of the previous book, at the last verse:
                    const lastChapter: number = BIBLE.getLastChapterForBook(previousBook);
                    const lastVerse: number = BIBLE.getLastVerseForChapter(previousBook, lastChapter);
                    this.loadChapter(previousBook, lastChapter, lastVerse);
                }
            } else {
                // Load the previous chapter of the current book, at the last verse:
                const lastVerse: number = BIBLE.getLastVerseForChapter(currentBook, previousChapter);
                this.loadChapter(currentBook, previousChapter, lastVerse);
            }
        }
    }
    private nextPage() {
        if (!this.bibleOpen) {
            return;
        }
        // If the DoublePage index = length-1 (last), the end of the chapter is shown: "Next Page" will load the next chapter, and then show the first DoublePage of the chapter.
        // If the current chapter is the last in the book, "Next Page" will load the first chapter of the next book (if there is one), and then show the first DoublePage of that chapter.
        if (this.currentDoublePageIndex < this.chapterDoublePages.length - 1) {
            // If we are not on the last double page, just go forward one double page:
            this.setDoublePageWithinChapter(this.currentDoublePageIndex + 1);
        } else {
            // If we are on the last double page, we need to load the next chapter:
            const currentChapter: number = this.currentChapterVerses[0].chapter;
            const currentBook: string = this.currentChapterVerses[0].book;
            const nextChapter: number = currentChapter + 1;

            if (nextChapter > BIBLE.getLastChapterForBook(currentBook)) {
                // If there is no next chapter for the current book,
                // we need to load the next book's first chapter:
                const nextBook: string|null = BIBLE.getBookRelativeTo(currentBook, 1);
                if (nextBook) {
                    // Load the first chapter of the next book:
                    this.loadChapter(nextBook, 1);
                }
            } else {
                // Load the next chapter of the current book:
                this.loadChapter(currentBook, nextChapter, 1);
            }
        }
    }

    private loadChapter(book: string, chapter: number, verse: number = 1) {
        // By default, when a chapter is loaded, we'll display the double page
        // that contains the first verse of the chapter.
        // We can also specify a verse to open to, useful for a search result,
        // a bookmark, or to start from the end of the chapter.

        const currentPassage: GScripture|null = this.currentChapterVerses.length > 0
            ? this.currentChapterVerses[0]
            : null;

        // Before we do anything, check whether the requested book and chapter are already current.
        // We only need to load the chapter if it or the book has changed - OR if this is the first load.
        if (
            currentPassage === null
            || currentPassage.book !== book
            || currentPassage.chapter !== chapter
        ) {
            // If the Bible is closed, open it:
            this.setBibleOpen(true);

            // If a chapter is currently loaded, clear the current chapter:
            if (this.chapterDoublePages.length > 0) {
                this.setDoublePageVisible(false, true, true);
                this.clearCurrentChapter();
            }

            // If the book has changed, we need to update the chapter selection:
            if (currentPassage === null || currentPassage.book !== book) {
                this.updateChapterSelection(book);
            }

            // Get a scripture object for each verse in the new chapter:
            this.currentChapterVerses = BIBLE.getAllVersesForChapter(book, chapter);

            // Text objects for ALL verses in the chapter must be created
            let lastVerseAdded: number = 0;
            do {
                lastVerseAdded = this.createDoublePage(this.currentChapterVerses, lastVerseAdded + 1);
            } while (lastVerseAdded < this.currentChapterVerses.length);
        }

        // Ensure that the book selection is set to the current book (without calling its function):
        this.getBookButtonByName(book).select(false);
        this.booksScrollPane.ensureIsVisible(this.booksGroup.getSelection() as GTextOptionButton);
        // Ensure that the chapter selection is set to the current chapter (without calling its function):
        this.chapterSelections[chapter - 1].select(false);
        this.chaptersScrollPane.ensureIsVisible(this.chaptersGroup.getSelection() as GTextOptionButton);

        // Open to the specified verse:
        for (let i = 0; i < this.chapterDoublePages.length; i++) {
            const doublePage: DoublePage = this.chapterDoublePages[i];
            if (verse >= doublePage.firstVerse && verse <= doublePage.lastVerse) {
                // Set the double page index to the one containing the specified verse,
                // making sure NOT to the hide the current double page, which was just destroyed.
                this.setDoublePageWithinChapter(i, false);
                return;
            }
        }
    }

    /**
     * Used ONLY when the chapter is already loaded, and we're simply
     * switching to a different double page within the same chapter.
     */
    private setDoublePageWithinChapter(index: number, hideCurrent: boolean = true) {
        // Anything that changes the page ultimately calles this method,
        // so we'll play the page turn sound here:
        this.getSound().playSound('page');

        // Before changing the double page index, we may need to hide the current double page.
        // Also hide the book and chapter titles, since they may not apply to the new double page.
        if (hideCurrent) {
            this.setDoublePageVisible(false, true, true);
        }

        // Set the current double page index:
        this.currentDoublePageIndex = index;

        // Show the verse texts for the new double page; but first, check whether titles should be shown:
        const currentDoublePage: DoublePage = this.chapterDoublePages[this.currentDoublePageIndex];
        const includeChapterTitle: boolean = currentDoublePage.firstVerse === 1;
        const includeBookTitle: boolean = includeChapterTitle && currentDoublePage.chapter === 1;
        this.setDoublePageVisible(true, includeBookTitle, includeChapterTitle);
    }

    private createDoublePage(verses: GScripture[], startingVerse: number): number {
        // Create a new double page object:
        const doublePage: DoublePage = {
            chapter: verses[0].chapter,
            firstVerse: startingVerse,
            lastVerse: 0, // Will be set later
            verseTexts: []
        };

        // Begin with the left page:
        let yPosition: number = PAGE_Y;
        let xPosition: number = PAGE_LEFT_X;

        let verseNumber: number = startingVerse;
        let pageFull: boolean = false;

        // Before displaying verses, we may need to create some other things.
        // First, if this is the first verse of a book, we need a Book title.
        const firstVerseScripture: GScripture = verses[startingVerse - 1];
        if (firstVerseScripture.chapter === 1 && firstVerseScripture.verse === 1) {
            // Create a title for the book:
            const bookTitle: string = firstVerseScripture.book.toUpperCase();//(BOOKS.lookupEntry(firstVerseScripture.book) as GBookEntry).title;
            this.bookTitleText = this.add.text(xPosition + (PAGE_WIDTH / 2), yPosition, bookTitle, {
                color: COLOR.BLACK.str(),
                fontFamily: 'averia_serif',
                fontStyle: 'bold',
                fontSize: '24px',
                lineSpacing: 0,
                wordWrap: { width: PAGE_WIDTH, useAdvancedWrap: true }
            }).setOrigin(0.5, 0).setVisible(false);
            yPosition += this.bookTitleText.height + BOOK_TITLE_GAP;
        }
        // Second, if this is the first verse of a chapter, we need a Chapter title.
        if (firstVerseScripture.verse === 1) {
            // Create a title for the chapter:
            const chapterType: string = firstVerseScripture.book === 'Psalms' ? 'PSALM' : 'CHAPTER';
            const chapterTitle: string = `${chapterType} ${firstVerseScripture.chapter}`;
            this.chapterTitleText = this.add.text(xPosition, yPosition, chapterTitle, {
                color: COLOR.BLACK.str(),
                fontFamily: 'averia_serif',
                fontSize: '14px',
                lineSpacing: 0,
                wordWrap: { width: PAGE_WIDTH, useAdvancedWrap: true }
            }).setOrigin(0, 0).setVisible(false);
            yPosition += this.bookTitleText.height + CHAPTER_TITLE_GAP;
        }

        // Left page
        do {
            // Get the verse text for the current verse number:
            const verse: GScripture = verses[verseNumber - 1];
            const verseText: Phaser.GameObjects.Text = this.createVerseText(verse);

            // Once the verse text is created, check if it fits on the left page:
            if (yPosition + verseText.height <= PAGE_Y + PAGE_HEIGHT) {
                // Set the position of the verse text:
                verseText.setPosition(xPosition, yPosition).setVisible(false);
                // Add the verse text to the array of verse texts:
                this.verseTexts.push(verseText);
                // Also add the verse text to the current double page:
                doublePage.verseTexts.push(verseText);

                // Update Y position for the next verse:
                yPosition += verseText.height + VERSE_GAP;
                // Increment the verse number:
                verseNumber++;
            } else {
                pageFull = true;
                // Don't change the verse number; we'll try to add the same verse to the right page
            }
        } while (verseNumber <= verses.length && !pageFull);

        // Switch to the right page:
        pageFull = false;
        xPosition = PAGE_RIGHT_X;
        yPosition = PAGE_Y;

        // If we ran out of verses, we'll skip the right page and commit the double page as-is.
        if (verseNumber > this.currentChapterVerses.length) {
            doublePage.lastVerse = verseNumber - 1; // Last verse was already incremented, so we need to decrement it
            this.chapterDoublePages.push(doublePage);
            return doublePage.lastVerse;
        }
        // Otherwise, the page is full, and we'll continue with the current verse number (already incremented)

        // Right page
        do {
            // Get the verse text for the current verse number:
            const verse: GScripture = this.currentChapterVerses[verseNumber - 1];
            const verseText: Phaser.GameObjects.Text = this.createVerseText(verse);

            // Once the verse text is created, check if it fits on the right page:
            if (yPosition + verseText.height <= PAGE_Y + PAGE_HEIGHT) {
                // Set the position of the verse text:
                verseText.setPosition(xPosition, yPosition).setVisible(false);
                // Add the verse text to the array of verse texts:
                this.verseTexts.push(verseText);
                // Also add the verse text to the current double page:
                doublePage.verseTexts.push(verseText);

                // Update Y position for the next verse:
                yPosition += verseText.height + 2; // Add some spacing between verses
                // Increment the verse number:
                verseNumber++;
            } else {
                pageFull = true;
                // Since the page is full, we'll stop here; the verse number will be
                // decremented later, since the last verse we tried wasn't actually added.
            }
        } while (verseNumber <= this.currentChapterVerses.length && !pageFull);

        // Whether we ran out of verses or the page is full, the verse number needs to be decremented
        doublePage.lastVerse = verseNumber - 1;
        this.chapterDoublePages.push(doublePage);
        return doublePage.lastVerse;
    }

    private createVerseText(verse: GScripture): Phaser.GameObjects.Text {
        // Create a text object for the verse:
        const verseText = this.add.text(0, 0, `${verse.verse}  ${verse.verseText}`, {
            color: COLOR.BLACK.str(),
            fontFamily: 'averia_serif',
            fontSize: '14px',
            lineSpacing: 0,
            wordWrap: { width: PAGE_WIDTH, useAdvancedWrap: true }
        }).setVisible(false);

        // This may prevent the bottoms of certain letters from being cut off:
        verseText.setFixedSize(0, verseText.height + 2);

        return verseText;
    }

    private setDoublePageVisible(visible: boolean, includeBookTitle: boolean, includeChapterTitle: boolean) {
        // Show or hide all verse texts in the current DoublePage:
        const verseCount: number = this.chapterDoublePages[this.currentDoublePageIndex].verseTexts.length;
        let rightPageEmpty: boolean = true;
        for (let v = 0; v < verseCount; v++) {
            this.chapterDoublePages[this.currentDoublePageIndex].verseTexts[v].setVisible(visible);
            if (this.chapterDoublePages[this.currentDoublePageIndex].verseTexts[v].x === PAGE_RIGHT_X) {
                rightPageEmpty = false; // If any verse is on the right page, it's not empty
            }
        }
        // Affect titles if requested:
        if (includeBookTitle) {
            this.bookTitleText?.setVisible(visible);
        }
        if (includeChapterTitle) {
            this.chapterTitleText?.setVisible(visible);
        }

        // Show or hide the empty page image if the right page is empty:
        this.emptyPageImage.setVisible(rightPageEmpty);
    }

    private clearCurrentChapter() {
        // Destroy all verse texts in the current chapter:
        this.verseTexts.forEach((text) => {
            text.destroy();
        });
        // Remove the verse texts from the array:
        this.verseTexts = [];

        // The Text objects are shared, so they don't need to be destroyed again;
        // but we do need to clear all the current double pages so we can create
        // new ones for the next chapter.
        this.chapterDoublePages = [];

        // Clear the list of current chapter verses (scripture objects)::
        this.currentChapterVerses = [];

        // Destroy book and chapter titles, since those will not apply anymore, either:
        this.bookTitleText?.destroy();
        this.chapterTitleText?.destroy();
    }

    private setBibleOpen(open: boolean) {
        if (this.bibleOpen === open) {
            return;
        }
        this.bibleClosedImage.setVisible(!open);
        this.bibleOpenImage.setVisible(open);
        this.nextButton.setVisible(open);
        this.previousButton.setVisible(open);
        this.booksScrollPane.setVisible(open);
        this.chaptersScrollPane.setVisible(open);
        this.instructionTextLeft.setVisible(!open);
        this.instructionTextRight.setVisible(!open);
        this.getSound().playSound('thud');
        this.bibleOpen = open;
        if (open) {
            this.backgroundImage.setTexture('bible_subscreen_bg');
        } else {
            this.backgroundImage.setTexture('rock_bg');
        }
    }

    private initInputMode() {
        INPUT_DEFAULT.onKeyDown((keyEvent: KeyboardEvent) => {
            switch(keyEvent.key) {
                case 'ArrowUp':
                    if (this.bibleOpen) {
                        this.booksGroup.selectPrevious();
                        this.booksScrollPane.ensureIsVisible(this.booksGroup.getSelection() as GTextOptionButton);
                    }
                    break;
                case 'ArrowDown':
                    if (this.bibleOpen) {
                        this.booksGroup.selectNext();
                        this.booksScrollPane.ensureIsVisible(this.booksGroup.getSelection() as GTextOptionButton);
                    }
                    break;
                case 'ArrowLeft':
                    this.previousPage();
                    break;
                case 'ArrowRight':
                    this.nextPage();
                    break;
                default:
                    this.sendPotentialHotkey(keyEvent);
            }
        });
        INPUT_DEFAULT.addAllowedEvent('MOUSE_UI_BUTTON');
        this.setInputMode(INPUT_DEFAULT);
    }
}