import { AREA } from "../area";
import { COLOR } from "../colors";
import { GInputMode } from "../GInputMode";
import { GRoom } from "../GRoom";
import { GTown } from "../GTown";
import { GFF } from "../main";
import { GOptionGroup } from "../objects/components/GOptionGroup";
import { GPersonFile } from "../objects/components/GPersonFile";
import { GScrollPane } from "../objects/components/GScrollPane";
import { GTextOptionButton } from "../objects/components/GTextOptionButton";
import { PEOPLE } from "../people";
import { PLAYER } from "../player";
import { TOWN } from "../town";
import { GPerson } from "../types";
import { GUIScene } from "./GUIScene";

type TownSpot = {
    town: GTown;
    spot: Phaser.GameObjects.Rectangle;
}

const INPUT_DEFAULT: GInputMode = new GInputMode('people.default');
const MAP_CELL_W: number = 12;
const MAP_CELL_H: number = 8;

export class GPeopleUI extends GUIScene {

    private miniMap: Phaser.GameObjects.RenderTexture;
    private townsGroup: GOptionGroup;
    private peopleScrollPane: GScrollPane;
    private personFiles: GPersonFile[] = [];
    private townSpots: TownSpot[] = [];
    private townsTitle: Phaser.GameObjects.Text;
    private citizensTitle: Phaser.GameObjects.Text;

    constructor() {
        super("PeopleUI");

        this.setContainingMode(GFF.PEOPLE_MODE);
    }

    public preload(): void {
    }

    public create(): void {
        super.create();
        this.add.image(0, 0, 'people_subscreen_bg').setOrigin(0, 0);
        this.add.text(512, 20, 'People', {
            color: COLOR.GREY_1.str(),
            fontFamily: 'dyonisius',
            fontSize: '48px'
        }).setOrigin(.5, 0);

        this.townsTitle = this.add.text(260, 114, 'Towns', {
            color: COLOR.GREY_1.str(),
            fontFamily: 'dyonisius',
            fontSize: '24px'
        }).setOrigin(.5, 1);

        this.citizensTitle = this.add.text(624, 114, 'Citizens of Town', {
            color: COLOR.GREY_1.str(),
            fontFamily: 'dyonisius',
            fontSize: '24px'
        }).setOrigin(.5, 1);

        this.initTownList();
        this.initPeopleList();
        this.initMinimap();
        this.townsGroup.selectNext(true);

        this.setSubscreen();
        this.initInputMode();
        //this.createTileGuidelines();
    }

    private initTownList() {
        // Only list towns that have been discovered
        const towns: GTown[] = TOWN.getDiscoveredTowns();

        this.townsGroup = new GOptionGroup();
        let buttonY: number = 275;
        for (const town of towns) {
            const button: GTextOptionButton = new GTextOptionButton(this, 162, buttonY, town.getName(), () => {
                this.setActiveTown(town);
            }, {
                color: '#000000',
                backgroundColor: '#555555',
                fontFamily: 'dyonisius',
                fontSize: '24px',
                padding: {
                    top: 6,
                    left: 6,
                    right: 6,
                    bottom: 6
                }
            });
            button.setOptionGroup(this.townsGroup);
            button.setSize(196, button.height)
            buttonY += button.height + 4;
        }
    }

    private getTownButton(town: GTown): GTextOptionButton {
        // Find the town button by matching the town name:
        return this.townsGroup.getOptions().find(btn => btn.getText() === town.getName()) as GTextOptionButton;
    }

    private initPeopleList() {
        this.peopleScrollPane = new GScrollPane(this, 386, 124, 476, 524, 0);
    }

    private updatePeopleList(town: GTown) {
        // Get a sorted list of all known people in the town, both sinners and saints
        const allPeople: GPerson[] = this.getKnownPeopleInTown(town);

        // Clear the current list
        this.peopleScrollPane.removeAll();
        for(const personFile of this.personFiles) {
            personFile.destroy();
        }
        this.personFiles = [];

        // Add each person file to the scroll pane
        const scrollPaneWidth: number = this.peopleScrollPane.width - 16; // Account for scrollbar width
        for (let p = 0; p < allPeople.length; p++) {
            const personFile: GPersonFile = new GPersonFile(this, 0, p * 140, scrollPaneWidth, allPeople[p]);
            this.personFiles.push(personFile);
            this.peopleScrollPane.addContent(personFile);
        }
    }

