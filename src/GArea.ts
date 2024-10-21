import { GDirection } from "./GDirection";
import { GRandom } from "./GRandom";
import { GRoom } from "./GRoom";
import { GFF } from "./main";
import { CardDir } from "./types";

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
    private rooms: GRoom[][] = [];
    private sceneryList: string[] = [];

    constructor(
        name: string,
        bgMusic: string,
        width: number,
        height: number,
        scenerySpecs: string[]
    ) {
        this.name = name;
        this.bgMusic = bgMusic;
        this.width = width;
        this.height = height;
        this.sceneryList = scenerySpecs;
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

    public containsRoom(x: number, y: number): boolean {
        return x >= 0 && x < this.width && y >= 0 && y < this.height && this.rooms[y][x] !== null;
    }

    public getRoomAt(x: number, y: number): GRoom|null {
        return this.containsRoom(x, y) ? this.rooms[y][x] : null;
    }



    private recurseMaze(room: GRoom) {
        room.discover();
        let neighbor: GRoom|null;
        do {
            neighbor = room.connectToRandomUndiscoveredNeighbor();
            if (neighbor !== null) {
                this.recurseMaze(neighbor);
            }
        } while (neighbor !== null);
    }

    public setWallAt(room: GRoom, dir: CardDir, wall: boolean) {
        if (room !== null) {
            room.setFullWall(dir);
            const neighboringRoom = room.getNeighbor(dir);
            if (neighboringRoom !== null) {
                neighboringRoom.setFullWall(GDirection.getOpposite(dir) as CardDir);
            }
        }
    }

    protected createRooms() {
        for (let y: number = 0; y < this.height; y++) {
            this.rooms[y] = [];
            for (let x: number = 0; x < this.width; x++) {
                let room: GRoom = new GRoom(x, y, this);
                this.rooms[y][x] = room;
                this.initRoom(room);
            }
        }
    }

    protected initRoom(room: GRoom) {
        // Add random amounts of each item from the scenery list
        this.sceneryList.forEach(scenery => {
            let sceneryCount = GRandom.randInt(0, 3);
            for (let n: number = 0; n < sceneryCount; n++) {
                let sX = GRandom.randInt(GFF.LEFT_BOUND + GFF.TILE_W, GFF.RIGHT_BOUND - GFF.TILE_W);
                let sY = GRandom.randInt(GFF.TOP_BOUND + GFF.TILE_H, GFF.BOTTOM_BOUND - GFF.TILE_H);
                room.addScenery(scenery, sX, sY);
            }
        });
    }
}
