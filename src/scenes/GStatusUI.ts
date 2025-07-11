import { BOOKS } from "../books";
import { COLOR } from "../colors";
import { GInputMode } from "../GInputMode";
import { GFF } from "../main";
import { GStatusAvatar } from "../objects/chars/GStatusAvatar";
import { KEYS } from "../keys";
import { PLAYER } from "../player";
import { GPoint2D, NINE } from "../types";
import { GUIScene } from "./GUIScene";
import { ARMORS } from "../armors";
import { FRUITS } from "../fruits";
import { COMMANDMENTS } from "../commandments";
import { STATS } from "../stats";
import { TOWN } from "../town";

const INPUT_DEFAULT: GInputMode = new GInputMode('status.default');

export class GStatusUI extends GUIScene {

    private timeElapsedText: Phaser.GameObjects.Text;

    constructor() {
        super("StatusUI");
        this.setContainingMode(GFF.STATUS_MODE);
    }

    public preload(): void {
    }

    public create(): void {
        super.create();
        this.add.image(0, 0, 'status_subscreen_bg').setOrigin(0, 0);
        this.add.text(512, 20, 'Status', {
            color: COLOR.GREY_1.str(),
            fontFamily: 'dyonisius',
            fontSize: '48px'
        }).setOrigin(.5, 0);

        this.add.text(256, 90, 'Character Info', {
            color: COLOR.GREY_1.str(),
            fontFamily: 'dyonisius',
            fontSize: '30px'
        }).setOrigin(.5, 0);

        this.add.text(768, 90, 'Special Items', {
            color: COLOR.GREY_1.str(),
            fontFamily: 'dyonisius',
            fontSize: '30px'
        }).setOrigin(.5, 0);

        this.initAvatar();
        this.initMainStats();
        this.initOtherStats();
        this.initItemPanels();
        this.setSubscreen();
        this.initInputMode();

        // Create an event to update the elapsed time once per second:
        this.time.addEvent({
            delay: 100, // Check every 100ms
            callback:  () => {
                // Update the time elapsed text:
                this.timeElapsedText.setText(STATS.getTimeElapsed());
            },
            callbackScope: this,
            loop: true
        });
    }

    private initAvatar() {
        const avatar: GStatusAvatar = new GStatusAvatar(this, 128, 220);
        avatar.setOrigin(.5, .5);
        avatar.setVisible(true);
    }

