import { ARRAY } from "../array";
import { BOOKS } from "../books";
import { COLOR } from "../colors";
import { COMMANDMENTS } from "../commandments";
import { DIRECTION } from "../direction";
import { ENEMY } from "../enemy";
import { GRoom } from "../GRoom";
import { GFF } from "../main";
import { RANDOM } from "../random";
import { GSector } from "../regions/GSector";
import { GStrongholdRegion } from "../regions/GStrongholdRegion";
import { REGISTRY } from "../registry";
import { BorderWall, CardDir, Dir9, GPoint3D, GSpirit } from "../types";
import { GBuildingArea } from "./GBuildingArea";

const EMPTY_C = '0,0,0';
const ROOM_C = '1,1,1';
const ENTRANCE_C = '1,0,0';
const STAIRS_UP_C = '0,0,1';
const STAIRS_DOWN_C = '1,0,1';
const BOSS_C = '0,1,0';

const SECTOR_MIN = 5;
const SECTOR_MAX = 9;
const SECTOR_COLORS = COLOR.getSerialColors(40);

export class GStrongholdArea extends GBuildingArea {
    private entranceRoom: GRoom;
    private bossRoom: GRoom;
    private armorKey: string;
    private region: GStrongholdRegion;
    private bossIndex: 0|1|2|3|4|5|6;

    private sectors: GSector[] = [];
    private sectorBorders: Map<GSector, BorderWall[]> = new Map();
    private unconnectedRooms: GRoom[] = [];
    private sectorColorIndex: number = 0;

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
        this.createSectors();
        this.createShrines();
        this.createDoorways();
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

    /**
     * We've used walls as separators until now; but all stronghold rooms
     * technically have walls. Now we'll create doorways between rooms
     * that are connected (no walls), and then put walls everywhere.
     */
    private createDoorways(): void {
        const floors: number = this.getNumFloors();
        for (let f: number = 0; f < floors; f++) {
            // First pass: create doorways where there are no walls
            this.getRoomsByFloor(f).forEach(room => {
                const neighborN = room.getNeighbor(Dir9.N);
                const neighborE = room.getNeighbor(Dir9.E);
                const neighborW = room.getNeighbor(Dir9.W);
                const neighborS = room.getNeighbor(Dir9.S);
                if (neighborN && !room.hasFullWall(Dir9.N) ) {
                    this.setDoorwayByRoom(room, Dir9.N, true);
                }
                if (neighborE && !room.hasFullWall(Dir9.E) ) {
                    this.setDoorwayByRoom(room, Dir9.E, true);
                }
                if (neighborW && !room.hasFullWall(Dir9.W) ) {
                    this.setDoorwayByRoom(room, Dir9.W, true);
                }
                if (neighborS && !room.hasFullWall(Dir9.S) ) {
                    this.setDoorwayByRoom(room, Dir9.S, true);
                }
            });
            // Second pass: put walls everywhere
            this.getRoomsByFloor(f).forEach(room => {
                const neighborN = room.getNeighbor(Dir9.N);
                const neighborE = room.getNeighbor(Dir9.E);
                const neighborW = room.getNeighbor(Dir9.W);
                const neighborS = room.getNeighbor(Dir9.S);
                if (neighborN) {
                    this.setWallByRoom(room, Dir9.N, true);
                }
                if (neighborE) {
                    this.setWallByRoom(room, Dir9.E, true);
                }
                if (neighborW) {
                    this.setWallByRoom(room, Dir9.W, true);
                }
                if (neighborS) {
                    this.setWallByRoom(room, Dir9.S, true);
                }
            });
        }
    }

    protected createSectors(): void {
        while (this.unconnectedRooms.length > 0) {
            const sector = new GSector(SECTOR_COLORS[this.sectorColorIndex++]);
            this.sectors.push(sector);
            const room = RANDOM.randElement(this.unconnectedRooms);
            this.createSector(sector, room);
            this.unconnectedRooms = this.unconnectedRooms.filter(r => r.getSector() === undefined);
        }

        this.mergeSectorsAcrossFloors();

        this.mergeSmallSectors();

        for (let sector of this.sectors) {
            this.borderSector(sector);
            GFF.genLog(`Sector created: ${sector.getRooms().length} rooms`);
        }

        this.sectors[0].connectExplicitly();
        for (let sector of this.sectors) {
            this.createSectorGateways(sector);
        }
        while (this.sectors.some(s => !s.isConnected())) {
            for (let sector of this.sectors) {
                if (!sector.isConnected()) {
                    this.createSectorGateways(sector, true);
                }
            }
        }
    }

    private createSector(sector: GSector, startRoom: GRoom) {
        const targetSize: number = RANDOM.randInt(SECTOR_MIN, SECTOR_MAX);
        const candidates: GRoom[] = [startRoom];
        const neighborCondition = (n: GRoom): boolean => {
            return n.getSector() === undefined && n.getFloor() === startRoom.getFloor();
        };
        startRoom.setSector(sector);

        while (sector.getRooms().length < targetSize && candidates.length > 0) {
            let current: GRoom = RANDOM.randElement(candidates);
            let neighbors: GRoom[] = current.getNeighbors(neighborCondition);

            for (let neighbor of neighbors) {
                if (sector.getRooms().length < targetSize) {
                    neighbor.setSector(sector);
                    if (neighbor.getNeighbors(neighborCondition).length > 0) {
                        candidates.push(neighbor);
                    }
                }
            }
            ARRAY.removeObject(current, candidates);
        }
    }

