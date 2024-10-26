import { GDirection } from "../GDirection";
import { GRandom } from "../GRandom";
import { GRoom } from "../GRoom";
import { GFF } from "../main";
import { GRegion } from "../regions/GRegion";
import { CardDir, GFloor } from "../types";

const HORZ_WALL_SECTIONS: number = 16;
const VERT_WALL_SECTIONS: number = 11;

/**
 * GArea represents a 2-dimensional collection of GRooms that can
 * be traversed by the player as part of a single map.
 *
 * Example areas are the World (outside), the Churches, and the 5 Strongholds:
 * - Tower of Deception  (Girdle of Truth)
 * - Dungeon of Doubt    (Shield of Faith)
 * - Keep of Wickedness  (Breastplate of Righteousness)
 * - Fortress of Enmity  (Preparation of Peace)
 * - Castle of Perdition (Helmet of Salvation)
 *
 * Within an area, there may also be regions (GRegion). A region
 * is added to a room to make it part of that region, giving it
 * access to properties shared with other rooms of the region.
 */
export class GArea {
    private name: string;
    private bgMusic: string;
    private width: number;
    private height: number;
    private floors: GFloor[] = [];
    private roomsByFloor: GRoom[][] = [];

    constructor(
        name: string,
        bgMusic: string,
        floors: number,
        width: number,
        height: number
    ) {
        this.name = name;
        this.bgMusic = bgMusic;
        this.width = width;
        this.height = height;

        // Create floors
        for (let f: number = 0; f < floors; f++) {
            this.floors.push([]);
            this.roomsByFloor[f] = [];
        }
    }

    public getName() {
        return this.name;
    }

    public getBgMusic() {
        return this.bgMusic;
    }

    public getWidth() {
        return this.width;
    }

    public getHeight() {
        return this.height;
    }

    public setRoom(floor: number, x: number, y: number, room: GRoom) {
        if (!this.floors[floor][y]) {
            this.floors[floor][y] = [];
        }
        this.floors[floor][y][x] = room;
        this.roomsByFloor[floor].push(room);
    }

    public containsRoom(floor: number, x: number, y: number): boolean {
        return x >= 0 && x < this.width && y >= 0 && y < this.height && this.floors[floor][y][x] !== null;
    }

    public getRoomAt(floor: number, x: number, y: number): GRoom|null {
        return this.containsRoom(floor, x, y) ? this.floors[floor][y][x] : null;
    }

    public getRoomsByFloor(floor: number): GRoom[] {
        return this.roomsByFloor[floor];
    }

    public getRandomRoom(): GRoom {
        const floor: number = GRandom.randInt(0, this.floors.length - 1);
        return this.getRandomRoomByFloor(floor);
    }

    public getRandomRoomByFloor(floor: number): GRoom {
        return GRandom.randElement(this.roomsByFloor[floor]) as GRoom;
    }

    public getRoomsWithCondition(condition: (r: GRoom) => boolean): GRoom[] {
        const rooms: GRoom[] = [];
        for (let f: number = 0; f < this.floors.length; f++) {
            this.roomsByFloor[f].forEach(room => {
                if (condition(room)) {
                    rooms.push(room);
                }
            });
        }
        return rooms;
    }

    protected exploreContiguous(startRoom: GRoom) {
        startRoom.discover();
        for (let d: number = 0; d < 4; d++) {
            const dir: CardDir = GDirection.cardDirFrom4(d as 0|1|2|3);
            const neighbor: GRoom|null = startRoom.getNeighbor(dir);
            if (neighbor && !neighbor.isDiscovered() && !startRoom.hasFullWall(dir)) {
                this.exploreContiguous(neighbor);
            }
        }
    }

    protected mazeRegion(startRoom: GRoom, region: GRegion) {
        region.getRooms().forEach(r => {
            for (let d: number = 0; d < 4; d++) {
                this.setWallByRoom(r, GDirection.cardDirFrom4(d as 0|1|2|3), true);
            }
        });

        // Recursive maze algorithm:
        this.recurseMazeRegion(startRoom);

        // Re-conceal all rooms (they were "discovered" in the maze algorithm):
        this.concealAllRooms(0);
    }

    protected recurseMazeRegion(room: GRoom) {
        room.discover();
        let neighbor: GRoom|null;
        do {
            neighbor = room.connectToRandomUndiscoveredNeighborInRegion();
            if (neighbor !== null) {
                this.recurseMazeRegion(neighbor);
            }
        } while (neighbor !== null);
    }

    protected makeMaze(floor: number, wallsToRemove: number, partialWalls: number) {
        // Put 4 walls in each room (required for maze algorithm):
        for (let x: number = 0; x < this.width; x++) {
            for (let y: number = 0; y < this.height; y++) {
                for (let d: number = 0; d < 4; d++) {
                    this.setWallAt(floor, x, y, GDirection.cardDirFrom4(d as 0|1|2|3), true);
                }
            }
        }

        // Recursive maze algorithm:
        this.recurseMaze(this.getRandomRoomByFloor(floor));

        // Re-conceal all rooms (they were "discovered" in the maze algorithm):
        this.concealAllRooms(floor);

        // Remove some random walls to make it more "open", less like a structured maze:
        for (let n: number = 0; n < wallsToRemove; n++) {
            const dir: CardDir = GDirection.randomCardDir();
            this.setWallByRoom(this.getRandomRoomByFloor(floor), dir, false);
        }
    }

