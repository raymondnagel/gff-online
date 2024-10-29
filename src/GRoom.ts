import { GRegion } from "./regions/GRegion";
import { CardDir, GPoint, GRect, GRoomWalls, GSceneryDef, GSceneryPlan } from "./types";
import { SCENERY } from "./scenery";
import { GAdventureContent } from "./scenes/GAdventureContent";
import { GFF } from "./main";
import { GTreasureChest } from "./objects/GTreasureChest";
import { GRandom } from "./GRandom";
import { GArea } from "./areas/GArea";
import { GDirection } from "./GDirection";
import { GTown } from "./GTown";
import { GChurch } from "./GChurch";
import { GStronghold } from "./GStronghold";

const HORZ_WALL_SECTIONS: number = 16;
const VERT_WALL_SECTIONS: number = 11;
const TERRAIN_FADE_ALPHA: number = .5;

/**
 * GRoom represents a single screen/room within a GArea.
 * Each GRoom has a collection of objects that should be loaded
 * to the AdventureScene when the room is entered, and unloaded
 * when the room is exited.
 */
export class GRoom {
    private area: GArea;
    private floor: number;
    private x: number;
    private y: number;
    private plans: GSceneryPlan[] = [];
    private region: GRegion;
    private town: GTown|null = null;
    private church: GChurch|null = null;
    private stronghold: GStronghold|null = null;
    private walls: GRoomWalls;
    private start: boolean = false;
    private discovered: boolean = false;

    constructor(floor: number, x: number, y: number, area: GArea) {
        this.area = area;
        this.floor = floor;
        this.x = x;
        this.y = y;

        this.walls = {
            [GDirection.Dir9.N]: new Array(HORZ_WALL_SECTIONS).fill(false),
            [GDirection.Dir9.E]: new Array(VERT_WALL_SECTIONS).fill(false),
            [GDirection.Dir9.S]: new Array(HORZ_WALL_SECTIONS).fill(false),
            [GDirection.Dir9.W]: new Array(VERT_WALL_SECTIONS).fill(false)
        };
    }

    public setStart() {
        this.start = true;
    }

    public isStart(): boolean {
        return this.start;
    }

    public getArea(): GArea {
        return this.area;
    }

    public getFloor(): number {
        return this.floor;
    }

    public getX(): number {
        return this.x;
    }

    public getY(): number {
        return this.y;
    }

    public getTown(): GTown|null {
        return this.town;
    }

    public setTown(town: GTown|null) {
        this.town = town;
    }

    public getChurch(): GChurch|null {
        return this.church;
    }

    public setChurch(church: GChurch|null) {
        this.church = church;
        this.church?.setWorldRoom(this);
    }

    public getStronghold(): GStronghold|null {
        return this.stronghold;
    }

    public setStronghold(stronghold: GStronghold|null) {
        this.stronghold = stronghold;
        this.stronghold?.setWorldRoom(this);
    }

    public setRegion(region: GRegion) {
        this.region = region;
        this.region.addRoom(this);
    }

    public getRegion(): GRegion {
        return this.region;
    }

    public isDiscovered(): boolean {
        return this.discovered;
    }

    public discover() {
        this.discovered = true;
    }

    public conceal() {
        this.discovered = false;
    }

    public getMapTerrain(): string {
        return this.region.getMapTerrain();
    }

    public getMapFeature(): string|null {
        if (this.church) {
            return 'map_church';
        } else if (this.town) {
            return 'map_town';
        } else if (this.stronghold) {
            return 'map_hold';
        }
        return null;
    }

    public getEncounterBg(): string {
        return this.region.getEncBgImageName();
    }

    public setFullWall(dir: CardDir, wall: boolean) {
        const sections = new Array(this.walls[dir].length).fill(wall);
        this.setWallSections(dir, sections);
    }

    public setWallSections(dir: CardDir, sections: boolean[]) {
        if (this.walls[dir] && this.walls[dir].length === sections.length) {
            this.walls[dir] = sections;
        } else {
            throw new Error(`Wall (${GDirection.dir9Texts()[dir]}) sections (${sections.length}) length mismatch!`);
        }
    }

    public getWallSections(dir: CardDir): boolean[] {
        return this.walls[dir];
    }

    public hasAnyWall(dir: CardDir): boolean {
        return !this.walls[dir].every(section => section === false);
    }

    public hasFullWall(dir: CardDir): boolean {
        return this.walls[dir].every(section => section === true);
    }

