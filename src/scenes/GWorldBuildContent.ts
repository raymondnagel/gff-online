import 'phaser';
import { GBaseScene } from './GBaseScene';
import { AREA } from '../area';
import { GWorldArea } from '../areas/GWorldArea';
import { GFF } from '../main';
import { GArea } from '../areas/GArea';
import { GInputMode } from '../GInputMode';
import { GChurchArea } from '../areas/GChurchArea';
import { TOWN } from '../town';
import { GStrongholdArea } from '../areas/GStrongholdArea';
import { GTowerRegion } from '../regions/GTowerRegion';
import { GDungeonRegion } from '../regions/GDungeonRegion';
import { GKeepRegion } from '../regions/GKeepRegion';
import { GFortressRegion } from '../regions/GFortressRegion';
import { GCastleRegion } from '../regions/GCastleRegion';
import { RANDOM } from '../random';
import { COLOR } from '../colors';

type AreaGenInfo = { area: GArea, rooms: number };

const INPUT_DISABLED: GInputMode = new GInputMode('worldbuild.disabled');
const INPUT_PROMPTENTER: GInputMode = new GInputMode('worldbuild.prompt_enter');

const LOAD_COLOR: number     = COLOR.WHITE.num();
const PROGRESS_COLOR: number = COLOR.GREY_3.num();
const PROGRESS_LENGTH: number = 512;

export class GWorldBuildContent extends GBaseScene {
    private bgImage: Phaser.GameObjects.Image;
    private loadBar: Phaser.GameObjects.Rectangle;
    private progressBar: Phaser.GameObjects.Rectangle;
    private progressText: Phaser.GameObjects.Text;
    private promptText: Phaser.GameObjects.Text;
    private titleText: Phaser.GameObjects.Text;

    constructor() {
        super("WorldBuildContent");
        this.setContainingMode(GFF.WORLDBUILD_MODE);
        GFF.genLog('GWorldBuildContent constructed');
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
                    this.time.delayedCall(500, () => {
                        GFF.ADVENTURE_MODE.switchTo(GFF.WORLDBUILD_MODE);
                    });
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
        const bgImageKey = `load_bg_${RANDOM.randInt(1, 4)}`;
        this.bgImage = this.add.image(0, 0, bgImageKey).setOrigin(0, 0);

        this.titleText = this.add.text(GFF.GAME_W / 2, GFF.GAME_H / 2, 'Generating a new world...', {
            fontFamily: 'dyonisius',
            fontSize: 36,
            color: COLOR.WHITE.str(),
            stroke: COLOR.GREY_1.str(),
            strokeThickness: 6
        }).setOrigin(.5, .5);

        this.loadBar = this.add.rectangle(
            GFF.GAME_W / 2,
            GFF.GAME_H - 20,
            PROGRESS_LENGTH + 4,
            32,
            LOAD_COLOR
        ).setOrigin(.5, 1);

        this.progressBar = this.add.rectangle(
            (GFF.GAME_W / 2) - (PROGRESS_LENGTH / 2),
            GFF.GAME_H - 22,
            0,
            28,
            PROGRESS_COLOR
        ).setOrigin(0, 1);

        this.progressText = this.add.text(
            GFF.GAME_W / 2,
            GFF.GAME_H - 36,
            '0%',
            { fontFamily: 'oxygen', fontSize: 14, color: COLOR.BLACK.str() }
        ).setOrigin(.5, .5);

        this.promptText = this.add.text(GFF.GAME_W / 2, GFF.GAME_H / 2, 'Press Enter to start!', {
            fontFamily: 'dyonisius',
            fontSize: 36,
            color: COLOR.WHITE.str(),
            stroke: COLOR.GREY_1.str(),
            strokeThickness: 6
        }).setOrigin(.5, .5).setAlpha(0);
    }

    public setProgress(description: string, current: number, goal: number) {
        const ratio: number = current / goal;
        this.progressBar.width = ratio * PROGRESS_LENGTH;

        // Calculate the percent:
        const percent: number = Math.floor(ratio * 100);
        this.progressText.setText(`${description}: ${percent}%`);
    }

    private areaList: AreaGenInfo[];
    public create(): void {
        GFF.genLog('GWorldBuildContent.create()');

        // Fade in the scene, then start building the world:
        this.fadeIn(1000, undefined, () => {
            this.buildWorld();
        });
    }

    private buildWorld() {
        // Church Areas (will be assigned to churches once they are created)
        AREA.CHURCH_AREAS = [];
        for (let c = 0; c < TOWN.TOWN_COUNT; c++) {
            AREA.CHURCH_AREAS.push(new GChurchArea());
        }

        // Stronghold Areas (will be assigned to strongholds once they are created)
        AREA.TOWER_AREA = new GStrongholdArea('Tower of Deception', 0, new GTowerRegion(), 'armor_6', 3, 3, 0, [
            'tower_0',
            'tower_1',
            'tower_2',
            'tower_3',
            'tower_4',
            'tower_5',
            'tower_6',
        ]);
        AREA.DUNGEON_AREA = new GStrongholdArea('Dungeon of Doubt', 1, new GDungeonRegion(), 'armor_3', 7, 5, 1, [
            'dungeon_0',
            'dungeon_1',
        ]);
        AREA.KEEP_AREA = new GStrongholdArea('Keep of Wickedness', 2, new GKeepRegion(), 'armor_4', 9, 9, 0, [
            'keep_0',
        ]);
        AREA.FORTRESS_AREA = new GStrongholdArea('Fortress of Enmity', 3, new GFortressRegion(), 'armor_5', 11, 9, 0, [
            'fortress_0'
        ]);
        AREA.CASTLE_AREA = new GStrongholdArea('Castle of Perdition', 4, new GCastleRegion(), 'armor_2', 9, 9, 0, [
            'castle_0',
            'castle_1',
            'castle_2',
        ]);

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
            { area: AREA.TOWER_AREA, rooms: 63 },
            { area: AREA.DUNGEON_AREA, rooms: 70 },
            { area: AREA.KEEP_AREA, rooms: 81 },
            { area: AREA.FORTRESS_AREA, rooms: 83 },
            { area: AREA.CASTLE_AREA, rooms: 113 },
            { area: AREA.WORLD_AREA, rooms: 256 },
        ];
        // Total rooms: 10 + 63 + 70 + 81 + 83 + 113 + 256 = 676

        this.buildArea(0);
    }

    private buildArea(areaIndex: number) {
        const area: GArea = this.areaList[areaIndex].area;
        const rooms: number = this.areaList[areaIndex].rooms;
        let roomCount: number = 0;

        // Builds map, floors, walls - everything except room contents
        area.generate();

        // Furnishing rooms is the bulk of the work, so that's what we'll show progress for.
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