    private initMinimap() {
        const mapBorder: Phaser.GameObjects.Rectangle = this.add.rectangle(160, 122, (MAP_CELL_W * 16) + 8, (MAP_CELL_H * 16) + 8, 0x634d34).setOrigin(0, 0);
        const mapBg: Phaser.GameObjects.Rectangle = this.add.rectangle(164, 126, MAP_CELL_W * 16, MAP_CELL_H * 16, 0xd2b993).setOrigin(0, 0);
        this.miniMap = this.add.renderTexture(mapBg.x, mapBg.y, mapBg.width, mapBg.height).setOrigin(0, 0).setAbove(mapBg);
        const horzRooms: number = AREA.WORLD_AREA.getWidth();
        const vertRooms: number = AREA.WORLD_AREA.getHeight();

        for (let y: number = 0; y < vertRooms; y++) {
            for (let x: number = 0; x < horzRooms; x++) {
                const room: GRoom = AREA.WORLD_AREA.getRoomAt(0, x, y) as GRoom;
                const cellX: number = x * MAP_CELL_W;
                const cellY: number = y * MAP_CELL_H;
                const terrain: string = `mini_${room.getMapTerrain()}`;

                // Draw terrain base:
                if (room.isDiscovered() || GFF.debugMode) {
                    this.miniMap.draw(terrain, cellX, cellY);
                }
            }
        }

        // Create town spots
        this.townSpots = [];
        const towns: GTown[] = TOWN.getDiscoveredTowns();
        for (const town of towns) {
            const townCenter: GRoom = town.getChurch().getWorldRoom();
            const x = mapBg.x + (townCenter.getX() * MAP_CELL_W);
            const y = mapBg.y + (townCenter.getY() * MAP_CELL_H);
            const townSpot: Phaser.GameObjects.Rectangle = this.add.rectangle(x, y, MAP_CELL_W, MAP_CELL_H, COLOR.BLACK.num(), 1).setOrigin(0, 0);
            townSpot.setInteractive();
            townSpot.on('pointerdown', () => {
                this.setActiveTown(town, true);
            });
            this.townSpots.push({ town, spot: townSpot });
        }
    }

    private setActiveTown(town: GTown, selectInList: boolean = false) {
        this.citizensTitle.setText(`Citizens of ${town.getName()}`);
        this.tweens.killAll();
        this.updatePeopleList(town);
        this.townSpots.forEach(ts => ts.spot.setFillStyle(COLOR.BLACK.num(), 1) && ts.spot.setAlpha(1));
        // Start a tween to flash the active town spot
        const townSpot: Phaser.GameObjects.Rectangle = this.getTownSpot(town);
        townSpot.setFillStyle(COLOR.RED.num(), 1);

        if (selectInList) {
           this.getTownButton(town).select(false);
        }

        this.tweens.add({
            targets: townSpot,
            alpha: { from: 0, to: 1 },
            duration: 250,
            yoyo: true,
            repeat: -1
        });
    }

    private getTownSpot(town: GTown): Phaser.GameObjects.Rectangle {
        let townSpot: TownSpot = this.townSpots.find(ts => ts.town === town) as TownSpot;
        return townSpot.spot;
    }

    private getKnownPeopleInTown(town: GTown): GPerson[] {
        const sinners: GPerson[] = town.getPeople().filter(person => person.familiarity > 0)
        const saints: GPerson[] = town.getChurch().getPeople().filter(person => person.familiarity > 0);
        return sinners.concat(saints).sort((a, b) => {
            const nameA = PEOPLE.getNameForProfile(a);
            const nameB = PEOPLE.getNameForProfile(b);
            if (nameA === '???' && nameB !== '???') return 1;
            if (nameB === '???' && nameA !== '???') return -1;
            return nameA.localeCompare(nameB);
        });
    }

    private initInputMode() {
        INPUT_DEFAULT.onKeyDown((keyEvent) => {
            this.sendPotentialHotkey(keyEvent);
        });
        INPUT_DEFAULT.addAllowedEvent('MOUSE_UI_BUTTON');
        this.setInputMode(INPUT_DEFAULT);
    }
}