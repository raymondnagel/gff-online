import { GArea } from "../GArea";
import { GDirection } from "../GDirection";
import { GInputMode } from "../GInputMode";
import { GRandom } from "../GRandom";
import { GRoom } from "../GRoom";
import { GFF } from "../main";
import { CardDir, GPoint } from "../types";
import { GUIScene } from "./GUIScene";

const INPUT_DEFAULT: GInputMode = new GInputMode('map.default');
const CELL_Y_OFFSET: number = -4; // Account for iso-like overlap
const CELL_WIDTH: number = 32; // 16 wall sections, doubled
const CELL_HEIGHT: number = 22; // 11 wall sections, doubled
const WALL_SECTION_LENGTH: number = 2;

export class GMapUI extends GUIScene {

    private mapScrollImage: Phaser.GameObjects.Image;
    private mapTitleText: Phaser.GameObjects.Text;
    private area: GArea;

    constructor() {
        super("MapUI");

        this.setContainingMode(GFF.MAP_MODE);
    }

    public preload(): void {
        this.area = GFF.AdventureContent.getCurrentArea();
    }

    public create(): void {
        super.create();
        this.add.image(0, 0, 'rock_bg').setOrigin(0, 0);
        this.add.text(512, 20, 'Map', {
            color: '#333333',
            fontFamily: 'dyonisius',
            fontSize: '48px'
        }).setOrigin(.5, 0);

        this.mapScrollImage = this.add.image(GFF.GAME_W / 2, 80, 'map_scroll').setOrigin(.5, 0);
        this.mapTitleText = this.add.text(512, 172, this.area.getName(), {
            color: '#8e7143',
            fontFamily: 'olde',
            fontSize: '42px'
        }).setOrigin(.5, 0);

        this.renderMap();

        this.setSubscreen();
        this.initInputMode();

        this.initDesignMode();
        //this.createTileGuidelines();

    }

    /**
     * Map elements should be rendered in this order:
     * 1. terrain base    (lowerTexture)
     * 2. feature         (lowerTexture)
     * 3. walls           (wallGraphics)
     * 4. terrain overlap (upperTexture)
     * 5. map edges       (upperTexture)
     * 6. overlays        (independent objects, possibly animated)
     */
    private renderMap() {
        const drawingDim: GPoint = this.getDrawingDimension();
        const ctrX: number = GFF.GAME_W / 2;
        const ctrY: number = 408;

        const horzRooms: number = this.area.getWidth();
        const vertRooms: number = this.area.getHeight();

        const lowerTexture: Phaser.GameObjects.RenderTexture = this.add.renderTexture(ctrX, ctrY, drawingDim.x, drawingDim.y).setOrigin(.5, .5);
        const textureTL: GPoint = lowerTexture.getTopLeft();
        // If using global antialiasing, add .5 to each coordinate and decrease length of wall section lines by 1:
        const wallGraphics: Phaser.GameObjects.Graphics = this.add.graphics().setPosition(textureTL.x, textureTL.y);
        const upperTexture: Phaser.GameObjects.RenderTexture = this.add.renderTexture(ctrX, ctrY, drawingDim.x, drawingDim.y).setOrigin(.5, .5);


        for (let y: number = 0; y < vertRooms; y++) {
            for (let x: number = 0; x < horzRooms; x++) {
                if (this.area.containsRoom(x, y)) {
                    const room: GRoom = this.area.getRoomAt(x, y) as GRoom;
                    const cellX: number = x * CELL_WIDTH;
                    const cellY: number = y * CELL_HEIGHT;

                    const terrain = GRandom.randElement(['map_plain', 'map_forest', 'map_desert', 'map_swamp', 'map_tundra', 'map_mountain']) as string;
                    const feature = GRandom.randElement(['map_church', 'map_town', 'map_hold']) as string;
                    const wallDir = GRandom.randElement([GDirection.Dir9.N, GDirection.Dir9.E, GDirection.Dir9.W, GDirection.Dir9.S]) as CardDir;
                    room.setFullWall(wallDir);

                    // Draw terrain base:
                    lowerTexture.draw(terrain, cellX, cellY);

                    // Draw feature, if applicable:
                    if (GRandom.randPct() > .9) {
                        lowerTexture.draw(feature, cellX, cellY);
                    }

                    // Draw walls, if applicable:
                    // (Since terrain now overlaps to the north, walls will be placed over the overlap,
                    // which will look weird. If walls are drawn, the overlaps will need to be separate
                    // from the main terrain images, so they can be drawn on top of the walls. Features
                    // should then fit within the cell size, or we'll need to do the same thing with them.)
                    this.drawWalls(room, cellX, cellY, wallGraphics);

                    // Draw terrain overlap:
                    upperTexture.draw(terrain + '_overlap', cellX, cellY + CELL_Y_OFFSET);

                    // Draw map edges to make it not look so perfect:
                    // (Since edges are drawn to mapTexture, they will appear under the walls; i.e. walls will always appear fully opaque).
                    // To make walls subject to fading, you would have to make another renderTexture on top of the graphics, just for fades.
                    this.drawMapEdgesForRoom(room, cellX, cellY, upperTexture);
                }
            }
        }
    }