    private recursions: number = 0;
    private recurseMaze(room: GRoom) {
        GFF.genLog(`Start recursion: ${++this.recursions}`);
        room.discover();
        let neighbor: GRoom|null;
        do {
            neighbor = room.connectToRandomUndiscoveredNeighbor();
            if (neighbor !== null) {
                this.recurseMaze(neighbor);
            }
        } while (neighbor !== null);
        GFF.genLog(`End recursion (${--this.recursions})`);
    }

    protected addRandomWallSections(floor: number, replaceEmpty: boolean, replaceFull: boolean, partialWalls: number) {
        for (let p: number = 0; p < partialWalls; p++) {
            let room: GRoom|null = this.getRandomRoomByFloor(floor);
            const dir: CardDir = GDirection.randomCardDir();
            if (
                (replaceEmpty && !room.hasAnyWall(dir))
                || (replaceFull && room.hasFullWall(dir))
            ) {
                let sections: boolean[];
                switch(dir) {
                    case GDirection.Dir9.N:
                    case GDirection.Dir9.S:
                        sections = this.getRandomWallSections(HORZ_WALL_SECTIONS);
                        break;
                    case GDirection.Dir9.E:
                    case GDirection.Dir9.W:
                        sections = this.getRandomWallSections(VERT_WALL_SECTIONS);
                        break;
                }
                room.setWallSections(dir, sections);
                room = room.getNeighbor(dir);
                room?.setWallSections(GDirection.getOpposite(dir) as CardDir, sections);
            }
        }
    }

    protected createOuterBorder(floor: number) {
        // Place walls wherever there is no neighbor (outer border):
        this.roomsByFloor[floor].forEach(r => {
            for (let d: number = 0; d < 4; d++) {
                const dir = GDirection.cardDirFrom4(d as 0|1|2|3);
                if (!r.hasNeighbor(dir)) {
                    r.setFullWall(dir, true);
                }
            }
        });
    }

    public setWallAt(floor: number, x: number, y: number, dir: CardDir, wall: boolean) {
        const room: GRoom|null = this.getRoomAt(floor, x, y);
        if (room) {
            this.setWallByRoom(room, dir, wall);
        }
    }

    public setWallByRoom(room: GRoom, dir: CardDir, wall: boolean) {
        if (room !== null) {
            room.setFullWall(dir, wall);
            const neighboringRoom = room.getNeighbor(dir);
            if (neighboringRoom !== null) {
                neighboringRoom.setFullWall(GDirection.getOpposite(dir) as CardDir, wall);
            }
        }
    }

    protected getRandomWallSections(sectionCount: number): boolean[] {
        let sections: boolean[] = new Array(sectionCount).fill(false);
        const type: number = GRandom.randInt(1, 4);
        switch(type) {
            case 1: // sprinkle
                for (let w: number = 0; w < sectionCount - 1; w++) {
                    sections[GRandom.randInt(0, sectionCount - 1)] = true;
                }
                break;
            case 2: // symmetrical
                const h: number = GRandom.randInt(1, Math.floor(sectionCount / 2) - 1);
                for (let w: number = 0; w < h; w++) {
                    let s: number = GRandom.randInt(0, h);
                    sections[s] = true;
                    sections[sectionCount - 1 - s] = true;
                }
                break;
            case 3: // block
                const bS: number = GRandom.randInt(1, sectionCount - 2);
                const bI: number = GRandom.flipCoin() ? 1 : -1;
                let bN: number = GRandom.randInt(1, sectionCount - 1);
                for (let w: number = bS; w < sectionCount && w >= 0 && bN > 0; w += bI) {
                    sections[w] = true;
                    bN--;
                }
                break;
            case 4: // hole
                sections = new Array(sectionCount).fill(true);
                const hS: number = GRandom.randInt(1, sectionCount - 2);
                const hI: number = GRandom.flipCoin() ? 1 : -1;
                let hN: number = GRandom.randInt(1, sectionCount - 1);
                for (let w: number = hS; w < sectionCount && w >= 0 && hN > 0; w += hI) {
                    sections[w] = false;
                    hN--;
                }
                break;
        }
        return sections;
    }

    protected concealAllRooms(floor: number) {
                this.roomsByFloor[floor].forEach(r => {
            r.conceal();
        });
    }

    protected createRooms() {
        for (let f: number = 0; f < this.floors.length; f++) {
            for (let y: number = 0; y < this.height; y++) {
                for (let x: number = 0; x < this.width; x++) {
                    let room: GRoom = new GRoom(f, x, y, this);
                    this.setRoom(f, x, y, room);
                    this.initRoom(room);
                }
            }
        }
    }

    protected furnishRooms() {
        for (let f: number = 0; f < this.floors.length; f++) {
            this.roomsByFloor[f].forEach(r => {
                r.getRegion().furnishRoom(r);
            });
        }
    }

    protected initRoom(_room: GRoom) {}
}
