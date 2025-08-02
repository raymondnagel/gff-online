import { GArea } from "../areas/GArea";
import { COLOR } from "../colors";
import { GInputMode } from "../GInputMode";
import { GRoom } from "../GRoom";
import { GFF } from "../main";
import { PLAYER } from "../player";
import { REGISTRY } from "../registry";
import { CardDir, Dir9, GPoint2D } from "../types";
import { GUIScene } from "./GUIScene";

const INPUT_DEFAULT: GInputMode = new GInputMode('map.default');
const CELL_Y_OFFSET: number = -4; // Account for iso-like overlap
const CELL_WIDTH: number = 32; // 16 wall sections, doubled
const CELL_HEIGHT: number = 22; // 11 wall sections, doubled
const WALL_SECTION_LENGTH: number = 2;
const BORDER_COVER_COLOR: number = 0xd4bd97;

export class GMapUI extends GUIScene {

    private mapScrollImage: Phaser.GameObjects.Image;
    private mapTitleText: Phaser.GameObjects.Text;
    private lowerTexture: Phaser.GameObjects.RenderTexture;
    private upperTexture: Phaser.GameObjects.RenderTexture;
    private wallGraphics: Phaser.GameObjects.Graphics;
    private currentLocIndicator: Phaser.GameObjects.Image;
    private area: GArea;
    private floor: number;

    constructor() {
        super("MapUI");

        this.setContainingMode(GFF.MAP_MODE);
    }

    public preload(): void {
        this.area = GFF.AdventureContent.getCurrentArea();
        this.floor = GFF.AdventureContent.getCurrentFloor();
    }

    public create(): void {
        super.create();
        this.add.image(0, 0, 'rock_bg').setOrigin(0, 0);
        this.add.text(512, 20, 'Map', {
            color: COLOR.GREY_1.str(),
            fontFamily: 'dyonisius',
            fontSize: '48px'
        }).setOrigin(.5, 0);

        this.mapScrollImage = this.add.image(GFF.GAME_W / 2, 80, 'map_scroll').setOrigin(.5, 0);
        this.mapTitleText = this.add.text(512, 172, this.area.getName(), {
            color: '#735e48',
            fontFamily: 'olde',
            fontSize: '42px'
        }).setOrigin(.5, 0);

        this.renderMap();

        this.setSubscreen();
        this.initInputMode();

        // this.initDesignMode();
        // this.createTileGuidelines();
    }