    private initMainStats() {
        const textSize: string = '16px';
        const lineGap: number = 24;
        const infoGap1: number = 50;
        const infoGap2: number = 82;
        let x: number = 207;
        let y: number = 156;

        // Name
        this.add.text(x, y, 'Adam', {
            fontFamily: 'dyonisius',
            fontSize: '26px',
            color: COLOR.GREY_1.str()
        }).setOrigin(0, 0);

        // Separator
        this.add.line(x, y + 30, 0, 0, 246, 0, COLOR.GREY_1.num()).setOrigin(0, 0);

        // Column 1

        // Level
        y += 40;
        this.add.text(x, y, 'Level:', {
            fontFamily: 'dyonisius',
            fontSize: textSize,
            color: COLOR.GREY_1.str()
        }).setOrigin(0, 0);
        this.add.text(x + infoGap1, y, `${PLAYER.getLevel()}`, {
            fontFamily: 'dyonisius',
            fontSize: textSize,
            color: COLOR.GREY_1.str()
        }).setOrigin(0, 0);

        // Experience
        y += lineGap;
        this.add.text(x, y, 'Exp:', {
            fontFamily: 'dyonisius',
            fontSize: textSize,
            color: COLOR.GREY_1.str()
        }).setOrigin(0, 0);
        this.add.text(x + infoGap1, y, `${PLAYER.getXpPct()}%`, {
            fontFamily: 'dyonisius',
            fontSize: textSize,
            color: COLOR.GREY_1.str()
        }).setOrigin(0, 0);

        // Faith
        y += lineGap;
        this.add.text(x, y, 'Faith:', {
            fontFamily: 'dyonisius',
            fontSize: textSize,
            color: COLOR.GREY_1.str()
        }).setOrigin(0, 0);
        this.add.text(x + infoGap1, y, `${PLAYER.getFaith()}/${PLAYER.getMaxFaith()}`, {
            fontFamily: 'dyonisius',
            fontSize: textSize,
            color: COLOR.GREY_1.str()
        }).setOrigin(0, 0);

        // Grace
        y += lineGap;
        this.add.text(x, y, 'Grace:', {
            fontFamily: 'dyonisius',
            fontSize: textSize,
            color: COLOR.GREY_1.str()
        }).setOrigin(0, 0);
        this.add.text(x + infoGap1, y, `${PLAYER.getGrace()}/${PLAYER.getMaxGrace()}`, {
            fontFamily: 'dyonisius',
            fontSize: textSize,
            color: COLOR.GREY_1.str()
        }).setOrigin(0, 0);

        // Column 2
        y = 196;
        x = 347;

        // Seeds
        this.add.text(x, y, 'Seeds:', {
            fontFamily: 'dyonisius',
            fontSize: textSize,
            color: COLOR.GREY_1.str()
        }).setOrigin(0, 0);
        this.add.text(x + infoGap2, y, `${PLAYER.getSeeds()}`, {
            fontFamily: 'dyonisius',
            fontSize: textSize,
            color: COLOR.GREY_1.str()
        }).setOrigin(0, 0);

        // Sermons
        y += lineGap;
        this.add.text(x, y, 'Sermons:', {
            fontFamily: 'dyonisius',
            fontSize: textSize,
            color: COLOR.GREY_1.str()
        }).setOrigin(0, 0);
        this.add.text(x + infoGap2, y, `${PLAYER.getSermons()}`, {
            fontFamily: 'dyonisius',
            fontSize: textSize,
            color: COLOR.GREY_1.str()
        }).setOrigin(0, 0);

        // Standards
        y += lineGap;
        this.add.text(x, y, 'Standards:', {
            fontFamily: 'dyonisius',
            fontSize: textSize,
            color: COLOR.GREY_1.str()
        }).setOrigin(0, 0);
        this.add.text(x + infoGap2, y, `${PLAYER.getStandards()}`, {
            fontFamily: 'dyonisius',
            fontSize: textSize,
            color: COLOR.GREY_1.str()
        }).setOrigin(0, 0);

        // Keys
        y += lineGap;
        this.add.text(x, y, 'Keys:', {
            fontFamily: 'dyonisius',
            fontSize: textSize,
            color: COLOR.GREY_1.str()
        }).setOrigin(0, 0);
        this.add.text(x + infoGap2, y, `${KEYS.getObtainedCount()}`, {
            fontFamily: 'dyonisius',
            fontSize: textSize,
            color: COLOR.GREY_1.str()
        }).setOrigin(0, 0);
    }