    public hasNeighbor(direction: GDirection.Dir9): boolean {
        const velocity: GPoint = GDirection.getVelocity(direction);
        return this.area.containsRoom(this.floor, this.x + velocity.x, this.y + velocity.y);
    }

    public getNeighbor(direction: GDirection.Dir9): GRoom|null {
        const velocity: GPoint = GDirection.getVelocity(direction);
        return this.area.getRoomAt(this.floor, this.x + velocity.x, this.y + velocity.y);
    }

    public getNeighbors(condition?: (n: GRoom) => boolean): GRoom[] {
        const neighbors: GRoom[] = [];
        for (let d: number = 0; d < 4; d++) {
            const neighbor: GRoom|null = this.getNeighbor(GDirection.cardDirFrom4(d as 0|1|2|3));
            if (neighbor) {
                if (condition === undefined || condition(neighbor)) {
                    neighbors.push(neighbor);
                }
            }
        }
        return neighbors;
    }

    public connectToRandomUndiscoveredNeighbor(): GRoom|null {
        let d: number = GRandom.randInt(0, 3);
        const start: number = d;
        do {
            const dir: CardDir = GDirection.cardDirFrom4(d as 0|1|2|3);
            const neighbor: GRoom|null = this.getNeighbor(dir);
            if (neighbor && !neighbor.isDiscovered()) {
                this.area.setWallByRoom(this, dir, false);
                return neighbor;
            }
            d++;
            if (d > 3) {
                d = 0;
            }
        } while (d !== start);
        return null;
    }

    public connectToRandomUndiscoveredNeighborInRegion(): GRoom|null {
        let d: number = GRandom.randInt(0, 3);
        const start: number = d;
        do {
            const dir: CardDir = GDirection.cardDirFrom4(d as 0|1|2|3);
            const neighbor: GRoom|null = this.getNeighbor(dir);
            if (neighbor && !neighbor.isDiscovered() && neighbor.getRegion() === this.getRegion()) {
                this.area.setWallByRoom(this, dir, false);
                return neighbor;
            }
            d++;
            if (d > 3) {
                d = 0;
            }
        } while (d !== start);
        return null;
    }

    public isSafe(): boolean {
        if (this.x === 0 && this.y === 0) {
            return true;
        } else {
            return false;
        }
    }

    public load() {
        // Set background image from region:
        if (this.region !== undefined) {
            GFF.AdventureContent.add.image(0, 0, this.region.getBgImageName()).setOrigin(0, 0);
        }

        // Create terrain fade images, if applicable, based on neighbors:
        this.addFadeImageForNeighbor(GDirection.Dir9.N, 'n');
        this.addFadeImageForNeighbor(GDirection.Dir9.E, 'e');
        this.addFadeImageForNeighbor(GDirection.Dir9.W, 'w');
        this.addFadeImageForNeighbor(GDirection.Dir9.S, 's');

        // Create a render-texture for any decorations:
        const decorRenderer: Phaser.GameObjects.RenderTexture = GFF.AdventureContent.add.renderTexture(GFF.ROOM_X, GFF.ROOM_Y, GFF.ROOM_W, GFF.ROOM_H);
        decorRenderer.setOrigin(0, 0);

        // Create scenery objects from plan:
        this.plans.forEach((plan) => {
            SCENERY.create(plan.key, plan.x, plan.y, decorRenderer);
        });

        // Treasure chest test:
        new GTreasureChest(GFF.AdventureContent, 512, 384, GRandom.flipCoin());

        // Help text on first room:
        if (this.isStart()) {
            GFF.AdventureContent.add.text(30, 30, GFF.TEST_INFO, {
                color: '#000000',
                fontSize: '16px',
                fontFamily: 'time',
                fontStyle: 'bold',
                lineSpacing: -6
            });
        }
    }

    public unload() {
        let objs: Phaser.GameObjects.GameObject[] = GFF.AdventureContent.children.getChildren();

        // Destroy everything in the scene not marked as 'permanent':
        for (let n = objs.length - 1; n >= 0; n--) {
            if (objs[n].data !== undefined) {
                if (!objs[n].data?.get('permanent')) {
                    objs[n].destroy();
                }
            }
        }
    }