    /**
     * Map elements should be rendered in this order:
     * 1. terrain base    (lowerTexture)
     * 2. feature         (lowerTexture)
     * 3. terrain overlap (lowerTexture)
     * 4. walls           (wallGraphics)
     * 5. map edges       (upperTexture)
     * 6. overlays        (independent objects, possibly animated)
     */
    private renderMap() {
        const drawingDim: GPoint2D = this.getDrawingDimension();
        const ctrX: number = Math.floor(GFF.GAME_W / 2);
        const ctrY: number = 408;

        const horzRooms: number = this.area.getWidth();
        const vertRooms: number = this.area.getHeight();

        this.lowerTexture = this.add.renderTexture(Math.floor(ctrX - (drawingDim.x / 2)), Math.floor(ctrY - (drawingDim.y / 2)), drawingDim.x, drawingDim.y).setOrigin(0, 0);
        const mapTL: GPoint2D = this.lowerTexture.getTopLeft();
        this.wallGraphics = this.add.graphics().setPosition(mapTL.x - .5, mapTL.y + .5);
        this.upperTexture = this.add.renderTexture(mapTL.x, mapTL.y, drawingDim.x, drawingDim.y).setOrigin(0, 0);

        for (let y: number = 0; y < vertRooms; y++) {
            for (let x: number = 0; x < horzRooms; x++) {
                if (this.area.containsRoom(this.floor, x, y)) {
                    const room: GRoom = this.area.getRoomAt(this.floor, x, y) as GRoom;
                    const cellX: number = x * CELL_WIDTH;
                    const cellY: number = y * CELL_HEIGHT;

                    const terrain = room.getMapTerrain();
                    const feature = room.getMapFeature();

                    // Draw terrain base:
                    if (room.isDiscovered() || REGISTRY.getBoolean('isDebug')) {
                        this.lowerTexture.draw(terrain, cellX, cellY);
                    }

                    // Draw feature, if applicable:
                    if (feature) {
                        switch (feature) {
                            case 'map_blue_chest':
                            case 'map_red_chest':
                                // Chests are shown if the room is marked, regardless of discovery:
                                if (PLAYER.getMarkedChestRoom() === room) {
                                    this.lowerTexture.draw(feature, cellX, cellY);
                                }
                                break;
                            default:
                                // Other features are shown only if the room is discovered:
                                if (room.isDiscovered() || REGISTRY.getBoolean('isDebug')) {
                                    this.lowerTexture.draw(feature, cellX, cellY);
                                }
                                break;
                        }
                    }

                    // Draw the rest only if the room is discovered:
                    if (room.isDiscovered() || REGISTRY.getBoolean('isDebug')) {
                        // Draw terrain overlap:
                        this.lowerTexture.draw(terrain + '_overlap', cellX, cellY + CELL_Y_OFFSET);

                        // Draw walls, if applicable:
                        // (these need to be drawn over the overlaps, or wall sections may appear as holes when covered by overlaps)
                        this.drawWalls(room, cellX, cellY, this.wallGraphics);

                        // Draw map edges to make it not look so perfect:
                        this.drawMapEdgesForRoom(room, cellX, cellY, this.upperTexture);
                    }
                }
            }
        }

        // Add a border cover to cover up edge-wall artifacts caused by antialiasing:
        this.wallGraphics.lineStyle(1, BORDER_COVER_COLOR, 1);
        this.wallGraphics.strokeRect(0, -1, this.lowerTexture.width + 1, this.lowerTexture.height + 1);

        const room: GRoom|null = GFF.AdventureContent.getCurrentRoom();
        if (room) {
            const currentX: number = mapTL.x + (room.getX() * CELL_WIDTH) + (CELL_WIDTH / 2);
            const currentY: number = mapTL.y + 4 + (room.getY() * CELL_HEIGHT) + (CELL_HEIGHT / 2);
            this.currentLocIndicator = this.add.image(currentX, currentY, 'map_current').setOrigin(.5, 1);
            this.tweens.add({
                targets: this.currentLocIndicator,
                y: { from: currentY, to: currentY - 10 },
                duration: 350,
                yoyo: true,
                repeat: -1
            });
        }
    }

    private drawWalls(room: GRoom, cellX: number, cellY: number, wallGraphics: Phaser.GameObjects.Graphics) {
        let sections: boolean[];
        let wX: number = cellX;
        let wY: number = cellY;
        wallGraphics.lineStyle(1, 0x493726, .7);

        // Draw north wall:
        if (room.hasAnyWall(Dir9.N) || !room.hasTownAndTownNeighbor(Dir9.N)) {
            sections = room.getWallSections(Dir9.N);
            for (let s: number = 0; s < sections.length; s++) {
                if (sections[s]) {
                    wallGraphics.lineBetween(wX + (s * WALL_SECTION_LENGTH), wY, wX + WALL_SECTION_LENGTH + (s * WALL_SECTION_LENGTH), wY);
                }
            }
        }
        // Draw west wall:
        if (room.hasAnyWall(Dir9.W) || !room.hasTownAndTownNeighbor(Dir9.W)) {
            wX = cellX + 1;
            sections = room.getWallSections(Dir9.W);
            for (let s: number = 0; s < sections.length; s++) {
                if (sections[s]) {
                    wallGraphics.lineBetween(wX, wY + (s * WALL_SECTION_LENGTH), wX, wY + WALL_SECTION_LENGTH + (s * WALL_SECTION_LENGTH));
                }
            }
        }
        // Draw east wall:
        if (room.hasAnyWall(Dir9.E) || !room.hasTownAndTownNeighbor(Dir9.E)) {
            wX = cellX + CELL_WIDTH;
            sections = room.getWallSections(Dir9.E);
            for (let s: number = 0; s < sections.length; s++) {
                if (sections[s]) {
                    wallGraphics.lineBetween(wX, wY + (s * WALL_SECTION_LENGTH), wX, wY + WALL_SECTION_LENGTH + (s * WALL_SECTION_LENGTH));
                }
            }
        }
        // Draw south wall:
        if (room.hasAnyWall(Dir9.S) || !room.hasTownAndTownNeighbor(Dir9.S)) {
            wX = cellX;
            wY = cellY + CELL_HEIGHT - 1;
            sections = room.getWallSections(Dir9.S);
            for (let s: number = 0; s < sections.length; s++) {
                if (sections[s]) {
                    wallGraphics.lineBetween(wX + (s * WALL_SECTION_LENGTH), wY, wX + WALL_SECTION_LENGTH + (s * WALL_SECTION_LENGTH), wY);
                }
            }
        }
    }

