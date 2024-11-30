import { BOOKS } from "../books";
import { COLOR } from "../colors";
import { GInputMode } from "../GInputMode";
import { GFF } from "../main";
import { GCheckBox } from "../objects/components/GCheckBox";
import { GTextButton } from "../objects/components/GTextButton";
import { GUIScene } from "./GUIScene";

const BOOKS_TOP: number = 170;
const BOOK_GAP: number = 22;

const INPUT_DEFAULT: GInputMode = new GInputMode('books.default');

export class GBooksUI extends GUIScene {

    private otChecks: GCheckBox[] = [];
    private ntChecks: GCheckBox[] = [];
    private otButton: GTextButton;
    private ntButton: GTextButton;

    constructor() {
        super("BooksUI");

        this.setContainingMode(GFF.BOOKS_MODE);
    }

    public preload(): void {
    }

    public create(): void {
        super.create();
        this.add.image(0, 0, 'rock_bg').setOrigin(0, 0);
        this.add.text(512, 20, 'Books of the Bible', {
            color: COLOR.GREY_1.str(),
            fontFamily: 'dyonisius',
            fontSize: '48px'
        }).setOrigin(.5, 0);

        this.initBooks();
        this.setSubscreen();
        this.initInputMode();
        //this.createTileGuidelines();
    }

    private updateButton(testament: 'OT'|'NT') {
        const bookChecks: GCheckBox[] = testament === 'OT' ? this.otChecks : this.ntChecks;
        const button: GTextButton = testament === 'OT' ? this.otButton : this.ntButton;

        let allPossibleBooksChecked: boolean = true;
        for (let book of bookChecks) {
            if (book.isEnabled() && !book.isChecked()) {
                allPossibleBooksChecked = false;
            }
        }

        button.setText(
            allPossibleBooksChecked
            ? 'None'
            : 'All'
        );
    }

    private initBooks() {
        const otTitle: Phaser.GameObjects.Text = this.add.text(180, 110, 'Old Testament', {
            fontFamily: 'dyonisius',
            fontSize: '30px',
            color: COLOR.GREY_1.str()
        });
        this.otButton = new GTextButton(this, 0, 0, 'All', () => {
            if (this.otButton.getText() === 'All') {
                for (let checkBox of this.otChecks) {
                    if (!checkBox.isChecked()) {
                        checkBox.onClick(false);
                    }
                }
            } else {
                for (let checkBox of this.otChecks) {
                    if (checkBox.isChecked()) {
                        checkBox.onClick(false);
                    }
                }
            }
            this.updateButton('OT');
        });
        this.otButton.setPosition(otTitle.x + otTitle.width + 4, otTitle.y + (otTitle.height / 2) - (this.otButton.height / 2));
        this.add.existing(this.otButton);

        const ntTitle: Phaser.GameObjects.Text = this.add.text(690, 110, 'New Testament', {
            fontFamily: 'dyonisius',
            fontSize: '30px',
            color: COLOR.GREY_1.str()
        });
        this.ntButton = new GTextButton(this, 0, 0, 'All', () => {
            if (this.ntButton.getText() === 'All') {
                for (let checkBox of this.ntChecks) {
                    if (!checkBox.isChecked()) {
                        checkBox.onClick(false);
                    }
                }
            } else {
                for (let checkBox of this.ntChecks) {
                    if (checkBox.isChecked()) {
                        checkBox.onClick(false);
                    }
                }
            }
            this.updateButton('NT');
        });
        this.ntButton.setPosition(ntTitle.x + ntTitle.width + 4, ntTitle.y + (ntTitle.height / 2) - (this.ntButton.height / 2));
        this.add.existing(this.ntButton);

        let x: number = 40;
        let y: number = BOOKS_TOP;

        y = this.createBookGroup('Law of Moses', x, y, this.otChecks, [
            'Genesis',
            'Exodus',
            'Leviticus',
            'Numbers',
            'Deuteronomy'
        ]);

        y = this.createBookGroup('History', x, y, this.otChecks, [
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
            'Esther'
        ]);

        x += 190;
        y = BOOKS_TOP;

        y = this.createBookGroup('Poetry/Wisdom', x, y, this.otChecks, [
            'Job',
            'Psalms',
            'Proverbs',
            'Ecclesiastes',
            'Song of Solomon'
        ]);

        y = this.createBookGroup('Major Prophets', x, y, this.otChecks, [
            'Isaiah',
            'Jeremiah',
            'Lamentations',
            'Ezekiel',
            'Daniel'
        ]);

        x += 190;
        y = BOOKS_TOP;

        y = this.createBookGroup('Minor Prophets', x, y, this.otChecks, [
            'Hosea',
            'Joel',
            'Amos',
            'Obadiah',
            'Jonah',
            'Micah',
            'Nahum',
            'Habakkuk',
            'Zephaniah',
            'Haggai',
            'Zechariah',
            'Malachi'
        ]);

        x += 220;
        y = BOOKS_TOP;

        y = this.createBookGroup('Gospels', x, y, this.ntChecks, [
            'Matthew',
            'Mark',
            'Luke',
            'John'
        ]);

        y = this.createBookGroup('History', x, y, this.ntChecks, [
            'Acts'
        ]);

        y = this.createBookGroup('Church Epistles', x, y, this.ntChecks, [
            'Romans',
            '1 Corinthians',
            '2 Corinthians',
            'Galatians',
            'Ephesians',
            'Philippians',
            'Colossians',
            '1 Thessalonians',
            '2 Thessalonians'
        ]);

        x += 190;
        y = BOOKS_TOP;

        y = this.createBookGroup('Personal Epistles', x, y, this.ntChecks, [
            '1 Timothy',
            '2 Timothy',
            'Titus',
            'Philemon'
        ]);

        y = this.createBookGroup('General Epistles', x, y, this.ntChecks, [
            'Hebrews',
            'James',
            '1 Peter',
            '2 Peter',
            '1 John',
            '2 John',
            '3 John',
            'Jude'
        ]);

        y = this.createBookGroup('Prophecy', x, y, this.ntChecks, [
            'Revelation'
        ]);

        this.updateButton('OT');
        this.updateButton('NT');
    }

    private createBookGroup(title: string, x: number, y: number, testament: GCheckBox[], books: string[]): number {
        this.add.text(x, y, title, {
            fontFamily: 'dyonisius',
            fontSize: '18px',
            color: COLOR.GREY_1.str()
        });

        for (let book of books) {
            y += BOOK_GAP;

            const hasBook: boolean = BOOKS.isBookObtained(book);
            const isEnabled: boolean = BOOKS.isBookEnabled(book);
            const checkBox: GCheckBox = new GCheckBox(this, x, y, book, isEnabled, hasBook, (label: string, check: boolean) => {
                // Don't allow unchecking the only book! We always need one enabled!
                if (!check && BOOKS.isOnlyEnabledBook(label)) {
                    return;
                }
                BOOKS.setBookEnabled(label, check);
                checkBox.setCheckState(check);

                if (testament === this.otChecks) {
                    this.updateButton('OT');
                } else {
                    this.updateButton('NT');
                }
            });
            this.add.existing(checkBox);
            testament.push(checkBox);
        }

        return y + (BOOK_GAP* 2);
    }

    private initInputMode() {
        INPUT_DEFAULT.onKeyDown((keyEvent) => {
            this.sendPotentialHotkey(keyEvent);
        });
        INPUT_DEFAULT.addAllowedEvent('MOUSE_UI_BUTTON');
        this.setInputMode(INPUT_DEFAULT);
    }
}