    private addFadeImageForNeighbor(dir: CardDir, dirStr: string) {
        const neighbor: GRoom|null = this.getNeighbor(dir);
        if (neighbor && neighbor.getRegion() !== this.getRegion()) {
            const fadeImageName: string = neighbor.getRegion().getBgImageName() + `_fade_` + dirStr;
            switch (dir) {
                case GDirection.Dir9.N:
                case GDirection.Dir9.W:
                    GFF.AdventureContent.add.image(0, 0, fadeImageName).setOrigin(0, 0).setAlpha(TERRAIN_FADE_ALPHA);
                    break;
                case GDirection.Dir9.E:
                    GFF.AdventureContent.add.image(GFF.ROOM_W, 0, fadeImageName).setOrigin(1, 0).setAlpha(TERRAIN_FADE_ALPHA);
                    break;
                case GDirection.Dir9.S:
                    GFF.AdventureContent.add.image(0, GFF.ROOM_H, fadeImageName).setOrigin(0, 1).setAlpha(TERRAIN_FADE_ALPHA);
                    break;
            }
        }
    }

    public addScenery(key: string, x: number, y: number) {
        this.plans.push({key, x, y});
    }

    // If chance is met, add min-max of scenery type
    // (adds a flexible group based on 1 chance)
    public planSceneryChanceForBatch(sceneryDef: GSceneryDef, pctChance: number, min: number, max: number, objectBounds: GRect[], zones?: GRect[]) {
        if (GRandom.randPct() < pctChance) {
            this.planZonedScenery(sceneryDef, GRandom.randInt(min, max), objectBounds, zones);
        }
    }

    // Add instance of scenery type, up to max, only if chance is met in succession times
    // (assumes the same rarity for each instance)
    public planSceneryChanceForEach(sceneryDef: GSceneryDef, pctChance: number, max: number, objectBounds: GRect[], zones?: GRect[]) {
        for (let n: number = 0; n < max; n++) {
            if (GRandom.randPct() < pctChance) {
                this.planZonedScenery(sceneryDef, 1, objectBounds, zones);
            }
        }
    }

    public planZonedScenery(sceneryDef: GSceneryDef, targetInstances: number, objectBounds: GRect[], zones?: GRect[]) {
        for (let i: number = 0; i < targetInstances; i++) {
            const placement: GRect|null = this.fitScenery(sceneryDef.body.width, sceneryDef.body.height, objectBounds, zones);
            if (!placement) {
                return;
            }
            this.addScenery(sceneryDef.key, placement.x - sceneryDef.body.x, placement.y - sceneryDef.body.y);
        }
    }

    public fitScenery(objectWidth: number, objectHeight: number, objects: GRect[], zones?: GRect[]): GRect|null {
        // Helper to check if a rectangle overlaps with any existing objects
        const isOverlapping = (rect: GRect): boolean => {
            return objects.some(obj =>
                rect.x < obj.x + obj.width &&
                rect.x + rect.width > obj.x &&
                rect.y < obj.y + obj.height &&
                rect.y + rect.height > obj.y
            );
        };

        // List to hold all potential placement areas
        const potentialPlacements: GRect[] = [];

        // Step 1: Generate potential placements within each zone
        if (zones === undefined) {
            zones = [ {x: GFF.ROOM_X, y: GFF.ROOM_Y, width: GFF.ROOM_W, height: GFF.ROOM_H} ];
        }
        // THIS CODE IS WHAT MAKES WORLD GENERATION REALLY SLOW, BECAUSE IT IS
        // CALCULATING EVERY POTENTIAL PLACEMENT, PIXEL-BY-PIXEL, FOR EVERY SINGLE SCENERY
        // OBJECT PLACED.
        // TRY TO INSTEAD CALCULATE WHOLE AREAS IN WHICH THE OBJECT COULD POSSIBLY BE PLACED.
        // THEN SELECT A RANDOM AREA, AND GET A RANDOM PLACEMENT WITHIN THAT AREA. THIS MAY
        // SPEED THINGS UP DRAMATICALLY WITHOUT ANY FUNCTIONAL LOSS.
        zones.forEach(zone => {
            for (let x = zone.x; x <= zone.x + zone.width - objectWidth; x++) {
                for (let y = zone.y; y <= zone.y + zone.height - objectHeight; y++) {
                    const candidate: GRect = { x, y, width: objectWidth, height: objectHeight };

                    // Step 2: Check if candidate overlaps with any placed objects
                    if (!isOverlapping(candidate)) {
                        potentialPlacements.push(candidate);
                    }
                }
            }
        });

        // Step 3: If there are any potential placements, randomly select one
        if (potentialPlacements.length > 0) {
            const selectedPlacement: GRect = GRandom.randElement(potentialPlacements);
            objects.push(selectedPlacement);
            return selectedPlacement;
        }

        // No available placements were found
        return null;
    }
}
