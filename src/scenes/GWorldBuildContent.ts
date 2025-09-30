import 'phaser';
import { GBaseScene } from './GBaseScene';
import { AREA } from '../area';
import { GWorldArea } from '../areas/GWorldArea';
import { GFF } from '../main';
import { GArea } from '../areas/GArea';
import { GInputMode } from '../GInputMode';
import { CHURCH } from '../church';
import { GChurchArea } from '../areas/GChurchArea';
import { TOWN } from '../town';

type AreaGenInfo = { area: GArea, rooms: number };

const INPUT_DISABLED: GInputMode = new GInputMode('worldbuild.disabled');
const INPUT_PROMPTENTER: GInputMode = new GInputMode('worldbuild.prompt_enter');

const LOAD_COLOR: number     = 0xffffff;
const PROGRESS_COLOR: number = 0x00c220;
const PROGRESS_LENGTH: number = 512;

export class GWorldBuildContent extends GBaseScene {
    private loadBar: Phaser.GameObjects.Rectangle;
    private progressBar: Phaser.GameObjects.Rectangle;
    private progressText: Phaser.GameObjects.Text;
    private promptText: Phaser.GameObjects.Text;
    private titleText: Phaser.GameObjects.Text;

    constructor() {
        super("WorldBuildContent");
        this.setContainingMode(GFF.WORLDBUILD_MODE);
    }

    public preload(): void {
        this.createObjects();
        this.initInputModes();
        this.setInputMode(INPUT_DISABLED);
    }

    private initInputModes() {
        // INPUT_PROMPTENTER is active while waiting for the user to press Enter:
        INPUT_PROMPTENTER.setScene(this);
        INPUT_PROMPTENTER.onKeyDown((keyEvent: KeyboardEvent) => {
            if (keyEvent.key === 'Enter') {
                this.setInputMode(INPUT_DISABLED);
                this.tweens.killAll();
                this.promptText.setAlpha(1);
                this.fadeOut(1000, undefined, () => {
                    GFF.ADVENTURE_MODE.switchTo(GFF.WORLDBUILD_MODE);
                });
            }
        });

        // INPUT_DISABLED is active during world-building;
        // no additional initialization is needed, since it won't do anything.
        INPUT_DISABLED.setScene(this);

        // Send keyboard input to the current InputMode:
        this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
            this.getInputMode()?.processKeyDown(event);
        });
    }

    private createObjects() {
        this.titleText = this.add.text(GFF.GAME_W / 2, 300, 'Generating a new world...', {
            fontFamily: 'dyonisius',
            fontSize: 36,
            color: '#ffffff'
        }).setOrigin(.5, .5);

        this.loadBar = this.add.rectangle(
            GFF.GAME_W / 2,
            GFF.GAME_H / 2,
            PROGRESS_LENGTH + 4,
            60,
            LOAD_COLOR
        ).setOrigin(.5, .5);

        this.progressBar = this.add.rectangle(
            (GFF.GAME_W / 2) - (PROGRESS_LENGTH / 2),
            GFF.GAME_H / 2,
            0,
            56,
            PROGRESS_COLOR
        ).setOrigin(0, .5);

        this.progressText = this.add.text(
            GFF.GAME_W / 2,
            GFF.GAME_H / 2,
            '0%',
            { fontFamily: 'oxygen', fontSize: 22, color: '#000000' }
        ).setOrigin(.5, .5);

        this.promptText = this.add.text(GFF.GAME_W / 2, GFF.GAME_H / 2, 'Press Enter to start!', {
            fontFamily: 'dyonisius',
            fontSize: 36,
            color: '#ffffff'
        }).setOrigin(.5, .5).setAlpha(0);
    }

    public setProgress(description: string, current: number, goal: number) {
        const ratio: number = current / goal;
        this.progressBar.width = ratio * PROGRESS_LENGTH;
        this.progressText.setText(description + `: ${current} of ${goal}`);
    }

    private areaList: AreaGenInfo[];
    public create(): void {
        GFF.log('GWorldBuildContent.create()');

        // Church Areas (will be assigned to churches once they are created)
        AREA.CHURCH_AREAS = [];
        for (let c = 0; c < TOWN.TOWN_COUNT; c++) {
            AREA.CHURCH_AREAS.push(new GChurchArea());
        }

        // World Area
        AREA.WORLD_AREA = new GWorldArea();

        this.areaList = [
             { area: AREA.CHURCH_AREAS[0], rooms: 1 },
             { area: AREA.CHURCH_AREAS[1], rooms: 1 },
             { area: AREA.CHURCH_AREAS[2], rooms: 1 },
             { area: AREA.CHURCH_AREAS[3], rooms: 1 },
             { area: AREA.CHURCH_AREAS[4], rooms: 1 },
             { area: AREA.CHURCH_AREAS[5], rooms: 1 },
             { area: AREA.CHURCH_AREAS[6], rooms: 1 },
             { area: AREA.CHURCH_AREAS[7], rooms: 1 },
             { area: AREA.CHURCH_AREAS[8], rooms: 1 },
             { area: AREA.CHURCH_AREAS[9], rooms: 1 },
             { area: AREA.WORLD_AREA, rooms: 256 },
        ];

        this.buildArea(0);
    }

    private buildArea(areaIndex: number) {
        const area: GArea = this.areaList[areaIndex].area;
        const rooms: number = this.areaList[areaIndex].rooms;
        let roomCount: number = 0;
        const timer: Phaser.Time.TimerEvent = this.time.addEvent({
            callback: () => {
                if (area.furnishNextRoom()) {
                    roomCount++;
                    this.setProgress(area.getName(), roomCount, rooms);
                } else {
                    timer.destroy();
                    if (areaIndex < this.areaList.length - 1) {
                        this.buildArea(areaIndex + 1);
                    } else {
                        this.time.delayedCall(500, () => {
                            this.loadBar.setVisible(false);
                            this.progressBar.setVisible(false);
                            this.progressText.setVisible(false);
                            this.titleText.setVisible(false);
                            this.setInputMode(INPUT_PROMPTENTER);
                            this.tweens.add({
                                targets: this.promptText,
                                alpha: { from: 0, to: 1 },
                                duration: 700,
                                yoyo: true,
                                repeat: -1,
                                ease: 'Linear'
                            });
                        })
                    }
                }
            },
            delay: 5,
            loop: true,
        });
    }
}