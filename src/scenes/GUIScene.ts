import { GStrongholdArea } from "../areas/GStrongholdArea";
import { COLOR } from "../colors";
import { GConversation } from "../GConversation";
import { KEYS } from "../keys";
import { GFF } from "../main";
import { GIconBarButton } from "../objects/components/GIconBarButton";
import { GPopup } from "../objects/components/GPopup";
import { PLAYER } from "../player";
import { GActionableOption, GPoint2D } from "../types";
import { GBaseScene } from "./GBaseScene";

const METER_OFFSET = 28;
const METER_WIDTH = 175;
const FAITH_METER_HEIGHT = 15;

/**
 * Base class for all GUI scenes in the game.
 * This class provides a common interface and functionality for scenes that display
 * the UI bar: the Adventure mode, and all of the subscreens.
 *
 * Adventure mode contains both a content scene and a UI scene, so the player has
 * access to the UI bar during gameplay.
 * Subscreens only have a UI scene, which extends this class.
 *
 * Other parts of the game, such as the Title and Main Menu, do not have a UI scene,
 * since they do not have a UI bar.
 */

export abstract class GUIScene extends GBaseScene {

    protected uiBar: Phaser.GameObjects.Image;
    protected levelText: Phaser.GameObjects.Text;
    protected seedText: Phaser.GameObjects.Text;
    protected sermonText: Phaser.GameObjects.Text;
    protected standardText: Phaser.GameObjects.Text;
    protected keyText: Phaser.GameObjects.Text;
    protected faithMeterCenter: Phaser.GameObjects.Rectangle;
    protected faithMeterTop: Phaser.GameObjects.Line;
    protected faithMeterBottom: Phaser.GameObjects.Line;
    protected faithText: Phaser.GameObjects.Text;
    protected graceMeterCenter: Phaser.GameObjects.Rectangle;
    protected graceMeterTop: Phaser.GameObjects.Line;
    protected graceMeterBottom: Phaser.GameObjects.Line;
    protected expMeter: Phaser.GameObjects.Rectangle;
    protected uiButtons: GIconBarButton[] = [];
    protected buttonDefinitions: GActionableOption[];

    public create(): void {
        this.handleGeneralKeyInput();
    }

    public update(): void {
        if (this.uiBar !== undefined) {
            this.updateUIBarInfo();
        }
    }

    protected setSubscreen() {
        this.createUIBar(true);
        GFF.setMouseVisible(true);
    }