    private mergeSmallSectors() {
        for (let i = this.sectors.length - 1; i >= 0; i--) {
            const sector = this.sectors[i];
            if (sector.getRooms().length < SECTOR_MIN) {
                GFF.genLog(`Merging small sector: ${sector.getRooms().length} rooms...`);
                // Get a random room on the border of this sector
                const anyRoom = RANDOM.randElement(sector.getRooms().filter(r => r.getNeighbors().some(n => n.getSector() !== sector))) as GRoom|undefined;
                if (anyRoom) {
                    GFF.genLog(`Border room: (${anyRoom.getX()},${anyRoom.getY()},${anyRoom.getFloor()})`);
                    // Find a neighboring sector to merge with
                    const neighborSector = anyRoom.getNeighbors().map(r => r.getSector()).find(s => s !== sector);
                    if (neighborSector) {
                        GFF.genLog(`Merging with neighbor sector: ${neighborSector.getRooms().length} rooms`);
                        GSector.mergeSectors(sector, neighborSector);
                        GFF.genLog(`Old sector: ${sector.getRooms().length}, New sector: ${neighborSector.getRooms().length}`);
                    }
                }
            }
        }
        // Remove empty sectors
        this.sectors = this.sectors.filter(s => s.getRooms().length > 0);
    }

    private mergeSectorsAcrossFloors() {
        for (let i = this.sectors.length - 1; i >= 0; i--) {
            const sector = this.sectors[i];
            for (const room of sector.getRooms()) {
                const otherRoom = room.getUpstairsRoom() || room.getDownstairsRoom() || null;
                if (otherRoom && otherRoom.getSector() !== sector) {
                    GSector.mergeSectors(sector, otherRoom.getSector()!);
                    break;
                }
            }
        }
        // Remove empty sectors
        this.sectors = this.sectors.filter(s => s.getRooms().length > 0);
    }

    private borderSector(sector: GSector) {
        const borderWalls: BorderWall[] = [];
        for (let room of sector.getRooms()) {
            let neighbor: GRoom|null = room.getNeighbor(Dir9.N);
            if (neighbor && neighbor.getSector() !== room.getSector()) {
                this.setWallByRoom(room, Dir9.N, true);
                borderWalls.push({ room, dir: Dir9.N });
            }
            neighbor = room.getNeighbor(Dir9.E);
            if (neighbor && neighbor.getSector() !== room.getSector()) {
                this.setWallByRoom(room, Dir9.E, true);
                borderWalls.push({ room, dir: Dir9.E });
            }
            neighbor = room.getNeighbor(Dir9.W);
            if (neighbor && neighbor.getSector() !== room.getSector()) {
                this.setWallByRoom(room, Dir9.W, true);
                borderWalls.push({ room, dir: Dir9.W });
            }
            neighbor = room.getNeighbor(Dir9.S);
            if (neighbor && neighbor.getSector() !== room.getSector()) {
                this.setWallByRoom(room, Dir9.S, true);
                borderWalls.push({ room, dir: Dir9.S });
            }
        }
        this.sectorBorders.set(sector, borderWalls);
    }

    private createSectorGateways(sector: GSector, allowMultiple: boolean = false) {
        const borderWall = this.sectorBorders.get(sector) as BorderWall[];
        RANDOM.shuffle(borderWall);
        for (let b of borderWall) {
            const outerNeighbor: GRoom|null = b.room.getNeighbor(b.dir);
            if (outerNeighbor) {
                const otherSector = outerNeighbor.getSector() as GSector;
                GFF.genLog(`Checking border between sectors: ${sector.getRooms().length}/${sector.isConnected()} and ${otherSector.getRooms().length}/${otherSector.isConnected()}`);
                if (allowMultiple || sector.isConnected() !== otherSector.isConnected()) {
                    GSector.connectSectors(sector, outerNeighbor.getSector()!);
                    this.setWallByRoom(b.room, b.dir, false);
                    this.setLockedDoorByRoom(b.room, b.dir, true);
                }
            }
        }
    }

    /**
     * Can be used to establish the location of a locked door between two rooms
     * during stronghold generation. Can also be used to remove a locked door
     * when completing the "key verse" minigame.
     */
    public setLockedDoorByRoom(room: GRoom, dir: CardDir, isLocked: boolean) {
        if (room !== null) {
            room.setLockedDoor(dir, isLocked);
            const neighboringRoom = room.getNeighbor(dir);
            if (neighboringRoom !== null) {
                neighboringRoom.setLockedDoor(DIRECTION.getOpposite(dir) as CardDir, isLocked);
            }
        }
    }

    protected setDoorwayByRoom(room: GRoom, dir: CardDir, hasDoorway: boolean) {
        if (room !== null) {
            room.setDoorway(dir, hasDoorway);
            const neighboringRoom = room.getNeighbor(dir);
            if (neighboringRoom !== null) {
                neighboringRoom.setDoorway(DIRECTION.getOpposite(dir) as CardDir, hasDoorway);
            }
        }
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
        this.unconnectedRooms.push(room);
        return room;
    }
}
