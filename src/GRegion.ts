import { GameObjects } from "phaser";

/**
 * GRegion represents part of a GArea that should
 * be treated as a special section. The region is
 * added to rooms as a property; sharing the same
 * region makes rooms part of that region.
 *
 * For example, a region might be 'Town of Gratium', which may have
 * custom generation algorithms for scenery, as well as trigger
 * things when the region is first entered:
 * - set background image based on region
 * - show region title upon arrival to the region
 */
export class GRegion {
    private name: string;
    private bgImage: string;
    private terrainImage: string;

    constructor(
        regionName: string,
        bgImageName: string,
        terrainImageName: string
    ) {
        this.name = regionName;
        this.bgImage = bgImageName;
        this.terrainImage = terrainImageName;
    }

    public getName(): string {
        return this.name;
    }

    public getBgImageName(): string {
        return this.bgImage;
    }

    public getMapTerrain(): string {
        return this.terrainImage;
    }
}