    protected createUIBar(excludeNonSubscreens: boolean = false) {
        // Create UI bar:
        this.uiBar = this.add.image(GFF.LEFT_BOUND, GFF.BOTTOM_BOUND, 'icon_bar');
        this.uiBar.setOrigin(0, 0);

        // Create icon buttons, in order from last to first:
        const BLOCK: number = 64;
        const PADDING: number = 8;
        const SPACING: number = 8;
        this.buttonDefinitions = [{
                option: 'Exit',
                hotkey: 'q',
                action: () => {
                    this.getSound().playSound('icon_click');
                    if (this.getContainingMode() === GFF.ADVENTURE_MODE) {
                        GPopup.createChoicePopup('Are you sure you wish to leave the game?', 'Exit Game', [
                            {option: 'Yes', hotkey: 'y', action: () => {
                                GPopup.createChoicePopup('Do you want to save the game?', 'Save Game', [
                                    {option: 'Yes', hotkey: 'y', action: () => {GFF.AdventureContent.endGame(true)}},
                                    {option: 'No', hotkey: 'n', action: () => {GFF.AdventureContent.endGame()}}
                                ]);
                            }},
                            {option: 'No', hotkey: 'n', action: () => {}}
                        ]);
                    } else {
                        this.escapeToAdventureMode();
                    }
                }
            }, {
                option: 'Options',
                hotkey: 'o',
                action: () => {
                    if (this.getContainingMode() !== GFF.OPTIONS_MODE) {
                        this.getSound().playSound('icon_click');
                        GFF.OPTIONS_MODE.switchTo(this.getContainingMode());
                    }
                }
            },
            {
                option: 'Glossary',
                hotkey: 'g',
                action: () => {
                    if (this.getContainingMode() !== GFF.GLOSSARY_MODE) {
                        this.getSound().playSound('icon_click');
                        GFF.GLOSSARY_MODE.switchTo(this.getContainingMode());
                    }
                }
            }, {
                option: 'Map',
                hotkey: 'm',
                action: () => {
                    if (this.getContainingMode() !== GFF.MAP_MODE) {
                        this.getSound().playSound('icon_click');
                        GFF.MAP_MODE.switchTo(this.getContainingMode());
                    }
                }
            }, {
                option: 'People',
                hotkey: 'r',
                action: () => {
                    if (this.getContainingMode() !== GFF.PEOPLE_MODE) {
                        this.getSound().playSound('icon_click');
                        GFF.PEOPLE_MODE.switchTo(this.getContainingMode());
                    }
                }
            }, {
                option: 'Bible',
                hotkey: 'b',
                action: () => {
                    if (this.getContainingMode() !== GFF.BIBLE_MODE) {
                        this.getSound().playSound('icon_click');
                        GFF.BIBLE_MODE.switchTo(this.getContainingMode());
                    }
                }
            }, {
                option: 'Books',
                hotkey: 'i',
                action: () => {
                    if (this.getContainingMode() !== GFF.BOOKS_MODE) {
                        this.getSound().playSound('icon_click');
                        GFF.BOOKS_MODE.switchTo(this.getContainingMode());
                    }
                }
            }, {
                option: 'Status',
                hotkey: 'c',
                action: () => {
                    if (this.getContainingMode() !== GFF.STATUS_MODE) {
                        this.getSound().playSound('icon_click');
                        GFF.STATUS_MODE.switchTo(this.getContainingMode());
                    }
                }
            }, {
                option: 'Actions',
                hotkey: excludeNonSubscreens ? undefined : 'a',
                action: () => {
                    this.getSound().playSound('icon_click');
                    GConversation.fromFile('player_actions_conv');
                }
            }
        ];
        this.buttonDefinitions.forEach((b, i) => {
            const imageName: string = b.option.toLowerCase();
            const x: number = GFF.RIGHT_BOUND - ((BLOCK + SPACING) * (i + 1)) + PADDING;
            const button: GIconBarButton = new GIconBarButton(this, x, GFF.BOTTOM_BOUND + 3, `${imageName}_off`, `${imageName}_on`, b.option, b.hotkey, b.action);

            // Disable buttons that are not available in subscreens: no saving, exiting, or street preaching.
            if (excludeNonSubscreens && (b.option === 'Actions')) {
                button.setEnabled(false);
            }
            // Need to store these hotkeys somehow and call them from sendPotentialHotkey().
            // AdventureContent will call the method directly on AdventureUI (as with pause), but for
            // all other modes, which have only UI scenes, the UI scenes will need to call it when setting up
            // their input mode(s).
            this.add.existing(button);
            this.uiButtons.push(button);
        });

        // Level text:
        this.levelText = this.add.text(METER_OFFSET + (METER_WIDTH / 2), GFF.BOTTOM_BOUND + 8, 'Adam: Level 0', {
            fontSize: '16px',
            color: COLOR.GREY_1.str(),
            fontFamily: 'dyonisius'
        });
        this.levelText.setOrigin(0.5, 0);

        // Seed count:
        this.seedText = this.add.text(245, GFF.BOTTOM_BOUND + 40, '00', {
            fontSize: '14px',
            color: COLOR.GREY_1.str(),
            fontFamily: 'dyonisius'
        }).setOrigin(0.5, 0);

        // Sermon count:
        this.sermonText = this.add.text(276, GFF.BOTTOM_BOUND + 40, '00', {
            fontSize: '14px',
            color: COLOR.GREY_1.str(),
            fontFamily: 'dyonisius'
        }).setOrigin(0.5, 0);

        // Standard count:
        this.standardText = this.add.text(307, GFF.BOTTOM_BOUND + 40, '00', {
            fontSize: '14px',
            color: COLOR.GREY_1.str(),
            fontFamily: 'dyonisius'
        }).setOrigin(0.5, 0);

        // Key count:
        this.keyText = this.add.text(338, GFF.BOTTOM_BOUND + 40, '00', {
            fontSize: '14px',
            color: COLOR.GREY_1.str(),
            fontFamily: 'dyonisius'
        }).setOrigin(0.5, 0);

        // Faith meter:
        this.faithMeterTop = this.add.line(METER_OFFSET, GFF.BOTTOM_BOUND + 30, 0, 0, METER_WIDTH, 0, 0xffaaaa);
        this.faithMeterTop.setOrigin(0, 0);
        this.faithMeterCenter = this.add.rectangle(METER_OFFSET, GFF.BOTTOM_BOUND + 31, METER_WIDTH, FAITH_METER_HEIGHT, 0xff0000);
        this.faithMeterCenter.setOrigin(0, 0);
        this.faithMeterBottom = this.add.line(METER_OFFSET, GFF.BOTTOM_BOUND + 31 + FAITH_METER_HEIGHT, 0, 0, METER_WIDTH, 0, 0xff3333);
        this.faithMeterBottom.setOrigin(0, 0);

        // Faith text:
        this.faithText = this.add.text(METER_OFFSET + (METER_WIDTH / 2), GFF.BOTTOM_BOUND + 33, 'Faith: 50/50', {
            fontSize: '14px',
            color: '#ffffff',
            fontFamily: 'dyonisius'
        }).setOrigin(0.5, 0);

        // Grace meter:
        this.graceMeterTop = this.add.line(METER_OFFSET, GFF.BOTTOM_BOUND + 48, 0, 0, METER_WIDTH, 0, 0xc4d5d7);
        this.graceMeterTop.setOrigin(0, 0);
        this.graceMeterCenter = this.add.rectangle(METER_OFFSET, GFF.BOTTOM_BOUND + 49, METER_WIDTH, 6, 0x48ccd7);
        this.graceMeterCenter.setOrigin(0, 0);
        this.graceMeterBottom = this.add.line(METER_OFFSET, GFF.BOTTOM_BOUND + 55, 0, 0, METER_WIDTH, 0, 0x035157);
        this.graceMeterBottom.setOrigin(0, 0);

        // Experience meter:
        this.expMeter = this.add.rectangle(METER_OFFSET, GFF.BOTTOM_BOUND + 24, METER_WIDTH, 3, 0xffffff);
        this.expMeter.setOrigin(0, 0);
    }

