import { AREA } from "../area";
import { ARRAY } from "../array";
import { BOOKS } from "../books";
import { COLOR } from "../colors";
import { COMMANDMENTS } from "../commandments";
import { DIRECTION } from "../direction";
import { ENEMY } from "../enemy";
import { GRoom } from "../GRoom";
import { KEYS } from "../keys";
import { GFF } from "../main";
import { NUMBER } from "../number";
import { PEOPLE } from "../people";
import { RANDOM } from "../random";
import { GSector } from "../regions/GSector";
import { GStrongholdRegion } from "../regions/GStrongholdRegion";
import { REGISTRY } from "../registry";
import { SAVE } from "../save";
import { RefFunction } from "../scenes/GLoadGameContent";
import { RoomBorder, CardDir, Dir9, GPoint3D, GSpirit, GPerson, TEN } from "../types";
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
    private strongholdIndex: number;
    private entranceRoom: GRoom;
    private bossRoom: GRoom;
    private prophetChamber: GRoom;
    private armorKey: string;
    private region: GStrongholdRegion;
    private bossIndex: 0|1|2|3|4|5|6;
    private floorImageKeys: string[];
    private sectors: GSector[] = [];
    private sectorBorders: Map<GSector, RoomBorder[]> = new Map();
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
        GFF.genLog(`Creating stronghold interior: ${strongholdName}`);
        this.bossIndex = bossIndex;
        this.armorKey = armorKey;
        this.region = region;
        this.floorImageKeys = floorImageKeys;
        this.region.setFullName(strongholdName);
        this.setGroundFloor(groundFloor);
    }

    public generate(): void {
        super.generate();
        this.loadFloors(this.floorImageKeys);
        this.createSectors();
        this.createKeys();
        this.createDepthRooms();
        this.createShrines();
        this.createDoorways();
    }

    public setStrongholdIndex(index: number): void {
        this.strongholdIndex = index;
    }

    public getStrongholdIndex(): number {
        return this.strongholdIndex;
    }

    public isSafe(): boolean {
        return false;
    }

    public getEntranceRoom(): GRoom {
        return this.entranceRoom;
    }

    public setProphetChamber(room: GRoom): void {
        this.prophetChamber = room;
    }

    public getProphetChamber(): GRoom {
        return this.prophetChamber;
    }

    public getBossRoom(): GRoom {
        return this.bossRoom;
    }

    public getBossSpirit(): GSpirit {
        return ENEMY.BOSS_SPIRITS[this.bossIndex];
    }

    public getCellRooms(): GRoom[] {
        return this.getRooms(r => r.getPrisoner() !== undefined);
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
            this.unconnectedRooms = this.unconnectedRooms.filter(r => r.getSector() === null);
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

    /**
     * Expands a sector starting from the given room, until it reaches
     * the target size.
     */
    private createSector(sector: GSector, startRoom: GRoom) {
        const targetSize: number = RANDOM.randInt(SECTOR_MIN, SECTOR_MAX);
        const candidates: GRoom[] = [startRoom];
        const neighborCondition = (n: GRoom): boolean => {
            return n.getSector() === null && n.getFloor() === startRoom.getFloor();
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

    /**
     * Merges any sectors that are smaller than the minimum size
     * into a neighboring sector. This ensures that we don't end up
     * with tons of tiny sectors, which would make placing keys and
     * other special rooms difficult or impossible.
     */
    private mergeSmallSectors() {
        for (let i = this.sectors.length - 1; i >= 0; i--) {
            const sector = this.sectors[i];
            if (sector.getRooms().length < SECTOR_MIN) {
                GFF.genLog(`Merging small sector: ${sector.getRooms().length} rooms...`);
                // Get a random room on the border of this sector, on the same floor
                const anyRoom = RANDOM.randElement(sector.getRooms().filter(r => r.getNeighbors(n => n.getFloor() === r.getFloor()).some(n => n.getSector() !== sector))) as GRoom|undefined;
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

    /**
     * Merges sectors that are connected via staircases between floors.
     */
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

    /**
     * Creates a wall around the border of the given sector.
     */
    private borderSector(sector: GSector) {
        const borderWalls: RoomBorder[] = [];
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

    /**
     * Joins a sector to one or more neighboring sectors by creating locked doors
     * between them. If allowMultiple is false, only creates a gateway if the sectors
     * are not already connected.
     */
    private createSectorGateways(sector: GSector, allowMultiple: boolean = false) {
        const borderWall = this.sectorBorders.get(sector) as RoomBorder[];
        RANDOM.shuffle(borderWall);
        for (let b of borderWall) {
            const outerNeighbor: GRoom|null = b.room.getNeighbor(b.dir);
            if (outerNeighbor) {
                const otherSector = outerNeighbor.getSector() as GSector;
                // GFF.genLog(`Checking border between sectors: ${sector.getRooms().length}/${sector.isConnected()} and ${otherSector.getRooms().length}/${otherSector.isConnected()}`);
                if (allowMultiple || sector.isConnected() !== otherSector.isConnected()) {
                    GSector.connectSectors(sector, outerNeighbor.getSector()!);
                    this.setWallByRoom(b.room, b.dir, false);
                    this.setLockedDoorByRoom(b.room, b.dir, 'placeholder');
                }
            }
        }
    }

    /**
     * This function explores the stronhold sector by sector, starting from the entrance room.
     * For each connecting sector, it creates a key room in the current sector, ensuring that
     * there are sufficient keys in each sector to continue to any further sectors.
     */
    private createKeys(): void {
        let currentSector: GSector = this.entranceRoom.getSector() as GSector;

        const lockedDoors = this.createKeysForSector(currentSector);

        // Finally, re-lock all locked doors for gameplay
        for (let lockedDoor of lockedDoors) {
            this.setLockedDoorByRoom(lockedDoor.room, lockedDoor.dir, KEYS.getNextKeyVerse());
        }

        // Reset all rooms to undiscovered for gameplay
        for (let room of this.getRooms()) {
            room.conceal();
        }
    }

    private createKeysForSector(sector: GSector): RoomBorder[] {
        // Get all sectors that can be reached from this one via locked doors
        const lockedSectors: GSector[] = [];
        const lockedDoors: RoomBorder[] = [];
        for (let room of sector.getRooms()) {
            const roomLockedDoors = room.getLockedDoors();
            lockedDoors.push(...roomLockedDoors);
            roomLockedDoors.map(ld => {
                return room.getNeighbor(ld.dir)!.getSector()!;
            }).forEach(s => {
                if (!lockedSectors.includes(s)) {
                    lockedSectors.push(s);
                }
            });
        }
        GFF.genLog(`Sector (${sector.getRooms().length}) has ${lockedSectors.length} locked sectors connected.`);

        // For each locked sector, create a key room in the current sector
        for (let k: number = 0; k < lockedSectors.length; k++) {
            this.createAccessibleKeyRoom(sector);
        }
        GFF.genLog(`Created ${lockedSectors.length} keys.`);

        // Unlock all doors in the sector, so the current sector won't be revisited
        for (let lockedDoor of lockedDoors) {
            this.setLockedDoorByRoom(lockedDoor.room, lockedDoor.dir, null);
        }
        GFF.genLog(`Unlocked ${lockedDoors.length} doors.`);

        // Recurse into each unlocked sector
        for (let unlockedSector of lockedSectors) {
            lockedDoors.push(...this.createKeysForSector(unlockedSector));
        }

        return lockedDoors;
    }

    private createAccessibleKeyRoom(sector: GSector): void {
        let room: GRoom|null = null;
        while (!room || !room.canHavePremiumChest()) {
            room = RANDOM.randElement(sector.getRooms()) as GRoom;
        }
        room.planCenteredPremiumChestShrine('key', 'blue');
        GFF.genLog(`Created key @ (${room.getX()},${room.getY()},${room.getFloor()})`);
    }

    /**
     * Can be used to establish the location of a locked door between two rooms
     * during stronghold generation. Can also be used to remove a locked door
     * when completing the "key verse" minigame.
     */
    public setLockedDoorByRoom(room: GRoom, dir: CardDir, keyRef: string|null) {
        if (room !== null) {
            room.setLockedDoor(dir, keyRef);
            const neighboringRoom = room.getNeighbor(dir);
            if (neighboringRoom !== null) {
                neighboringRoom.setLockedDoor(DIRECTION.getOpposite(dir) as CardDir, keyRef);
            }
        }
    }

    protected computeDepths(entrance: GRoom): GRoom[] {
        const visited = new Set<GRoom>();
        const queue: [GRoom, number][] = [[entrance, 0]];

        while (queue.length > 0) {
            const [room, depth] = queue.shift()!;
            if (visited.has(room)) continue;
            visited.add(room);

            room.setDepthDistance(depth);

            const neighbors = room.getAccessibleNeighbors(true);
            for (const next of neighbors) {
                if (!visited.has(next)) {
                    queue.push([next, depth + 1]);
                }
            }
        }
        return [...visited].sort((a, b) => a.getDepthDistance() - b.getDepthDistance());
    }

    /**
     * Determines the "depth" of each room in the stronghold, based on its
     * distance from the entrance room; and then creates certain special rooms
     * that should be placed at specific depths.
     */
    protected createDepthRooms(): void {
        // First, compute depths of all rooms from the entrance:
        const roomsByDepth: GRoom[] = this.computeDepths(this.entranceRoom);

        // roomsByDepth contains all rooms reachable from the entrance, so now is a good
        // time to make sure all rooms are connected:
        if (roomsByDepth.length < this.getRooms().length) {
            GFF.genLog(`WARNING: ${this.getRooms().length - roomsByDepth.length} rooms are not reachable!`, true);
        }

        // Create the prophet's chamber: he will help guide the player through the stronghold.
        const prophetRoom = this.chooseRoomAtDepth(RANDOM.randFloat(0.1, 0.2), roomsByDepth);
        if (prophetRoom) {
            prophetRoom.planProphetChamber();
            prophetRoom.setProphetChamber();
            GFF.genLog(`Prophet chamber placed at ${prophetRoom.getX()},${prophetRoom.getY()},${prophetRoom.getFloor()}`);
        } else {
            GFF.genLog(`WARNING: No suitable room found for prophet chamber.`, true);
        }

        /**
         * 1-2 prisoners will be held captive in the stronghold.
         * Since unlocking the cell requires a key verse, we need to create
         * an additional key room in the stronghold for each prisoner.
         */

        // First prisoner:
        const prisoner1Room = this.chooseRoomAtDepth(RANDOM.randFloat(0.7, 0.9), roomsByDepth);
        if (prisoner1Room) {
            prisoner1Room.planPrisonerCell();
            prisoner1Room.setPrisoner(null); // Cell planned, but no prisoner assigned yet
            this.createAccessibleKeyRoom(prisoner1Room.getSector() as GSector);
            GFF.genLog(`Cell created at ${prisoner1Room.getX()},${prisoner1Room.getY()},${prisoner1Room.getFloor()}`);
        }

        // 50% chance to add second prisoner:
        const prisoner2Room = this.chooseRoomAtDepth(RANDOM.randFloat(0.6, 0.8), roomsByDepth);
        if (prisoner2Room && RANDOM.flipCoin()) {
            prisoner2Room.planPrisonerCell();
            prisoner2Room.setPrisoner(null); // Cell planned, but no prisoner assigned yet
            this.createAccessibleKeyRoom(prisoner2Room.getSector() as GSector);
            GFF.genLog(`Cell created at ${prisoner2Room.getX()},${prisoner2Room.getY()},${prisoner2Room.getFloor()}`);
        }
    }

    protected chooseRoomAtDepth(targetDepthPct: number, roomsByDepth: GRoom[]): GRoom|null {
        const targetIndex = Math.floor(targetDepthPct * (roomsByDepth.length - 1));
        // Try to find a room at the target depth:
        if (!roomsByDepth[targetIndex].hasSpecialFeature()) {
            return roomsByDepth[targetIndex];
        }

        // If not, try nearby rooms:
        for (let offset = 0; offset < 20; offset++) {
            if (!roomsByDepth[targetIndex + offset].hasSpecialFeature()) {
                return roomsByDepth[targetIndex + offset];
            } else if (!roomsByDepth[targetIndex - offset].hasSpecialFeature()) {
                return roomsByDepth[targetIndex - offset];
            }
        }
        return null;
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
                console.error(`Staircase at (${stairPt.x},${stairPt.y},${stairPt.z}) is missing a connecting room.`);
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

    public getProphetTreasureText(): string {
        // Get rooms that have a book of the Bible:
        const bookRooms: TEN|0 = this.getRooms(r => r.hasPlanKey('red_chest')).length as TEN|0;
        // Get rooms that have a commandment:
        const commandmentRooms: TEN|0 = this.getRooms(r => r.hasPlanKey('purple_chest')).length as TEN|0;
        // Get rooms that have an armor piece:
        const armorRooms: TEN|0 = this.getRooms(r => r.hasPlanKey('gold_chest')).length as TEN|0;
        // Get rooms that have a prisoner:
        const prisonerRooms: TEN|0 = this.getRooms(r => r.getPrisoner() !== null && r.getPrisoner() !== undefined).length as TEN|0;

        // Get the total number of treasure rooms:
        const totalRooms: number =  bookRooms + commandmentRooms + armorRooms + prisonerRooms;

        if (totalRooms === 0) {
            return 'No treasures remain in this place. Make haste and depart; and let us pull down this stronghold in the name of the Lord!';
        }

        const bookText = bookRooms === 1 ? `${NUMBER.toString(bookRooms)} book of the Bible` : `${NUMBER.toString(bookRooms)} books of the Bible`;
        const commandmentText = commandmentRooms === 1 ? `${NUMBER.toString(commandmentRooms)} commandment` : `${NUMBER.toString(commandmentRooms)} commandments`;
        const armorText = armorRooms === 1 ? `${NUMBER.toString(armorRooms)} piece of armor` : `${NUMBER.toString(armorRooms)} pieces of armor`;
        const prisonerText = prisonerRooms === 1 ? `${NUMBER.toString(prisonerRooms)} precious captive soul` : `${NUMBER.toString(prisonerRooms)} precious captive souls`;

        const text: string = `Within this stronghold, there remaineth yet ` +
            (bookRooms > 0 ? bookText : '') +
            (commandmentRooms > 0 ? (bookRooms > 0 ? ', ' : '') + commandmentText : '') +
            (armorRooms > 0 ? ((bookRooms > 0 || commandmentRooms > 0) ? ', ' : '') + armorText : '') +
            (prisonerRooms > 0 ? ((bookRooms > 0 || commandmentRooms > 0 || armorRooms > 0) ? ', and ' : '') + prisonerText : '') +
            `. Recover all, that we may leave this place forever!`;

        return text;
    }

    public toSaveObject(ids: Map<any, number>): object {
        const parentData = super.toSaveObject(ids);
        return {
            ...parentData,
            strongholdIndex: this.strongholdIndex,
            armorKey: this.armorKey,
            bossIndex: this.bossIndex,
            entranceRoom: SAVE.idFor(this.entranceRoom, ids),
            bossRoom: SAVE.idFor(this.bossRoom, ids),
            prophetChamber: SAVE.idFor(this.prophetChamber, ids),
            region: SAVE.idFor(this.region, ids),
            sectors: this.sectors.map(s => SAVE.idFor(s, ids)),
        };
    }

    public hydrateLoadedObject(context: any, refObj: RefFunction): void {
        super.hydrateLoadedObject(context, refObj);
        this.strongholdIndex = context.strongholdIndex;
        this.armorKey = context.armorKey;
        this.bossIndex = context.bossIndex;
        this.entranceRoom = refObj(context.entranceRoom);
        this.bossRoom = refObj(context.bossRoom);
        this.prophetChamber = refObj(context.prophetChamber);
        this.region = refObj(context.region);
        this.sectors = context.sectors.map((sId: string) => refObj(sId));
    }
}