    private initOtherStats() {
        const lineGap: number = 24;
        const infoGap1: number = 150;
        const infoGap2: number = 125;
        let x: number = 59;
        let y: number = 300;

        // Separator
        this.add.line(x, y, 0, 0, 394, 0, COLOR.GREY_1.num()).setOrigin(0, 0);

        // Column 1 contains adventure stats
        y += lineGap;
        this.addStatText(x, y, 'Rooms Explored', infoGap1, `${STATS.getIntegerStat('RoomsExplored')}`);
        y += lineGap;
        this.addStatText(x, y, 'Towns Discovered', infoGap1, `${TOWN.getDiscoveredTowns().length}`);
        y += lineGap;
        this.addStatText(x, y, 'Flights Taken', infoGap1, `${STATS.getIntegerStat('FlightsTaken')}`);
        y += lineGap;
        this.addStatText(x, y, 'Services Attended', infoGap1, `${STATS.getIntegerStat('ServicesAttended')}`);
        y += lineGap;
        this.addStatText(x, y, 'Songs Played', infoGap1, `${STATS.getIntegerStat('SongsPlayed')}`);
        y += lineGap;
        this.addStatText(x, y, 'People Met', infoGap1, `${STATS.getIntegerStat('PeopleMet')}`);
        y += lineGap;
        this.addStatText(x, y, 'Captives Rescued', infoGap1, `${STATS.getIntegerStat('CaptivesRescued')}`);
        y += lineGap;
        this.addStatText(x, y, 'Souls Converted', infoGap1, `${STATS.getIntegerStat('SoulsConverted')}`);
        y += lineGap;
        this.addStatText(x, y, 'Seeds Planted', infoGap1, `${STATS.getIntegerStat('SeedsPlanted')}`);
        y += lineGap;
        this.addStatText(x, y, 'Sermons Preached', infoGap1, `${STATS.getIntegerStat('SermonsPreached')}`);
        y += lineGap;
        this.addStatText(x, y, 'Standards Raised', infoGap1, `${STATS.getIntegerStat('StandardsRaised')}`);
        y += lineGap;
        this.addStatText(x, y, 'Key Verses Used', infoGap1, `${STATS.getIntegerStat('KeyVersesUsed')}`);
        y += lineGap;
        this.addStatText(x, y, 'Chests Opened', infoGap1, `${STATS.getIntegerStat('ChestsOpened')}`);

        // Column 2 contains battle stats
        x = 256;
        y = 300 + lineGap;
        this.addStatText(x, y, 'Battles', infoGap2, `${STATS.getIntegerStat('Battles')}`);
        y += lineGap;
        this.addStatText(x, y, 'Hits', infoGap2, `${STATS.getIntegerStat('Hits')}`);
        y += lineGap;
        this.addStatText(x, y, 'Critical Hits', infoGap2, `${STATS.getIntegerStat('CriticalHits')}`);
        y += lineGap;
        this.addStatText(x, y, 'Misses', infoGap2, `${STATS.getIntegerStat('Misses')}`);
        y += lineGap;
        this.addStatText(x, y, 'Accuracy', infoGap2, `${STATS.getAccuracyPct()}`);
        y += lineGap;
        this.addStatText(x, y, 'Highest Score', infoGap2, `${STATS.getIntegerStat('HighestScore')}`);
        y += lineGap;
        this.addStatText(x, y, 'Books Obtained', infoGap2, `${BOOKS.getObtainedCount()}`);
        y += lineGap;
        this.addStatText(x, y, 'Favorite Book', infoGap2, `${STATS.getFavoriteBook()}`);
        y += lineGap;
        this.addStatText(x, y, 'Best Book', infoGap2, `${STATS.getBestBook()}`);
        y += lineGap;
        this.addStatText(x, y, 'Worst Book', infoGap2, `${STATS.getWorstBook()}`);
        y += lineGap;
        this.addStatText(x, y, 'Victories', infoGap2, `${STATS.getIntegerStat('Victories')}`);
        y += lineGap;
        this.addStatText(x, y, 'Defeats', infoGap2, `${STATS.getIntegerStat('Defeats')}`);
        y += lineGap;
        this.timeElapsedText = this.addStatText(x, y, 'Time Elapsed', infoGap2, `${STATS.getTimeElapsed()}`);
    }

    private addStatText(x: number, y: number, label: string, gap: number, value: string): Phaser.GameObjects.Text {
        const textSize: string = '16px';
        this.add.text(x, y, `${label}:`, {
            fontFamily: 'dyonisius',
            fontSize: textSize,
            color: COLOR.GREY_1.str()
        }).setOrigin(0, 0);
        return this.add.text(x + gap, y, value, {
            fontFamily: 'dyonisius',
            fontSize: textSize,
            color: COLOR.GREY_1.str()
        }).setOrigin(0, 0);
    }

    private initItemPanels() {
        this.initArmourPanel();
        this.initFruitPanel();
        this.initCommandmentsPanel();
    }