    private updateUIBarInfo() {
        // Level indicator:
        this.levelText.text = `Adam: Level ${PLAYER.getLevel()}`;

        // Faith meter:
        const faithRatio: number = PLAYER.getFaith() / PLAYER.getMaxFaith();
        const adjFaithMeterWidth: number = Math.min(METER_WIDTH, METER_WIDTH * faithRatio);
        this.faithMeterTop.setTo(0, 0, adjFaithMeterWidth, 0);
        this.faithMeterCenter.width = adjFaithMeterWidth;
        this.faithMeterBottom.setTo(0, 0, adjFaithMeterWidth, 0);
        this.faithText.text = `Faith: ${PLAYER.getFaith()}/${PLAYER.getMaxFaith()}`;

        // Grace meter:
        const graceRatio: number = PLAYER.getGrace() / PLAYER.getMaxGrace();
        const adjGraceMeterWidth: number = Math.min(METER_WIDTH, METER_WIDTH * graceRatio);
        this.graceMeterTop.setTo(0, 0, adjGraceMeterWidth, 0);
        this.graceMeterCenter.width = adjGraceMeterWidth;
        this.graceMeterBottom.setTo(0, 0, adjGraceMeterWidth, 0);

        // Experience meter:
        const xpRatio: number = PLAYER.getXp() / PLAYER.getMaxXp();
        const adjXpMeterWidth: number = Math.min(METER_WIDTH, METER_WIDTH * xpRatio);
        this.expMeter.width = adjXpMeterWidth;

        // Seed count:
        this.seedText.text = `${PLAYER.getSeeds()}`;
        // Sermon count:
        this.sermonText.text = `${PLAYER.getSermons()}`;
        // Standard count:
        this.standardText.text = `${PLAYER.getStandards()}`;
        // Key count:
        const area = GFF.AdventureContent.getCurrentArea();
        const keyCount = area instanceof GStrongholdArea ? PLAYER.getKeys(area.getStrongholdIndex()) : 0;
        this.keyText.text = `${keyCount}`;
    }