    private drawWalls(room: GRoom, cellX: number, cellY: number, mapGraphics: Phaser.GameObjects.Graphics) {
        let sections: boolean[];
        let wX: number = cellX;
        let wY: number = cellY;
        mapGraphics.lineStyle(1, 0x433223, 1);

        // Draw north wall:
        if (room.hasAnyWall(GDirection.Dir9.N)) {
            sections = room.getWallSections(GDirection.Dir9.N);
            for (let s: number = 0; s < sections.length; s++) {
                if (sections[s]) {
                    mapGraphics.lineBetween(wX + (s * WALL_SECTION_LENGTH), wY, wX + WALL_SECTION_LENGTH + (s * WALL_SECTION_LENGTH), wY);
                }
            }
        }
        // Draw west wall:
        if (room.hasAnyWall(GDirection.Dir9.W)) {
            sections = room.getWallSections(GDirection.Dir9.W);
            for (let s: number = 0; s < sections.length; s++) {
                if (sections[s]) {
                    mapGraphics.lineBetween(wX, wY + (s * WALL_SECTION_LENGTH), wX, wY + WALL_SECTION_LENGTH + (s * WALL_SECTION_LENGTH));
                }
            }
        }
        // Draw east wall:
        if (room.hasAnyWall(GDirection.Dir9.E)) {
            wX = cellX + CELL_WIDTH;
            sections = room.getWallSections(GDirection.Dir9.E);
            for (let s: number = 0; s < sections.length; s++) {
                if (sections[s]) {
                    mapGraphics.lineBetween(wX, wY + (s * WALL_SECTION_LENGTH), wX, wY + WALL_SECTION_LENGTH + (s * WALL_SECTION_LENGTH));
                }
            }
        }
        // Draw south wall:
        if (room.hasAnyWall(GDirection.Dir9.S)) {
            wX = cellX;
            wY = cellY + CELL_HEIGHT;
            sections = room.getWallSections(GDirection.Dir9.S);
            for (let s: number = 0; s < sections.length; s++) {
                if (sections[s]) {
                    mapGraphics.lineBetween(wX + (s * WALL_SECTION_LENGTH), wY, wX + WALL_SECTION_LENGTH + (s * WALL_SECTION_LENGTH), wY);
                }
            }
        }
    }

    private drawMapEdgesForRoom(room: GRoom, cellX: number, cellY: number, mapTexture: Phaser.GameObjects.RenderTexture) {
        if (!room.hasNeighbor(GDirection.Dir9.N)) {
            mapTexture.draw('map_edge_n', cellX, cellY);
        }
        if (!room.hasNeighbor(GDirection.Dir9.W)) {
            mapTexture.draw('map_edge_w', cellX, cellY);
        }
        if (!room.hasNeighbor(GDirection.Dir9.E)) {
            mapTexture.draw('map_edge_e', cellX, cellY);
        }
        if (!room.hasNeighbor(GDirection.Dir9.S)) {
            mapTexture.draw('map_edge_s', cellX, cellY);
        }
    }

    private getDrawingDimension(): GPoint {
        const horzRooms: number = this.area.getWidth();
        const vertRooms: number = this.area.getHeight();
        let topMost: number = 100;
        let leftMost: number = 100;
        let rightMost: number = 0;
        let bottomMost: number = 0;

        for (let y: number = 0; y < vertRooms; y++) {
            for (let x: number = 0; x < horzRooms; x++) {
                if (this.area.containsRoom(x, y)) {
                    topMost = Math.min(topMost, y);
                    leftMost = Math.min(leftMost, x);
                    rightMost = Math.max(rightMost, x);
                    bottomMost = Math.max(bottomMost, y);
                }
            }
        }

        return {
            x: (rightMost + 1 - leftMost) * CELL_WIDTH,
            y: (bottomMost + 1 - topMost) * CELL_HEIGHT
        };
    }

    private initInputMode() {
        INPUT_DEFAULT.onKeyDown((keyEvent) => {
            this.sendPotentialHotkey(keyEvent);
        });
        INPUT_DEFAULT.addAllowedEvent('MOUSE_UI_BUTTON');
        this.setInputMode(INPUT_DEFAULT);
    }
}