    private initArmourPanel() {
        // Armour Title
        this.add.text(635, 165, 'Armour', {
            fontFamily: 'dyonisius',
            fontSize: '26px',
            color: COLOR.GREY_1.str()
        }).setOrigin(.5, .5);
        // Armour Subtitle
        this.add.text(635, 186, 'of God', {
            fontFamily: 'dyonisius',
            fontSize: '16px',
            color: COLOR.GREY_1.str()
        }).setOrigin(.5, .5);
        // Armour Items
        for (let i = 1; i <= 6; i++) {
            const itemPoint: GPoint2D = this.getPointForPanelItemNum(i, 2);
            if (ARMORS.hasArmor(i - 1)) {
                this.setItemAt(`arm${i}`, 572, 204, itemPoint.x, itemPoint.y);
            }
        }
    }

    private initFruitPanel() {
        // Fruit Title
        this.add.text(870, 165, 'Fruit', {
            fontFamily: 'dyonisius',
            fontSize: '26px',
            color: COLOR.GREY_1.str()
        }).setOrigin(.5, .5);
        // Fruit Subtitle
        this.add.text(870, 186, 'of the Spirit', {
            fontFamily: 'dyonisius',
            fontSize: '16px',
            color: COLOR.GREY_1.str()
        }).setOrigin(.5, .5);
        // Fruit Items
        for (let i = 1; i <= 9; i++) {
            const itemPoint: GPoint2D = this.getPointForPanelItemNum(i, 3);
            if (FRUITS.hasFruit(i as NINE)) {
                this.setItemAt(`fruit${i}`, 773, 204, itemPoint.x, itemPoint.y);
            } else if (FRUITS.isFruitQueued(i as NINE)) {
                this.setItemAt(`plant`, 773, 204, itemPoint.x, itemPoint.y);
            }
        }
    }

    private initCommandmentsPanel() {
        // Commandments Subtitle
        this.add.text(768, 478, 'The Ten', {
            fontFamily: 'dyonisius',
            fontSize: '16px',
            color: COLOR.GREY_1.str()
        }).setOrigin(.5, .5);
        // Commandments Title
        this.add.text(768, 499, 'Commandments', {
            fontFamily: 'dyonisius',
            fontSize: '26px',
            color: COLOR.GREY_1.str()
        }).setOrigin(.5, .5);
        // Commandments Items
        for (let i = 1; i <= 10; i++) {
            const itemPoint: GPoint2D = this.getPointForPanelItemNum(i, 5);
            if (COMMANDMENTS.hasCommandment(i - 1)) {
                this.setItemAt(`cmd${i}`, 608, 518, itemPoint.x, itemPoint.y);
            }
        }
    }

    private getPointForPanelItemNum(itemNum: number, panelCols: number): GPoint2D {
        const index = itemNum - 1;
        return {
            x: index % panelCols,
            y: Math.floor(index / panelCols),
        };
    }

    private setItemAt(itemName: string, gridX: number, gridY: number, iCol: number, iRow: number) {
        const iX: number = gridX + (iCol * 64) + 7;
        const iY: number = gridY + (iRow * 64) + 7;
        this.scaleItemImage(
            this.add.image(iX, iY, itemName).setOrigin(0, 0),
            50,
            50
        );
    }

    private scaleItemImage(image: Phaser.GameObjects.Image, newWidth: number, newHeight: number) {
        // Calculate scale factors
        const scaleX: number = newWidth / image.width;
        const scaleY: number = newHeight / image.height;
        // Apply scale
        image.setScale(scaleX, scaleY);
    }

    private initInputMode() {
        INPUT_DEFAULT.onKeyDown((keyEvent) => {
            this.sendPotentialHotkey(keyEvent);
        });
        INPUT_DEFAULT.addAllowedEvent('MOUSE_UI_BUTTON');
        this.setInputMode(INPUT_DEFAULT);
    }
}