    public sendPotentialHotkey(keyEvent: KeyboardEvent) {
        // console.log(`Send hotkey: ${keyEvent.key} (from ${this.getContainingMode().getName()})`);
        switch(keyEvent.key) {
            case 'Escape':
                // If Esc is pressed on any UI that isn't part of AdventureMode,
                // it's a subscreen: it should escape back to AdventureMode.
                this.escapeToAdventureMode();
                return;
            default:
                for (let b of this.buttonDefinitions) {
                    if (keyEvent.key === b.hotkey) {
                        this.exitAllButtons();
                        b.action();
                        return;
                    }
                }
        }
    }

    private escapeToAdventureMode() {
        if (this.getContainingMode() !== GFF.ADVENTURE_MODE) {
            GFF.ADVENTURE_MODE.switchTo(this.getContainingMode());
        }
    }

    public exitAllButtons() {
        this.uiButtons.forEach(b => {
            if (b.scene !== undefined) {
                b.onOut();
            }
        });
    }

    protected handleGeneralKeyInput() {
        // Pass key input on to the current InputMode
        // This is handled here for UI scenes; for game modes that don't have a
        // UI scene to receive key input, this will need to be done in the content scene.
        this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
            this.getInputMode()?.processKeyDown(event);
        });
        this.input.keyboard?.on('keyup', (event: KeyboardEvent) => {
            this.getInputMode()?.processKeyUp(event);
        });
    }

    protected createTileGuidelines() {
        // Guidelines divide the game screen into 64x64 blocks.
        for (let y: number = GFF.TOP_BOUND; y <= GFF.BOTTOM_BOUND; y += 64) {
            const h = this.add.line(0, 0, GFF.LEFT_BOUND, y, GFF.RIGHT_BOUND, y);
            h.setOrigin(0, 0);
            h.setStrokeStyle(0xFF0000);
        }
        for (let x: number = GFF.LEFT_BOUND; x <= GFF.RIGHT_BOUND; x += 64) {
            const v = this.add.line(0, 0, x, GFF.TOP_BOUND, x, GFF.RIGHT_BOUND);
            v.setOrigin(0, 0);
            v.setStrokeStyle(0xFF0000);
        }
    }

    private rectColor: number = 0xff0000;
    private startPt: GPoint2D = {x: 0, y: 0};
    private endPt: GPoint2D = {x: 0, y: 0};
    private mouseMode: 'none'|'create'|'display' = 'none';
    private mouseRect: Phaser.GameObjects.Rectangle|null = null;
    private mouseText: Phaser.GameObjects.Text;
    private blockText: Phaser.GameObjects.Text;
    private zones: Phaser.GameObjects.Rectangle[] = [];
    /**
     * Call this in create() of any UI scene to assist with planning object locations
     */
    protected initDesignMode() {
        this.mouseText = this.add.text(0, 0, '', {
            color: '#ffffff',
            fontFamily: 'averia_serif',
            fontSize: '12px'
        }).setOrigin(0, 0);
        this.blockText = this.add.text(0, 16, '', {
            color: '#ffffff',
            fontFamily: 'averia_serif',
            fontSize: '12px'
        }).setOrigin(0, 0);

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            const iX: number = Math.floor(pointer.x);
            const iY: number = Math.floor(pointer.y);

            switch(this.mouseMode) {
                case 'none':
                    this.mouseText.text =`[${iX}, ${iY}]`;
                    this.blockText.text = `[${iX / 64}, ${iY / 64}]`;
                    this.blockText.setColor(
                        (iX / 64 === Math.floor(iX / 64))
                        && (iY / 64 === Math.floor(iY / 64))
                        ? '#00ff00' : '#ff0000'
                    );
                    break;
                case 'create':
                    if (this.mouseRect) {
                        this.endPt.x = iX;
                        this.endPt.y = iY;
                        this.mouseRect.width = this.endPt.x - this.startPt.x;
                        this.mouseRect.height = this.endPt.y - this.startPt.y;
                        this.mouseText.text = `[${this.startPt.x}, ${this.startPt.y}] - [${this.endPt.x}, ${this.endPt.y}]  (${this.mouseRect.width} x ${this.mouseRect.height})`;
                        this.blockText.text = `[${this.startPt.x / 64}, ${this.startPt.y / 64}] - [${this.endPt.x}, ${this.endPt.y}]  (${this.mouseRect.width / 64} x ${this.mouseRect.height / 64}`;
                        this.blockText.setColor(
                            (this.startPt.x / 64 === Math.floor(this.startPt.x / 64))
                            && (this.endPt.x / 64 === Math.floor(this.endPt.x / 64))
                            && (this.mouseRect.width / 64 === Math.floor(this.mouseRect.width / 64))
                            && (this.mouseRect.height / 64 === Math.floor(this.mouseRect.height / 64))
                            ? '#00ff00' : '#ff0000'
                        );
                    }
                    break;
                case 'display':
                    if (this.mouseRect) {
                        this.startPt.x = iX;
                        this.startPt.y = iY;
                        this.mouseRect.x = iX;
                        this.mouseRect.y = iY;
                        this.endPt.x = iX + this.mouseRect.width;
                        this.endPt.y = iY + this.mouseRect.height;
                        this.mouseText.text = `[${this.startPt.x}, ${this.startPt.y}] - [${this.endPt.x}, ${this.endPt.y}]  (${this.mouseRect.width} x ${this.mouseRect.height})`;
                        this.blockText.text = `[${this.startPt.x / 64}, ${this.startPt.y / 64}] - [${this.endPt.x}, ${this.endPt.y}]  (${this.mouseRect.width / 64} x ${this.mouseRect.height / 64}`;
                        this.blockText.setColor(
                            (this.startPt.x / 64 === Math.floor(this.startPt.x / 64))
                            && (this.endPt.x / 64 === Math.floor(this.endPt.x / 64))
                            && (this.mouseRect.width / 64 === Math.floor(this.mouseRect.width / 64))
                            && (this.mouseRect.height / 64 === Math.floor(this.mouseRect.height / 64))
                            ? '#00ff00' : '#ff0000'
                        );
                    }
                    break;
            }
        });
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            const iX: number = Math.floor(pointer.x);
            const iY: number = Math.floor(pointer.y);
            this.mouseText.text = `Start: [${iX}, ${iY}]`;
            this.startPt.x = iX;
            this.startPt.y = iY;

            if (this.mouseMode === 'none') {
                this.mouseMode = 'create';
                if (this.mouseRect === null) {
                    this.mouseRect = this.add.rectangle(iX, iY, 0, 0, this.rectColor, .3).setOrigin(0, 0);
                } else {
                    this.mouseRect.setVisible(true);
                    this.mouseRect.setPosition(iX, iY);
                    this.mouseRect.width = 0;
                    this.mouseRect.height = 0;
                }
            } else {
                this.mouseMode = 'none';
                if (this.mouseRect !== null) {
                    this.zones.push(this.mouseRect);
                    this.mouseRect = null;
                }
            }

        });
        this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            if (this.mouseRect !== null && this.mouseMode === 'create') {
                const iX: number = Math.floor(pointer.x);
                const iY: number = Math.floor(pointer.y);
                this.mouseText.text =`End: [${iX}, ${iY}]`;
                this.endPt.x = iX;
                this.endPt.y = iY;
                this.mouseMode = 'display';
            }
        });
        this.input.keyboard?.on('keydown-A', (event: KeyboardEvent) => {
            const rectanglesData = this.zones.map(rect => ({
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height
            }));

            // Convert the array to a JSON string
            const jsonData = JSON.stringify(rectanglesData, null, 2); // `null, 2` for pretty-printing

            const blob = new Blob([jsonData], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "zone_template_.json";
            link.click();
            URL.revokeObjectURL(url); // Clean up the URL after download

            this.zones = [];
        });
    }
}