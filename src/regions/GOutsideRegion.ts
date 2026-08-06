import { GTown } from "../GTown";
import { RANDOM } from "../random";
import type { GRoom } from "../GRoom";
import { Dir9, GRect, GSceneryDef } from "../types";
import { GRegion } from "./GRegion";
import { SCENERY } from "../scenery";

export type GYardScenery = {
    border: string[];
    adjacent: string[];
    middle: string[];
    edge: string[];
};

export type GParkOrientation = 'horz'|'vert';

export type GParkNaturalSceneryContext = {
    room: GRoom;
    rect: GRect;
    occupiedRects: GRect[];
    mainFeatureRects: GRect[];
    fenced: boolean;
    orientation: GParkOrientation;
};

type GParkEdgeSide = 'north'|'south'|'west'|'east';

export abstract class GOutsideRegion extends GRegion{

    public isInterior(): boolean {
        return false;
    }

    public abstract getWalls(): Record<Dir9, GSceneryDef|null>;

    public abstract getYardScenery(): GYardScenery;

    public addNaturalParkScenery(_context: GParkNaturalSceneryContext): void {
    }

    protected addParkEdgeScenery(
        context: GParkNaturalSceneryContext,
        keys: string[],
        pctChance: number,
        min: number,
        max: number,
        thickness: number = 96,
        sides: GParkEdgeSide[] = ['north', 'south', 'west', 'east']
    ): void {
        this.addParkSceneryBatch(context, keys, pctChance, min, max, this.getParkEdgeZones(context.rect, thickness, sides));
    }

    protected addParkCornerScenery(
        context: GParkNaturalSceneryContext,
        keys: string[],
        pctChance: number,
        min: number,
        max: number,
        size: number = 128
    ): void {
        this.addParkSceneryBatch(context, keys, pctChance, min, max, this.getParkCornerZones(context.rect, size));
    }

    protected addParkSparseScenery(
        context: GParkNaturalSceneryContext,
        keys: string[],
        pctChance: number,
        min: number,
        max: number,
        inset: number = 32
    ): void {
        this.addParkSceneryBatch(context, keys, pctChance, min, max, [this.insetRect(context.rect, inset)]);
    }

    protected addParkSceneryEach(
        context: GParkNaturalSceneryContext,
        keys: string[],
        pctChance: number,
        max: number,
        zones?: GRect[]
    ): void {
        for (let n = 0; n < max; n++) {
            if (RANDOM.randPct() < pctChance) {
                this.addSingleParkScenery(context, keys, zones);
            }
        }
    }

    protected addParkSceneryBatch(
        context: GParkNaturalSceneryContext,
        keys: string[],
        pctChance: number,
        min: number,
        max: number,
        zones?: GRect[]
    ): void {
        if (keys.length === 0 || RANDOM.randPct() >= pctChance) {
            return;
        }

        const target: number = RANDOM.randInt(min, max);
        for (let n = 0; n < target; n++) {
            this.addSingleParkScenery(context, keys, zones);
        }
    }

    private addSingleParkScenery(context: GParkNaturalSceneryContext, keys: string[], zones?: GRect[]): void {
        for (let attempt = 0; attempt < 8; attempt++) {
            const key: string = RANDOM.randElement(keys);
            const def: GSceneryDef = SCENERY.def(key);
            const placement: GRect|null = context.room.fitScenery(def.body.width, def.body.height, context.occupiedRects, zones);

            if (!placement) {
                return;
            }
            if (this.isSouthOfMainParkFeature(placement, context.mainFeatureRects)) {
                continue;
            }

            context.occupiedRects.push(placement);
            context.room.addSceneryPlan(def.key, placement.x - def.body.x, placement.y - def.body.y);
            return;
        }
    }

    private isSouthOfMainParkFeature(rect: GRect, mainFeatureRects: GRect[]): boolean {
        return mainFeatureRects.some(featureRect => (
            rect.x < featureRect.x + featureRect.width &&
            rect.x + rect.width > featureRect.x &&
            rect.y >= featureRect.y + featureRect.height
        ));
    }

    private getParkEdgeZones(rect: GRect, thickness: number, sides: GParkEdgeSide[]): GRect[] {
        const zoneMap: Record<GParkEdgeSide, GRect> = {
            north: { x: rect.x, y: rect.y, width: rect.width, height: Math.min(thickness, rect.height) },
            south: { x: rect.x, y: Math.max(rect.y, rect.y + rect.height - thickness), width: rect.width, height: Math.min(thickness, rect.height) },
            west: { x: rect.x, y: rect.y, width: Math.min(thickness, rect.width), height: rect.height },
            east: { x: Math.max(rect.x, rect.x + rect.width - thickness), y: rect.y, width: Math.min(thickness, rect.width), height: rect.height },
        };

        return sides.map(side => zoneMap[side]).filter(zone => zone.width > 0 && zone.height > 0);
    }

    private getParkCornerZones(rect: GRect, size: number): GRect[] {
        const zoneWidth: number = Math.min(size, rect.width);
        const zoneHeight: number = Math.min(size, rect.height);

        return [
            { x: rect.x, y: rect.y, width: zoneWidth, height: zoneHeight },
            { x: rect.x + rect.width - zoneWidth, y: rect.y, width: zoneWidth, height: zoneHeight },
            { x: rect.x, y: rect.y + rect.height - zoneHeight, width: zoneWidth, height: zoneHeight },
            { x: rect.x + rect.width - zoneWidth, y: rect.y + rect.height - zoneHeight, width: zoneWidth, height: zoneHeight },
        ].filter(zone => zone.width > 0 && zone.height > 0);
    }

    private insetRect(rect: GRect, inset: number): GRect {
        const width: number = rect.width - (inset * 2);
        const height: number = rect.height - (inset * 2);
        if (width <= 0 || height <= 0) {
            return rect;
        }

        return {
            x: rect.x + inset,
            y: rect.y + inset,
            width,
            height,
        };
    }

    /**
     * There are several options for generating the full name of a region.
     * - we can do {generic_noun} of {town_name}
     * - we can do {town_adjective} {generic_noun}
     * - we can grab a predefined name
     */
    public generateFullName(town?: GTown) {
        if (town && RANDOM.flipCoin()) {
            if (RANDOM.flipCoin()) {
                this.setFullName(`${this.getGenericNounForName()} of ${town.getName()}`);
            } else {
                this.setFullName(`${town.getAdjective()} ${this.getGenericNounForName()}`);
            }
        } else {
            if (RANDOM.flipCoin()) {
                this.setFullName(`${this.getGenericNounForName()} of ${this.getStockRegionName()}`);
            } else {
                this.setFullName(`${this.getStockRegionAdjective()} ${this.getGenericNounForName()}`);
            }
        }
    }

    protected abstract getGenericNounForName(): string;
    protected abstract getStockRegionName(): string;
    protected abstract getStockRegionAdjective(): string;
}