    private drawMapEdgesForRoom(room: GRoom, cellX: number, cellY: number, mapTexture: Phaser.GameObjects.RenderTexture) {
        if (
            !room.hasNeighbor(Dir9.N) ||
            (!(room.getNeighbor(Dir9.N) as GRoom).isDiscovered() && !REGISTRY.getBoolean('isDebug'))
        ) {
            mapTexture.draw('map_edge_n', cellX, cellY);
        }
        if (
            !room.hasNeighbor(Dir9.W) ||
            (!(room.getNeighbor(Dir9.W) as GRoom).isDiscovered() && !REGISTRY.getBoolean('isDebug'))
        ) {
            mapTexture.draw('map_edge_w', cellX, cellY);
        }
        if (
            !room.hasNeighbor(Dir9.E) ||
            (!(room.getNeighbor(Dir9.E) as GRoom).isDiscovered() && !REGISTRY.getBoolean('isDebug'))
        ) {
            mapTexture.draw('map_edge_e', cellX, cellY);
        }
        if (
            !room.hasNeighbor(Dir9.S) ||
            (!(room.getNeighbor(Dir9.S) as GRoom).isDiscovered() && !REGISTRY.getBoolean('isDebug'))
        ) {
            mapTexture.draw('map_edge_s', cellX, cellY);
        }
    }

    private getDrawingDimension(): GPoint2D {
        const horzRooms: number = this.area.getWidth();
        const vertRooms: number = this.area.getHeight();
        let topMost: number = 100;
        let leftMost: number = 100;
        let rightMost: number = 0;
        let bottomMost: number = 0;

        for (let y: number = 0; y < vertRooms; y++) {
            for (let x: number = 0; x < horzRooms; x++) {
                if (this.area.containsRoom(this.floor, x, y)) {
                    topMost = Math.min(topMost, y);
                    leftMost = Math.min(leftMost, x);
                    rightMost = Math.max(rightMost, x);
                    bottomMost = Math.max(bottomMost, y);
                }
            }
        }

        return {
            x: Math.floor((rightMost + 1 - leftMost) * CELL_WIDTH),
            y: Math.floor((bottomMost + 1 - topMost) * CELL_HEIGHT)
        };
    }

    private saveMap() {
        this.sys.game.renderer.snapshotArea(
            this.lowerTexture.x, this.lowerTexture.y,
            this.lowerTexture.width, this.lowerTexture.height,
            (image: HTMLImageElement|Phaser.Display.Color) => {
                // Save the image as a base64 data URL
                let dataUrl = (image as HTMLImageElement).src;

                // Trigger a download
                let a = document.createElement('a');
                a.href = dataUrl;
                a.download = 'map.png';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        );
    }

    private initInputMode() {
        INPUT_DEFAULT.onKeyDown((keyEvent) => {
            if (keyEvent.key === 's') {
                this.saveMap();
            }
            this.sendPotentialHotkey(keyEvent);
        });
        INPUT_DEFAULT.addAllowedEvent('MOUSE_UI_BUTTON');
        this.setInputMode(INPUT_DEFAULT);
    }
}