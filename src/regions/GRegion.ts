import { GRoom } from "../GRoom";
import { GRandom } from "../GRandom";
import { GFF } from "../main";

/**
 * GRegion represents part of a GArea that should
 * be treated as a special section. The region is
 * added to rooms as a property; sharing the same
 * region makes rooms part of that region. Smaller
 * areas, such as the inside of buildings, contain
 * only one region.
 *
 * For example, a region might be 'Town of Gratium', which may have
 * custom generation algorithms for scenery, as well as trigger
 * things when the region is first entered:
 * - set background image based on region
 * - show region title upon arrival to the region
 */
export abstract class GRegion {
    private name: string;
    private bgImage: string;
    private encBgImage: string;
    private terrainImage: string;
    private center: GRoom;
    private rooms: GRoom[] = [];

    protected constructor(
        regionName: string,
        bgImageName: string,
        encBgImageName: string,
        terrainImageName: string
    ) {
        this.name = regionName;
        this.bgImage = bgImageName;
        this.encBgImage = encBgImageName;
        this.terrainImage = terrainImageName;
    }

    public getName(): string {
        return this.name;
    }

    public getBgImageName(): string {
        return this.bgImage;
    }

    public getEncBgImageName(): string {
        return this.encBgImage;
    }

    public getMapTerrain(): string {
        return this.terrainImage;
    }

    public setCenter(room: GRoom) {
        this.center = room;
        this.rooms.push(room);
    }

    public getCenter(): GRoom {
        return this.center;
    }

    public addRoom(room: GRoom) {
        this.rooms.push(room);
    }

    public getRooms(): GRoom[] {
        return this.rooms;
    }

    public furnishRoom(room: GRoom) {
        // Note: Entire current contents of this method is temporary

        // Don't furnish at start room - we want it empty because we're displaying help info there
        if (room.isStart()) {
            return;
        }

        this._furnishRoom(room);

        // Add random amounts of each item from the scenery list
        // this.sceneryList.forEach(scenery => {
        //     let sceneryCount = GRandom.randInt(0, 3);
        //     for (let n: number = 0; n < sceneryCount; n++) {
        //         let sX = GRandom.randInt(GFF.LEFT_BOUND + GFF.TILE_W, GFF.RIGHT_BOUND - GFF.TILE_W);
        //         let sY = GRandom.randInt(GFF.TOP_BOUND + GFF.TILE_H, GFF.BOTTOM_BOUND - GFF.TILE_H);
        //         room.addScenery(scenery, sX, sY);
        //     }
        // });
    }

    protected abstract _furnishRoom(room: GRoom): void;
}