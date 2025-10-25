import { BOOKS } from "../books";
import { COMMANDMENTS } from "../commandments";
import { ENEMY } from "../enemy";
import { GRoom } from "../GRoom";
import { GFF } from "../main";
import { RANDOM } from "../random";
import { GStrongholdRegion } from "../regions/GStrongholdRegion";
import { REGISTRY } from "../registry";
import { GPoint3D, GSpirit } from "../types";
import { GBuildingArea } from "./GBuildingArea";

const EMPTY_C = '0,0,0';
const ROOM_C = '1,1,1';
const ENTRANCE_C = '1,0,0';
const STAIRS_UP_C = '0,0,1';
const STAIRS_DOWN_C = '1,0,1';
const BOSS_C = '0,1,0';

export class GStrongholdArea extends GBuildingArea {
    private entranceRoom: GRoom;
    private bossRoom: GRoom;
    private armorKey: string;
    private region: GStrongholdRegion;
    private bossIndex: 0|1|2|3|4|5|6;

    constructor(strongholdName: string, bossIndex: 0|1|2|3|4|5|6, region: GStrongholdRegion, armorKey: string, width: number, height: number, groundFloor: number, floorImageKeys: string[]) {
        super(
            strongholdName,
            'stronghold',
            floorImageKeys.length,
            width,
            height
        );
        this.region = region;
        this.bossIndex = bossIndex;
        this.armorKey = armorKey;
        this.setGroundFloor(groundFloor);
        this.loadFloors(floorImageKeys);
        this.createShrines();
    }

    public isSafe(): boolean {
        return false;
    }

    public getEntranceRoom(): GRoom {
        return this.entranceRoom;
    }

    public getBossRoom(): GRoom {
        return this.bossRoom;
    }

    public getBossSpirit(): GSpirit {
        return ENEMY.BOSS_SPIRITS[this.bossIndex];
    }

    protected initRoom(room: GRoom): void {
        super.initRoom(room);
        room.setRegion(this.region);
    }

    protected loadFloors(floorImageKeys: string[]): void {
        const staircases: GPoint3D[] = [];

        const canvasTex = GFF.GAME.textures.createCanvas('floorPxMapCanvas', this.getWidth(), this.getHeight()) as Phaser.Textures.CanvasTexture;
        const ctx = canvasTex.getContext();
        for (let i = 0; i < floorImageKeys.length; i++) {
            const floorImageKey = floorImageKeys[i];
            staircases.push(...this.loadFloor(floorImageKey, i, ctx));
        }
        GFF.GAME.textures.remove('floorPxMapCanvas');

        // After all rooms are created, link the staircases.
        for (const stairPt of staircases) {
            const lowerRoom = this.getRoomAt(stairPt.z, stairPt.x, stairPt.y);
            const upperRoom = this.getRoomAt(stairPt.z + 1, stairPt.x, stairPt.y);
            if (lowerRoom && upperRoom) {
                GRoom.createPortal(lowerRoom, upperRoom);
            } else {
                console.warn(`Staircase at (${stairPt.x},${stairPt.y},${stairPt.z}) is missing a connecting room.`);
            }
        }
    }

    protected loadFloor(floorImageKey: string, floorIndex: number, ctx: CanvasRenderingContext2D): GPoint3D[] {
        const staircases: GPoint3D[] = [];
        const img = GFF.GAME.textures.get(floorImageKey).getSourceImage() as HTMLImageElement;
        ctx.clearRect(0, 0, this.getWidth(), this.getHeight());
        ctx.drawImage(img, 0, 0);
        for (let y = 0; y < this.getHeight(); y++) {
                for (let x = 0; x < this.getWidth(); x++) {
                const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
                const key = `${r > 100 ? 1 : 0},${g > 100 ? 1 : 0},${b > 100 ? 1 : 0}`;
                // console.log(`Pixel at (${x},${y},${floorIndex}): ${key}`);
                switch (key) {
                    case EMPTY_C:
                        break;
                    case ROOM_C:
                    case STAIRS_DOWN_C:
                        this.createRoom(floorIndex, x, y);
                        break;
                    case STAIRS_UP_C:
                        this.createRoom(floorIndex, x, y);
                        staircases.push({x, y, z: floorIndex});
                        break;
                    case ENTRANCE_C:
                        this.entranceRoom = this.createRoom(floorIndex, x, y);
                        break;
                    case BOSS_C:
                        this.bossRoom = this.createRoom(floorIndex, x, y);
                        this.bossRoom.planCenteredPremiumChestShrine(this.armorKey, 'gold');
                        break;
                }
            }
        }
        this.createOuterBorder(floorIndex);
        return staircases;
    }

    private createShrines(): void {
        // Decide where premium treasure chests are going:
        // There are 8 in each stronghold: 7 books and 1 commandment.
        let room: GRoom|null = null;

        // For 7 books:
        for (let b: number = 0; b < 7; b++) {
            // Try to find a place to put the chest:
            while (!room || !room.canHavePremiumChest()) {
                room = this.getRandomRoom();
            }
            const book: string|undefined = REGISTRY.get('booksOrder') === 'canonical' ?
                'NEXT_BOOK' :
                BOOKS.getNextBookToFind();

            if (book !== undefined) {
                room.planCenteredPremiumChestShrine(book, 'red');
            }
        }

        // For 1 commandment:
        while (!room || !room.canHavePremiumChest()) {
            room = this.getRandomRoom();
        }
        const commandment: string|undefined = COMMANDMENTS.getNextCommandmentToFind();
        if (commandment !== undefined) {
            room.planCenteredPremiumChestShrine(commandment, 'purple');
        }
    }

    protected createRoom(floor: number, x: number, y: number): GRoom {
        const room = new GRoom(floor, x, y, this);
        this.setRoom(floor, x, y, room);
        this.initRoom(room);
        return room;
    }
}
