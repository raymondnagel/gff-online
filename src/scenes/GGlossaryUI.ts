import { COLOR } from "../colors";
import { GInputMode } from "../GInputMode";
import { GLOSSARY } from "../glossary";
import { GFF } from "../main";
import { GOptionGroup } from "../objects/components/GOptionGroup";
import { GScrollPane } from "../objects/components/GScrollPane";
import { GTextOptionButton } from "../objects/components/GTextOptionButton";
import { GGlossaryEntry } from "../types";
import { GUIScene } from "./GUIScene";

const INPUT_DEFAULT: GInputMode = new GInputMode('glossary.default');

export class GGlossaryUI extends GUIScene {

    private entryTitle: Phaser.GameObjects.Text;
    private entryImage: Phaser.GameObjects.Image;
    private entryText: Phaser.GameObjects.Text;
    private entriesGroup: GOptionGroup;

    constructor() {
        super("GlossaryUI");

        this.setContainingMode(GFF.GLOSSARY_MODE);
    }

    public preload(): void {
    }

    public create(): void {
        super.create();
        this.add.image(0, 0, 'glossary_subscreen_bg').setOrigin(0, 0);
        this.add.text(512, 20, 'Glossary', {
            color: COLOR.GREY_1.str(),
            fontFamily: 'dyonisius',
            fontSize: '48px'
        }).setOrigin(.5, 0);

        this.initEntryView(GLOSSARY.lookupEntry('adam') as GGlossaryEntry);
        this.initEntries();

        this.setSubscreen();
        this.initInputMode();
        //this.createTileGuidelines();
    }

    private setEntry(entry: GGlossaryEntry) {
        this.entryTitle.setText(entry.title);
        this.entryImage.setTexture(entry.image);
        this.scaleEntryImage(this.entryImage, 128, 128);
        this.entryText.setText(`${entry.text}\n\n\n${entry.inspiration}`);
    }

    private initEntryView(initialEntry: GGlossaryEntry) {
        let contentY: number = 140;
        this.entryTitle = this.add.text(768, contentY, initialEntry.title, {
            color: COLOR.GREY_1.str(),
            fontFamily: 'dyonisius',
            fontSize: '28px'
        }).setOrigin(.5, 0);

        contentY += 48;
        this.entryImage = this.add.image(768, contentY, initialEntry.image).setOrigin(.5, 0);

        contentY += 160;
        this.entryText = this.add.text(768, contentY, `${initialEntry.text}\n\n\n${initialEntry.inspiration}`, {
            color: COLOR.GREY_1.str(),
            fontFamily: 'dyonisius',
            fontSize: '18px',
            lineSpacing: 4,
            wordWrap: {
                width: 440,
                useAdvancedWrap: true
            }
        }).setOrigin(.5, 0);

        this.setEntry(initialEntry);
    }

    private initEntries() {
        this.entriesGroup = new GOptionGroup();
        const scrollPane: GScrollPane = new GScrollPane(this, 50, 90, 445, 581, 0);
        const entries: GGlossaryEntry[] = GLOSSARY.getAllEntries();
        for (let i = 0; i < entries.length; i++) {
            const entry: GGlossaryEntry = entries[i];
            const entryButton = new GTextOptionButton(this, 20, i * 24, entry.entry, () => {
                this.setEntry(entry);
            });
            scrollPane.addContent(entryButton);
            entryButton.setOptionGroup(this.entriesGroup);
        }
        // Select first entry button
        this.entriesGroup.selectNext();
    }

    private initInputMode() {
        INPUT_DEFAULT.allowRepeats(['ArrowUp', 'ArrowDown']);
        INPUT_DEFAULT.onKeyDown((keyEvent: KeyboardEvent) => {
            switch(keyEvent.key) {
                case 'ArrowUp':
                    this.entriesGroup.selectPrevious();
                    break;
                case 'ArrowDown':
                    this.entriesGroup.selectNext();
                    break;
                default:
                    this.sendPotentialHotkey(keyEvent);
            }
        });
        INPUT_DEFAULT.addAllowedEvent('MOUSE_UI_BUTTON');
        this.setInputMode(INPUT_DEFAULT);
    }

    private scaleEntryImage(image: Phaser.GameObjects.Image, newWidth: number, newHeight: number) {
        // Calculate scale factors
        const scaleX: number = newWidth / image.width;
        const scaleY: number = newHeight / image.height;
        // Apply scale
        image.setScale(scaleX, scaleY);
    }
}