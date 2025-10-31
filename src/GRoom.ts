import { GRegion } from "./regions/GRegion";
import { CardDir, CubeDir, Dir9, GCityBlock, GColor, GDoorways, GPoint2D, GPoint3D, GRect, GRoomWalls, GSceneryDef, GSceneryPlan } from "./types";
import { SCENERY } from "./scenery";
import { GFF } from "./main";
import { RANDOM } from "./random";
import { GArea } from "./areas/GArea";
import { DIRECTION } from "./direction";
import { GTown } from "./GTown";
import { GChurch } from "./GChurch";
import { GStronghold } from "./strongholds/GStronghold";
import { GWallEast } from "./objects/obstacles/walls/GWallEast";
import { GWallNorth } from "./objects/obstacles/walls/GWallNorth";
import { GWallWest } from "./objects/obstacles/walls/GWallWest";
import { GWallNE } from "./objects/obstacles/walls/GWallNE";
import { GWallNW } from "./objects/obstacles/walls/GWallNW";
import { GWallSE } from "./objects/obstacles/walls/GWallSE";
import { GWallSW } from "./objects/obstacles/walls/GWallSW";
import { DEPTH } from "./depths";
import { ARRAY } from "./array";
import { GEventTrigger } from "./triggers/GEventTrigger";
import { GChurchDoorTrigger } from "./triggers/GChurchDoorTrigger";
import { GWallSouth } from "./objects/obstacles/walls/GWallSouth";
import { GInsideRegion } from "./regions/GInsideRegion";
import { STATS } from "./stats";
import { PEOPLE } from "./people";
import { GTowerDoorTrigger } from "./triggers/GTowerDoorTrigger";
import { GDungeonDoorTrigger } from "./triggers/GDungeonDoorTrigger";
import { GKeepDoorTrigger } from "./triggers/GKeepDoorTrigger";
import { GFortressDoorTrigger } from "./triggers/GFortressDoorTrigger";
import { GCastleDoorTrigger } from "./triggers/GCastleDoorTrigger";
import { GOutsideRegion } from "./regions/GOutsideRegion";
import { GObstacleStatic } from "./objects/obstacles/GObstacleStatic";
import { AREA } from "./area";
import { GBuildingExit } from "./objects/touchables/GBuildingExit";
import { GOverheadDecoration } from "./objects/decorations/GOverheadDecoration";
import { GForegroundDecoration } from "./objects/decorations/GForegroundDecoration";
import { GStrongholdNorthArchTrigger } from "./triggers/GStrongholdNorthArchTrigger";
import { GSector } from "./regions/GSector";
import { GStrongholdArea } from "./areas/GStrongholdArea";
import { GLockedDoor } from "./objects/touchables/GLockedDoor";

const WALL_GUARD_THICK: number = 10;
const WALL_CTRS: number[] = [
    32, 96, 160, 224, 288, 352, 416, 480, 544, 608, 672, 736, 800, 864, 928, 992
];
const HORZ_ROAD_PASSAGE_SECTION: boolean[] = [
    true, true, true, true, true, true, false, false, false, false, true, true, true, true, true, true
];
const VERT_ROAD_PASSAGE_SECTION: boolean[] = [
    true, true, true, true, false, false, false, true, true, true, true
];
const HORZ_WALL_SECTIONS: number = 16;
const VERT_WALL_SECTIONS: number = 11;
const TERRAIN_FADE_ALPHA: number = .5;
const MIN_SCENERY_GAP: number = 16;

const NORTH_DOOR_X: number = 448;
const SOUTH_DOOR_X: number = 470;
const VERT_MID_X: number = 485;
const HORZ_DOOR_Y: number = 236;

const SHRINE_AREA_WIDTH: number = 256;
const SHRINE_AREA_HEIGHT: number = 103;
const SHRINE_BORDER_SIZE: number = 64;
const SHRINE_FRONT_SPACE: number = 100;

type TestZone = GRect &{
    label: string;
    color: GColor;
};

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
    private noSceneryZones: GRect[] = [];
    private region: GRegion;
    private sector: GSector|undefined = undefined;
    private town: GTown|null = null;
    private church: GChurch|null = null;
    private stronghold: GStronghold|null = null;
    private portalRoom: GRoom|null = null;
    private walls: GRoomWalls;
    private doorways: GDoorways = {
        [Dir9.N]: false,
        [Dir9.E]: false,
        [Dir9.S]: false,
        [Dir9.W]: false,
    };
    private lockedDoors: GDoorways = {
        [Dir9.N]: false,
        [Dir9.E]: false,
        [Dir9.S]: false,
        [Dir9.W]: false,
    };
    private startRoom: boolean = false;
    private discovered: boolean = false;
    private travelAgency: boolean = false;
    private chestItem: string|null = null;

    // Permanent event triggers are added once when the room is planned
    private permanentEventTriggers: GEventTrigger[] = [];
    // Temporary event triggers are added each time the room is loaded, and cleared on unload
    private temporaryEventTriggers: GEventTrigger[] = [];

    private testZones: TestZone[] = [];
    private yards: GRect[] = [];
    private roomLog: string[] = [];

    constructor(floor: number, x: number, y: number, area: GArea) {
        this.area = area;
        this.floor = floor;
        this.x = x;
        this.y = y;
        this.addRoomLogEntry(`*** Room @ ${x},${y}...`);
        this.walls = {
            [Dir9.N]: new Array(HORZ_WALL_SECTIONS).fill(false),
            [Dir9.E]: new Array(VERT_WALL_SECTIONS).fill(false),
            [Dir9.S]: new Array(HORZ_WALL_SECTIONS).fill(false),
            [Dir9.W]: new Array(VERT_WALL_SECTIONS).fill(false)
        };
    }

    public setStart() {
        this.startRoom = true;
        PEOPLE.createPreacher(this.church as GChurch);
    }

    public isStart(): boolean {
        return this.startRoom;
    }

    public setTravelLocation() {
        this.travelAgency = true;
    }

    public isTravelLocation(): boolean {
        return this.travelAgency;
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

    public getChestItem(): string|null {
        return this.chestItem;
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

    public getPortalRoom(): GRoom|null {
        return this.portalRoom;
    }

    public setRegion(region: GRegion) {
        this.region = region;
        this.region.addRoom(this);
    }

    public getRegion(): GRegion {
        return this.region;
    }

    public getSector(): GSector|undefined {
        return this.sector;
    }

    public setSector(sector: GSector) {
        this.sector = sector;
        this.sector.addRoom(this);
    }

    public getUpstairsRoom(): GRoom|null {
        if (this.portalRoom !== null) {
            return this.portalRoom.getArea() === this.getArea() && this.portalRoom.getFloor() > this.floor ? this.portalRoom : null;
        }
        return null;
    }

    public getDownstairsRoom(): GRoom|null {
        if (this.portalRoom !== null) {
            return this.portalRoom.getArea() === this.getArea() && this.portalRoom.getFloor() < this.floor ? this.portalRoom : null;
        }
        return null;
    }

    public isDiscovered(): boolean {
        return this.discovered;
    }

    public discover() {
        if (!this.discovered) {
            STATS.changeInt('RoomsExplored', 1);
        }
        this.discovered = true;
    }

    public conceal() {
        if (this.discovered) {
            STATS.changeInt('RoomsExplored', -1);
        }
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
        } else if (this.hasPlanKey('purple_chest')) {
            return 'map_purple_chest';
        } else if (this.hasPlanKey('red_chest')) {
            return 'map_red_chest';
        }
        return null;
    }

    public getEncounterBg(): string {
        if (this.town) {
            return 'town_enc_bg';
        } else {
            return this.region.getEncBgImageName();
        }
    }

    public addPermanentEventTrigger(trigger: GEventTrigger) {
        this.permanentEventTriggers.push(trigger);
    }

    public addTemporaryEventTrigger(trigger: GEventTrigger) {
        this.temporaryEventTriggers.push(trigger);
    }

    public getEventTriggers(): GEventTrigger[] {
        return this.permanentEventTriggers.concat(this.temporaryEventTriggers);
    }

    public setFullWall(dir: CardDir, wall: boolean) {
        const sections = new Array(this.walls[dir].length).fill(wall);
        this.setWallSections(dir, sections);
    }

    public setWallSections(dir: CardDir, sections: boolean[]) {
        if (this.walls[dir] && this.walls[dir].length === sections.length) {
            this.walls[dir] = sections;
        } else {
            throw new Error(`Wall (${DIRECTION.dir9Texts()[dir]}) sections (${sections.length}) length mismatch!`);
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

    public getNearestWallCenter(wallDir: CardDir, point: GPoint2D): GPoint2D {
        const findNearest = (wallSections: boolean[], target: number): number|undefined => {
            const limit = Math.min(WALL_CTRS.length, wallSections.length);
            return WALL_CTRS.slice(0, limit).reduce((prev, curr, index) => {
                if (wallSections[index]){
                    return prev;
                }
                if (prev === undefined) {
                    return curr;
                }
                return Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev;
            }, undefined as number | undefined);
        };

        switch (wallDir) {
            case Dir9.N:
                return {
                    x: findNearest(this.getWallSections(wallDir), point.x) as number,
                    y: GFF.TOP_BOUND + (GFF.TILE_H / 2)
                };
            case Dir9.E:
                return {
                    x: GFF.RIGHT_BOUND - (GFF.TILE_H / 2),
                    y: findNearest(this.getWallSections(wallDir), point.y) as number
                };
            case Dir9.S:
                return {
                    x: findNearest(this.getWallSections(wallDir), point.x) as number,
                    y: GFF.BOTTOM_BOUND - (GFF.TILE_H / 2)
                };
            case Dir9.W:
                return {
                    x: GFF.LEFT_BOUND + (GFF.TILE_H / 2),
                    y: findNearest(this.getWallSections(wallDir), point.y) as number
                };
        }
    }

    public setDoorway(dir: CardDir, hasDoorway: boolean) {
        this.doorways[dir] = hasDoorway;
    }

    public hasDoorway(dir: CardDir): boolean {
        return this.doorways[dir];
    }

    public setLockedDoor(dir: CardDir, isLocked: boolean) {
        this.lockedDoors[dir] = isLocked;
    }

    public hasLockedDoor(dir: CardDir): boolean {
        return this.lockedDoors[dir];
    }

    public hasNeighbor(direction: CubeDir): boolean {
        const velocity: GPoint3D = DIRECTION.getVelocity3d(direction);
        return this.area.containsRoom(this.floor - velocity.z, this.x + velocity.x, this.y + velocity.y);
    }

    public getNeighbor(direction: CubeDir): GRoom|null {
        const velocity: GPoint3D = DIRECTION.getVelocity3d(direction);
        return this.area.getRoomAt(this.floor - velocity.z, this.x + velocity.x, this.y + velocity.y);
    }

    public getNeighbors(condition?: (n: GRoom) => boolean): GRoom[] {
        const neighbors: GRoom[] = [];
        for (let d: number = 0; d < 6; d++) {
            const neighbor: GRoom|null = this.getNeighbor(DIRECTION.cubeDirFrom6(d as 0|1|2|3|4|5));
            if (neighbor) {
                if (condition === undefined || condition(neighbor)) {
                    neighbors.push(neighbor);
                }
            }
        }
        return neighbors;
    }

    /**
     * Connects this room to a random undiscovered neighboring room by removing the wall between them.
     * This is only used for cardinal directions; we'll never remove a floor or ceiling to connect
     * rooms vertically.
     */
    public connectToRandomUndiscoveredNeighbor(): GRoom|null {
        let d: number = RANDOM.randInt(0, 3);
        const start: number = d;
        do {
            const dir: CardDir = DIRECTION.cardDirFrom4(d as 0|1|2|3);
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
        let d: number = RANDOM.randInt(0, 3);
        const start: number = d;
        do {
            const dir: CardDir = DIRECTION.cardDirFrom4(d as 0|1|2|3);
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
        if (this.church || this.area.isSafe() || this.hasPlanKey('standard') || this.hasPlanKey('shrine_curtain_ctr_gold')) {
            return true;
        } else {
            return false;
        }
    }

    public hasPlanKey(planKey: string): boolean {
        return this.plans.some(plan => plan.key === planKey);
    }

    public hasPremiumChest(): boolean {
        return this.plans.some(plan => plan.key === 'blue_chest' || plan.key === 'red_chest' || plan.key === 'purple_chest' || plan.key === 'gold_chest');
    }

    public canHavePremiumChest(): boolean {
        return !this.church && !this.town && !this.stronghold && !this.portalRoom && !this.hasPremiumChest();
    }

    public removePremiumChest() {
        const index = this.plans.findIndex(plan => plan.key === 'blue_chest' || plan.key === 'red_chest' || plan.key === 'purple_chest' || plan.key === 'gold_chest');
        if (index !== -1) {
            this.plans.splice(index, 1);
        }
    }

    public load() {
        // Set background image from region:
        if (this.region !== undefined) {
            GFF.AdventureContent.add.image(0, 0, this.region.getBgImageName()).setOrigin(0, 0).setDepth(DEPTH.BACKGROUND);
        }

        // Create terrain fade images, if applicable, based on neighbors:
        if (!this.region.isInterior()) {
            this.addFadeImageForNeighbor(Dir9.N, 'n');
            this.addFadeImageForNeighbor(Dir9.E, 'e');
            this.addFadeImageForNeighbor(Dir9.W, 'w');
            this.addFadeImageForNeighbor(Dir9.S, 's');
        }

        // Create a render-texture for any decorations:
        const decorRenderer: Phaser.GameObjects.RenderTexture = GFF.AdventureContent.add.renderTexture(GFF.ROOM_X, GFF.ROOM_Y, GFF.ROOM_W, GFF.ROOM_H);
        decorRenderer.setOrigin(0, 0).setDepth(DEPTH.BG_DECOR);

        // Create partial wall guards: (blocks movement in case player slips past wall scenery)
        // (this isn't needed for strongholds; wall guards would interfere with doorways)
        if (this.getArea() instanceof GStrongholdArea === false) {
            this.addPartialWallGuards();
        }

        // Create full wall objects:
        this.addFullWallObjects();

        // Create yard areas (impassable for player, but not for other people)
        this.addYards();

        // Create partial wall indicators (TEST):
        // this.addPartialWallIndicators();

        // Create test zones (TEST):
        for (let z of this.testZones) {
            GFF.AdventureContent.add.rectangle(z.x, z.y, z.width, z.height, z.color.num()).setOrigin(0, 0);
            GFF.AdventureContent.add.text(z.x + 4, z.y + 4, z.label, { fontSize: '12px', color: z.color.str() }).setOrigin(0, 0);
        }

        // Create scenery objects from plan:
        this.plans.forEach((plan) => {
            SCENERY.create(plan, decorRenderer);
        });
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

        // Reset the permanent event triggers:
        this.permanentEventTriggers.forEach(t => {
            t.resetTimes();
        });

        // Clear temporary event triggers:
        this.temporaryEventTriggers = [];
    }

    private addFadeImageForNeighbor(dir: CardDir, dirStr: string) {
        const neighbor: GRoom|null = this.getNeighbor(dir);
        if (neighbor && neighbor.getRegion() !== this.getRegion()) {
            const fadeImageName: string = neighbor.getRegion().getBgImageName() + `_fade_` + dirStr;
            switch (dir) {
                case Dir9.N:
                case Dir9.W:
                    GFF.AdventureContent.add.image(0, 0, fadeImageName).setOrigin(0, 0).setAlpha(TERRAIN_FADE_ALPHA).setDepth(DEPTH.FADE_IMAGE);
                    break;
                case Dir9.E:
                    GFF.AdventureContent.add.image(GFF.ROOM_W, 0, fadeImageName).setOrigin(1, 0).setAlpha(TERRAIN_FADE_ALPHA).setDepth(DEPTH.FADE_IMAGE);
                    break;
                case Dir9.S:
                    GFF.AdventureContent.add.image(0, GFF.ROOM_H, fadeImageName).setOrigin(0, 1).setAlpha(TERRAIN_FADE_ALPHA).setDepth(DEPTH.FADE_IMAGE);
                    break;
            }
        }
    }

    private addFullWallObjects() {
        if (this.region.isInterior()) {
            this.addInsideFullWallObjects();
        } else {
            this.addOutsideFullWallObjects();
        }
    }

    private addOutsideFullWallObjects(region: GOutsideRegion = this.region as GOutsideRegion) {
        const northWall: boolean = this.hasFullWall(Dir9.N);
        const westWall: boolean = this.hasFullWall(Dir9.W);
        const eastWall: boolean = this.hasFullWall(Dir9.E);
        const southWall: boolean = this.hasFullWall(Dir9.S);
        const wallSet: Record<Dir9, GSceneryDef|null> = region.getWalls();

        // Add cardinal walls:
        if (northWall) {
            new GWallNorth(wallSet[Dir9.N] as GSceneryDef);
        }
        if (westWall) {
            new GWallWest(wallSet[Dir9.W] as GSceneryDef);
        }
        if (eastWall) {
            new GWallEast(wallSet[Dir9.E] as GSceneryDef);
        }
        if (southWall) {
            new GWallSouth(wallSet[Dir9.S] as GSceneryDef);
        }

        // Add any required corner pieces (for aesthetics):
        if (northWall && westWall) {
            new GWallNW(wallSet[Dir9.NW] as GSceneryDef);
        }
        if (northWall && eastWall) {
            new GWallNE(wallSet[Dir9.NE] as GSceneryDef);
        }
        if (southWall && westWall) {
            new GWallSW(wallSet[Dir9.SW] as GSceneryDef);
        }
        if (southWall && eastWall) {
            new GWallSE(wallSet[Dir9.SE] as GSceneryDef);
        }
    }

    private addInsideFullWallObjects(region: GInsideRegion = this.region as GInsideRegion) {
        const northWall: boolean = this.hasFullWall(Dir9.N);
        const westWall: boolean = this.hasFullWall(Dir9.W);
        const eastWall: boolean = this.hasFullWall(Dir9.E);
        const southWall: boolean = this.hasFullWall(Dir9.S);

        // Walls:

        // NORTH:
        if (northWall) {
            // Sides:
            const nLeftWall: GSceneryDef|undefined = region.getWallPiece('n_left');
            const nRightWall: GSceneryDef|undefined = region.getWallPiece('n_right');
            if (nLeftWall) {
                new GObstacleStatic(nLeftWall, GFF.LEFT_BOUND, GFF.TOP_BOUND)
                    .setOrigin(0, 0)
                    .setDepth(DEPTH.WALL_NORTH);
            }
            if (nRightWall) {
                new GObstacleStatic(nRightWall, GFF.RIGHT_BOUND, GFF.TOP_BOUND)
                    .setOrigin(1, 0)
                    .setDepth(DEPTH.WALL_NORTH);
            }
            // Center:
            if (this.doorways[Dir9.N]) {
                const nDoorLower: GSceneryDef|undefined = region.getWallPiece('n_door_lower');
                if (nDoorLower) {
                    new GForegroundDecoration(nDoorLower, SOUTH_DOOR_X, GFF.TOP_BOUND)
                        .setOrigin(0, 0);
                }
                const nDoorUpper: GSceneryDef|undefined = region.getWallPiece('n_door_upper');
                if (nDoorUpper) {
                    const arch = new GOverheadDecoration(nDoorUpper, NORTH_DOOR_X, GFF.TOP_BOUND)
                        .setOrigin(0, 0);
                    this.addPermanentEventTrigger(new GStrongholdNorthArchTrigger(arch));
                }
            } else {
                const nMidWall: GSceneryDef|undefined = region.getWallPiece('n_mid');
                if (nMidWall) {
                    new GObstacleStatic(nMidWall, VERT_MID_X, GFF.TOP_BOUND)
                        .setOrigin(0, 0);
                }
            }
        }

        // WEST:
        if (westWall) {
            // Sides:
            const wTopWall: GSceneryDef|undefined = region.getWallPiece('w_top');
            const wBottomWall: GSceneryDef|undefined = region.getWallPiece('w_bottom');
            if (wTopWall) {
                new GObstacleStatic(wTopWall, GFF.LEFT_BOUND, GFF.TOP_BOUND)
                    .setOrigin(0, 0)
                    .setDepth(DEPTH.WALL_SIDE);
            }
            if (wBottomWall) {
                new GObstacleStatic(wBottomWall, GFF.LEFT_BOUND, GFF.BOTTOM_BOUND)
                    .setOrigin(0, 1)
                    .setDepth(DEPTH.WALL_SIDE);
            }
            // Center:
            if (this.doorways[Dir9.W]) {
                const wDoorLower: GSceneryDef|undefined = region.getWallPiece('w_door_lower');
                if (wDoorLower) {
                    new GObstacleStatic(wDoorLower, GFF.LEFT_BOUND, HORZ_DOOR_Y)
                        .setOrigin(0, 0)
                        .setDepth(DEPTH.DOORWAY);
                }
                const wDoorUpper: GSceneryDef|undefined = region.getWallPiece('w_door_upper');
                if (wDoorUpper) {
                    new GOverheadDecoration(wDoorUpper, GFF.LEFT_BOUND, HORZ_DOOR_Y)
                        .setOrigin(0, 0);
                }
            } else {
                const wMidWall: GSceneryDef|undefined = region.getWallPiece('w_mid');
                if (wMidWall) {
                    new GObstacleStatic(wMidWall, GFF.LEFT_BOUND, HORZ_DOOR_Y)
                        .setOrigin(0, 0);
                }
            }
        }

        // EAST:
        if (eastWall) {
            // Sides:
            const eTopWall: GSceneryDef|undefined = region.getWallPiece('e_top');
            const eBottomWall: GSceneryDef|undefined = region.getWallPiece('e_bottom');
            if (eTopWall) {
                new GObstacleStatic(eTopWall, GFF.RIGHT_BOUND, GFF.TOP_BOUND)
                    .setOrigin(1, 0)
                    .setDepth(DEPTH.WALL_SIDE);
            }
            if (eBottomWall) {
                new GObstacleStatic(eBottomWall, GFF.RIGHT_BOUND, GFF.BOTTOM_BOUND)
                    .setOrigin(1, 1)
                    .setDepth(DEPTH.WALL_SIDE);
            }
            // Center:
            if (this.doorways[Dir9.E]) {
                const eDoorLower: GSceneryDef|undefined = region.getWallPiece('e_door_lower');
                if (eDoorLower) {
                    new GObstacleStatic(eDoorLower, GFF.RIGHT_BOUND, HORZ_DOOR_Y)
                        .setOrigin(1, 0)
                        .setDepth(DEPTH.DOORWAY);
                }
                const eDoorUpper: GSceneryDef|undefined = region.getWallPiece('e_door_upper');
                if (eDoorUpper) {
                    new GOverheadDecoration(eDoorUpper, GFF.RIGHT_BOUND, HORZ_DOOR_Y)
                        .setOrigin(1, 0);
                }
            } else {
                const eMidWall: GSceneryDef|undefined = region.getWallPiece('e_mid');
                if (eMidWall) {
                    new GObstacleStatic(eMidWall, GFF.RIGHT_BOUND, HORZ_DOOR_Y)
                        .setOrigin(1, 0);
                }
            }
        }

        // SOUTH:
        if (southWall) {
            // Sides:
            const sLeftWall: GSceneryDef|undefined = region.getWallPiece('s_left');
            const sRightWall: GSceneryDef|undefined = region.getWallPiece('s_right');
            if (sLeftWall) {
                new GObstacleStatic(sLeftWall, GFF.LEFT_BOUND, GFF.BOTTOM_BOUND)
                    .setOrigin(0, 1)
                    .setDepth(DEPTH.WALL_SOUTH);
            }
            if (sRightWall) {
                new GObstacleStatic(sRightWall, GFF.RIGHT_BOUND, GFF.BOTTOM_BOUND)
                    .setOrigin(1, 1)
                    .setDepth(DEPTH.WALL_SOUTH);
            }
            // Center:
            const hasOutsidePortal: boolean = this.portalRoom?.getArea() === AREA.WORLD_AREA;
            // If this room has a portal to the outside, it needs an exit:
            if (hasOutsidePortal) {
                const exit: GBuildingExit = new GBuildingExit(GFF.ROOM_X + (GFF.ROOM_W / 2) - 36, 703);
            }
            // If this room has a portal to the outside OR a doorway to the south,
            // it needs a doorway in the south wall:
            if (this.doorways[Dir9.S] || hasOutsidePortal) {
                const sDoor: GSceneryDef|undefined = region.getWallPiece('s_door');
                if (sDoor) {
                    new GOverheadDecoration(sDoor, SOUTH_DOOR_X, GFF.BOTTOM_BOUND)
                        .setOrigin(0, 1);
                }
            } else {
                const sMidWall: GSceneryDef|undefined = region.getWallPiece('s_mid');
                if (sMidWall) {
                    new GObstacleStatic(sMidWall, VERT_MID_X, GFF.BOTTOM_BOUND)
                        .setOrigin(0, 1);
                }
            }
        }

        // Add any required corner pieces (for aesthetics):
        if (northWall && westWall) {
            const nwCorner: GSceneryDef|undefined = region.getWallPiece('nw_corner');
            if (nwCorner) {
                new GObstacleStatic(nwCorner, GFF.LEFT_BOUND, GFF.TOP_BOUND)
                    .setOrigin(0, 0)
                    .setDepth(DEPTH.WALL_N_CORNER);
            }
        }
        if (northWall && eastWall) {
            const neCorner: GSceneryDef|undefined = region.getWallPiece('ne_corner');
            if (neCorner) {
                new GObstacleStatic(neCorner, GFF.RIGHT_BOUND, GFF.TOP_BOUND)
                    .setOrigin(1, 0)
                    .setDepth(DEPTH.WALL_N_CORNER);
            }
        }
        if (southWall && westWall) {
            const swCorner: GSceneryDef|undefined = region.getWallPiece('sw_corner');
            if (swCorner) {
                new GObstacleStatic(swCorner, GFF.LEFT_BOUND, GFF.BOTTOM_BOUND)
                    .setOrigin(0, 1)
                    .setDepth(DEPTH.WALL_S_CORNER);
            }
        }
        if (southWall && eastWall) {
            const seCorner: GSceneryDef|undefined = region.getWallPiece('se_corner');
            if (seCorner) {
                new GObstacleStatic(seCorner, GFF.RIGHT_BOUND, GFF.BOTTOM_BOUND)
                    .setOrigin(1, 1)
                    .setDepth(DEPTH.WALL_S_CORNER);
            }
        }

        // Add locked doors, if any:
        if (this.hasLockedDoor(Dir9.N)) {
            new GLockedDoor('vert_locked_door', 'N').setDepth(DEPTH.LOCKED_DOOR);
        }
        if (this.hasLockedDoor(Dir9.S)) {
            new GLockedDoor('vert_locked_door', 'S').setDepth(DEPTH.LOCKED_DOOR);
        }
        if (this.hasLockedDoor(Dir9.W)) {
            new GLockedDoor('west_locked_door').setDepth(DEPTH.LOCKED_DOOR);
        }
        if (this.hasLockedDoor(Dir9.E)) {
            new GLockedDoor('east_locked_door').setDepth(DEPTH.LOCKED_DOOR);
        }
    }

    /**
     * Add partial wall indicators (TEST);
     * these are just rectangles showing the wall sections where scenery objects
     * will be placed to create a partial wall effect.
     */
    private addPartialWallIndicators() {
        const northWall: boolean[] = this.getWallSections(Dir9.N);
        const westWall: boolean[] = this.getWallSections(Dir9.W);
        const eastWall: boolean[] = this.getWallSections(Dir9.E);
        const southWall: boolean[] = this.getWallSections(Dir9.S);
        let x: number;
        let y: number;

        // North wall:
        y = 0;
        for (let w = 0; w < northWall.length; w++) {
            x = w * 64;
            if (northWall[w]) {
                GFF.AdventureContent.add.rectangle(x, y, 64, 64, 0x000000, .2).setOrigin(0, 0).setStrokeStyle(1, 0x000000, .6);
            }
        }
        // East wall:
        x = GFF.ROOM_AREA_RIGHT;
        for (let w = 0; w < eastWall.length; w++) {
            y = w * 64;
            if (eastWall[w]) {
                GFF.AdventureContent.add.rectangle(x, y, 64, 64, 0x000000, .2).setOrigin(0, 0).setStrokeStyle(1, 0x000000, .6);
            }
        }
        // West wall:
        x = 0;
        for (let w = 0; w < westWall.length; w++) {
            y = w * 64;
            if (westWall[w]) {
                GFF.AdventureContent.add.rectangle(x, y, 64, 64, 0x000000, .2).setOrigin(0, 0).setStrokeStyle(1, 0x000000, .6);
            }
        }
        // South wall:
        y = GFF.ROOM_AREA_BOTTOM;
        for (let w = 0; w < southWall.length; w++) {
            x = w * 64;
            if (southWall[w]) {
                GFF.AdventureContent.add.rectangle(x, y, 64, 64, 0x000000, .2).setOrigin(0, 0).setStrokeStyle(1, 0x000000, .6);
            }
        }
    }

    /**
     * Creates a rectanglular test zone in the room for debugging purposes.
     */
    public createTestZone(x: number, y: number, width: number, height: number, label: string, color: GColor): TestZone {
        const zone: TestZone = { x, y, width, height, label, color };
        this.testZones.push(zone);
        return zone;
    }

    public createYard(dimension: GRect) {
        this.yards.push(dimension);
    }

    private addPartialWallGuards() {
        const northWall: boolean[] = this.getWallSections(Dir9.N);
        const westWall: boolean[] = this.getWallSections(Dir9.W);
        const eastWall: boolean[] = this.getWallSections(Dir9.E);
        const southWall: boolean[] = this.getWallSections(Dir9.S);
        let x: number;
        let y: number;

        // North wall:
        y = GFF.TOP_BOUND;
        for (let w = 0; w < northWall.length; w++) {
            x = w * 64;
            if (northWall[w]) {
                this.createPartialWallGuard(x, y, GFF.TILE_W, WALL_GUARD_THICK);
            }
        }
        // East wall:
        x = GFF.RIGHT_BOUND - WALL_GUARD_THICK;
        for (let w = 0; w < eastWall.length; w++) {
            y = w * 64;
            if (eastWall[w]) {
                this.createPartialWallGuard(x, y, WALL_GUARD_THICK, GFF.TILE_H);
            }
        }
        // West wall:
        x = GFF.LEFT_BOUND;
        for (let w = 0; w < westWall.length; w++) {
            y = w * 64;
            if (westWall[w]) {
                this.createPartialWallGuard(x, y, WALL_GUARD_THICK, GFF.TILE_H);
            }
        }
        // South wall:
        y = GFF.BOTTOM_BOUND - WALL_GUARD_THICK;
        for (let w = 0; w < southWall.length; w++) {
            x = w * 64;
            // We don't want to add a wall guard if this is a building exit:
            const openDoorSection: boolean = this.portalRoom !== null &&
                this.region instanceof GInsideRegion &&
                (w === 7 || w === 8);
            if (southWall[w] && !openDoorSection) {
                this.createPartialWallGuard(x, y, GFF.TILE_W, WALL_GUARD_THICK);
            }
        }
    }

    private createPartialWallGuard(x: number, y: number, width: number, height: number) {
        const guard: Phaser.GameObjects.Rectangle = GFF.AdventureContent.add.rectangle(x, y, width, height/*, 0xff0000, .3*/).setOrigin(0, 0);
        GFF.AdventureContent.physics.add.existing(guard, false);
        (guard.body as Phaser.Physics.Arcade.Body).setImmovable(true);
        GFF.AdventureContent.addObstacle(guard);
    }

    public hasTownAndTownNeighbor(dir: CardDir, onlyIfPartialWall: boolean = true): boolean {
        const wallCheck: boolean = onlyIfPartialWall ? !this.hasFullWall(dir) : true;
        return (this.town !== null && wallCheck && this.hasNeighbor(dir) && (this.getNeighbor(dir) as GRoom).getTown() !== null);
    }

    public addYards() {
        for (let y of this.yards) {
            const yard = GFF.AdventureContent.add.rectangle(y.x, y.y, y.width, y.height, undefined, 0).setOrigin(0, 0);
            GFF.AdventureContent.physics.add.existing(yard, false);
            (yard.body as Phaser.Physics.Arcade.Body).setImmovable(true);
            GFF.AdventureContent.addYard(yard);
        }
    }

    /**
     * Adds a scenery plan by its visual x/y coordinates.
     * To position physically, the body's coordinates must be translated
     * into visual (object) coordinates prior to calling this method.
     */
    public addSceneryPlan(key: string, x: number, y: number): GSceneryPlan {
        const plan: GSceneryPlan = { key, x, y, id: this.plans.length };
        this.plans.push(plan);
        return plan;
    }

    public planPartialWallScenery(sceneryDefs: GSceneryDef[]) {
        this.addRoomLogEntry(`Planning partial-wall scenery...`);

        // Omit first/last section of N/S walls IF there is a full wall next to it:
        const omitFirstNorthSouth: boolean = this.hasFullWall(Dir9.W);
        const omitLastNorthSouth: boolean = this.hasFullWall(Dir9.E);
        // Omit first/last section of W/E walls IF there is a full wall next to it:
        const omitFirstWestEast: boolean = this.hasFullWall(Dir9.N);
        const omitLastWestEast: boolean = this.hasFullWall(Dir9.S);

        if (this.shouldPlanPartialWallScenery(Dir9.N)) {
            this.planWallSections(Dir9.N, sceneryDefs, omitFirstNorthSouth, omitLastNorthSouth);
        }
        if (this.shouldPlanPartialWallScenery(Dir9.W)) {
            this.planWallSections(Dir9.W, sceneryDefs, omitFirstWestEast, omitLastWestEast);
        }
        if (this.shouldPlanPartialWallScenery(Dir9.E)) {
            this.planWallSections(Dir9.E, sceneryDefs, omitFirstWestEast, omitLastWestEast);
        }
        if (this.shouldPlanPartialWallScenery(Dir9.S)) {
            this.planWallSections(Dir9.S, sceneryDefs, omitFirstNorthSouth, omitLastNorthSouth);
        }
    }

    private shouldPlanPartialWallScenery(dir: CardDir): boolean {
        return this.hasAnyWall(dir) && !this.hasFullWall(dir);// && !this.hasTownAndTownNeighbor(dir);
    }

    private planWallSections(dir: CardDir, sceneryPool: GSceneryDef[], omitFirst: boolean, omitLast: boolean) {
        let wallSections: boolean[] = this.getWallSections(dir);
        if (omitLast) {
            wallSections = wallSections.slice(0, -1);
        }
        this.addRoomLogEntry(`Planning ${DIRECTION.dir9Texts()[dir]} Wall...`);

        let beginWall: number|null = null;
        let endWall: number|null = null;
        let startX: number = 0;
        let startY: number = 0;
        let wallSpace: number;
        for (let w = 0; w < wallSections.length; w++) {
            if (w === 0 && omitFirst) {
                continue;
            }
            this.addRoomLogEntry(`Checking section ${w}: ${wallSections[w]}`);

            // Check currently indexed section:
            if (wallSections[w]) {
                // Section = WALL; begin if not already begun:
                if (beginWall === null) {
                    beginWall = w;
                }
                // If last wall section = WALL, set the end:
                if (w === wallSections.length - 1) {
                    endWall = w;
                }
            } else if (beginWall !== null) {
                // Section = EMPTY, and a wall is in progress; end the current wall:
                endWall = w - 1;
            }

            // If a beginning and end are defined, create scenery and reset the delimiters:
            if (beginWall !== null && endWall !== null) {
                this.addRoomLogEntry(`* Wall from ${beginWall} to ${endWall}:`);
                const tiles: number = (endWall - beginWall) + 1;
                const sceneryCombination: GSceneryDef[] = this.getSceneryCombinationForWall(sceneryPool, tiles, dir);
                RANDOM.shuffle(sceneryCombination);

                sceneryCombination.forEach(c => {
                    this.addRoomLogEntry(`${c.key}: ${c.body.x},${c.body.y} (${c.body.width}x${c.body.height})`);
                });

                switch(dir) {
                    case Dir9.N:
                    case Dir9.S:
                        wallSpace = tiles * GFF.TILE_W;
                        startX = beginWall * GFF.TILE_W;
                        break;
                    case Dir9.W:
                    case Dir9.E:
                        wallSpace = tiles * GFF.TILE_H;
                        startY = beginWall * GFF.TILE_H;
                        break;
                }
                this.distributeWallScenery(
                    sceneryCombination,
                    sceneryPool,
                    startX,
                    startY,
                    dir,
                    wallSpace
                );
                beginWall = null;
                endWall = null;
            }
        }
    }

    public setRoadPassageSections() {
        // Between town rooms, we need need "walls" with a hole in the middle,
        // allowing the roads to connect seamlessly while forcing the player
        // to only travel through the town via the roads.
        for (let d = 0; d < 4; d++) {
            const dir: CardDir = DIRECTION.cardDirFrom4(d as 0|1|2|3);
            if (this.hasTownAndTownNeighbor(dir, false)) {
                const sections: boolean[] = dir === Dir9.N || dir === Dir9.S
                    ? HORZ_ROAD_PASSAGE_SECTION
                    : VERT_ROAD_PASSAGE_SECTION;
                this.setWallSections(dir, sections);
            }
        }
    }

    private distributeWallScenery(
        sceneryCombination: GSceneryDef[],
        outerSceneryPool: GSceneryDef[],
        startX: number,
        startY: number,
        dir: CardDir,
        space: number
    ) {
        const vert: boolean = dir === Dir9.E || dir == Dir9.W;
        const minEdgeShown: number = 16;

        // Calculate total width/height of scenery objects:
        let totalSceneryWidth: number = 0;
        let totalSceneryHeight: number = 0;
        sceneryCombination.forEach(c => {
            totalSceneryWidth += c.body.width;
            totalSceneryHeight += c.body.height;
        });

        // Determine increment:
        let inc: number = 0;
        if (sceneryCombination.length > 1) {
            inc += ((space - (vert ? totalSceneryHeight : totalSceneryWidth)) / (sceneryCombination.length - 1));
        }
        this.addRoomLogEntry(`inc: ${inc}`);

        let x: number = startX;
        let y: number = startY;
        let sX: number;
        let sY: number;
        let adjustRange: number;
        for (let s of sceneryCombination) {
            sX = x;
            sY = y;

            switch(dir) {
                case Dir9.N:
                    adjustRange = s.body.height >= GFF.TILE_H ? GFF.TILE_H - minEdgeShown : GFF.CHAR_BODY_H;
                    sY = s.body.height >= GFF.TILE_H ? GFF.TOP_BOUND - (s.body.height - minEdgeShown) : GFF.TOP_BOUND;
                    sY = RANDOM.randInt(sY, sY + adjustRange);
                    break;
                case Dir9.W:
                    adjustRange = s.body.width >= GFF.TILE_W ? GFF.TILE_W - minEdgeShown : GFF.CHAR_BODY_W;
                    sX = s.body.width >= GFF.TILE_W ? GFF.LEFT_BOUND - (s.body.width - minEdgeShown) : GFF.LEFT_BOUND;
                    sX = RANDOM.randInt(sX, sX + adjustRange);
                    break;
                case Dir9.E:
                    adjustRange = s.body.width >= GFF.TILE_W ? GFF.TILE_W - minEdgeShown : GFF.CHAR_BODY_W;
                    sX = s.body.width >= GFF.TILE_W ? GFF.ROOM_AREA_RIGHT : GFF.RIGHT_BOUND - (s.body.width + GFF.CHAR_BODY_W);
                    sX = RANDOM.randInt(sX, sX + adjustRange);
                    break;
                case Dir9.S:
                    // South wall is the most unique; since scenery can be tall,
                    // let's move it more southward, even if it's a little off the screen
                    adjustRange = s.body.height >= GFF.TILE_H ? minEdgeShown : s.body.height * .85;
                    sY = s.body.height >= GFF.TILE_H ? GFF.ROOM_AREA_BOTTOM + (GFF.TILE_H / 2) : GFF.BOTTOM_BOUND - (s.body.height * .85);
                    sY = RANDOM.randInt(sY, sY + adjustRange);
                    break;
            }
            this.addSceneryPlan(s.key, sX - s.body.x, sY - s.body.y);

            if (vert) {
                y += (s.body.height + inc);
            } else {
                x += (s.body.width + inc);
            }
        }
    }

    private getSceneryCombinationForWall(
        sceneryPool: GSceneryDef[],
        tiles: number,
        dir: CardDir
    ): GSceneryDef[] {
        const results: GSceneryDef[][] = [];
        const vert: boolean = dir === Dir9.E || dir == Dir9.W;
        const space: number = vert
            ? tiles * GFF.TILE_H
            : tiles * GFF.TILE_W;
        const threshold: number = 32; // This is char body height * 2... hopefully it works!

        function backtrack(start: number, combination: GSceneryDef[], currentSum: number): void {
            // If the current sum is within the acceptable range, add the combination to results
            if (currentSum <= space && currentSum >= space - threshold) {
                results.push([...combination]);
            }

            // Try adding each item to the combination, starting from the current index
            for (let i = start; i < sceneryPool.length; i++) {
                const newSum: number = currentSum + (vert ? sceneryPool[i].body.height : sceneryPool[i].body.width);

                // Stop exploring further if adding this item exceeds space
                if (newSum > space) continue;

                // Choose the item and backtrack
                combination.push(sceneryPool[i]);
                backtrack(i, combination, newSum);
                combination.pop(); // Remove the item for the next iteration
            }
        }

        backtrack(0, [], 0);
        return RANDOM.randElement(results);
    }

    public planSceneryDuringGameplay(sceneryDef: GSceneryDef, x: number, y: number, originX: number = 0, originY: number = 0): GSceneryPlan|null {
        // If the scenery can be placed at the given location, add it and return the plan.
        // Unlike normal planning, we don't have a list of zones other planned objects;
        // we'll need to check against real, physical objects in the scene.
        const objects: GRect[] = GFF.AdventureContent.getOccupiedPhysicalSpaces();
        const object: GRect = {x: sceneryDef.body.x + x, y: sceneryDef.body.y + y, width: sceneryDef.body.width, height: sceneryDef.body.height};
        for (let otherObject of objects) {
            if (!(
                    object.x + object.width <= otherObject.x ||
                    object.x >= otherObject.x + otherObject.width ||
                    object.y + object.height <= otherObject.y ||
                    object.y >= otherObject.y + otherObject.height
            )) {
                console.log(`Scenery ${sceneryDef.key} at ${x},${y} intersects with object: ${otherObject.x},${otherObject.y} ${otherObject.width}x${otherObject.height}`);
                return null;
            }
        }
        // if (this.intersectsAny(sceneryDef.body, objects)) {
        //     return null;
        // }
        // Now that we know the space is clear, we can plan it:
        return this.planPositionedScenery(sceneryDef, x, y, originX, originY);
    }

    /**
     * Explicitly plan an object at a specific position, regardless of any zones or objects.
     * x/y are the physical coordinates; visual (object) coordinates are calculated based on the def's body.
     */
    public planPositionedScenery(sceneryDef: GSceneryDef, x: number, y: number, originX: number = 0, originY: number = 0): GSceneryPlan {
        const pX: number = x - (sceneryDef.body.width * originX) - sceneryDef.body.x;
        const pY: number = y - (sceneryDef.body.height * originY) - sceneryDef.body.y;
        return this.addSceneryPlan(sceneryDef.key, pX, pY);
    }

    // If chance is met, add min-max of scenery type
    // (adds a flexible group based on 1 chance)
    public planSceneryChanceForBatch(sceneryDef: GSceneryDef, pctChance: number, min: number, max: number, objects: GRect[], zones?: GRect[]) {
        if (RANDOM.randPct() < pctChance) {
            this.planZonedScenery(sceneryDef, RANDOM.randInt(min, max), objects, zones);
        }
    }

    // Add instance of scenery type, up to max, only if chance is met in succession
    // (assumes the same rarity for each instance)
    public planSceneryChanceForEach(sceneryDef: GSceneryDef, pctChance: number, max: number, objects: GRect[], zones?: GRect[]) {
        for (let n: number = 0; n < max; n++) {
            if (RANDOM.randPct() < pctChance) {
                this.planZonedScenery(sceneryDef, 1, objects, zones);
            }
        }
    }

    /**
     * Attempts to fit the given number of scenery objects into specified zones.
     * If zones is empty, a default zone is used.
     * If any placement fails, additional placements are skipped.
     */
    public planZonedScenery(sceneryDef: GSceneryDef, targetInstances: number, objects: GRect[], zones?: GRect[]) {
        for (let i: number = 0; i < targetInstances; i++) {
            const placement: GRect|null = this.fitScenery(sceneryDef.body.width, sceneryDef.body.height, objects, zones);
            if (placement === null) {
                return;
            }
            objects.push(placement);
            this.addSceneryPlan(sceneryDef.key, placement.x - sceneryDef.body.x, placement.y - sceneryDef.body.y);
        }
    }

    public fitScenery(objectWidth: number, objectHeight: number, objects: GRect[], zones?: GRect[]): GRect|null {
        // Create a default zone if zones is undefined;
        // The default zone allows space for walls around the perimeter.
        if (zones === undefined) {
            zones = [ {x: GFF.ROOM_AREA_LEFT, y: GFF.ROOM_AREA_TOP, width: GFF.ROOM_AREA_WIDTH, height: GFF.ROOM_AREA_HEIGHT} ];
        }

        // Add no-scenery zones to objects array (it can count as an object for keeping scenery out):
        for (let nsz of this.noSceneryZones) {
            if (!objects.includes(nsz)) {
                objects.push(nsz);
            }
        }

        // Simple placement: try random X,Y:
        let placement: GRect|null = this.simpleFit(objectWidth, objectHeight, 10, objects, zones);

        // Sample placement: sample all areas and choose a random acceptable one:
        if (!placement) {
            placement = this.sampleFit(objectWidth, objectHeight, 5, objects, zones);
        }

        // Will return null if no placement was available
        return placement;
    }

    public planRandomPremiumChestShrine(itemName: string, color: 'blue'|'red'|'purple'|'gold') {
        // Don't need to check for any intersections, because this will be planned before other scenery
        // Can go anywhere within the room area rectangle - anywhere except space reserved for walls
        const x: number = RANDOM.randInt(GFF.ROOM_AREA_LEFT + SHRINE_BORDER_SIZE, GFF.ROOM_AREA_RIGHT - SHRINE_AREA_WIDTH - SHRINE_BORDER_SIZE);
        const y: number = RANDOM.randInt(GFF.ROOM_AREA_TOP + SHRINE_BORDER_SIZE, GFF.ROOM_AREA_BOTTOM - SHRINE_AREA_HEIGHT - SHRINE_BORDER_SIZE);
        this.planChestShrine(x, y, itemName, color);
    }

    public planCenteredPremiumChestShrine(itemName: string, color: 'blue'|'red'|'purple'|'gold') {
        const x: number = (GFF.ROOM_W / 2) - (SHRINE_AREA_WIDTH / 2) - SHRINE_BORDER_SIZE;
        const y: number = (GFF.ROOM_H / 2) - (SHRINE_AREA_HEIGHT / 2) - SHRINE_BORDER_SIZE;
        this.planChestShrine(x, y, itemName, color);
    }

    private planChestShrine(x: number, y: number, itemName: string, color: 'blue'|'red'|'purple'|'gold') {
        // Create a no-scenery zone:
        this.noSceneryZones.push({x, y, width: SHRINE_AREA_WIDTH + (SHRINE_BORDER_SIZE * 2), height: SHRINE_AREA_HEIGHT + (SHRINE_BORDER_SIZE * 2) + SHRINE_FRONT_SPACE});

        // Adjust these to the physical bounds of the enclosed objects:
        x += SHRINE_BORDER_SIZE;
        y += SHRINE_BORDER_SIZE;

        // Add pillars:
        const pillarDef: GSceneryDef = SCENERY.def('shrine_pillar');
        this.planPositionedScenery(pillarDef, x + 37, y); // Upper-left
        this.planPositionedScenery(pillarDef, x + 37 + 118, y); // Upper-right
        this.planPositionedScenery(pillarDef, x, y + SHRINE_AREA_HEIGHT - pillarDef.body.height); // Lower-left
        this.planPositionedScenery(pillarDef, x + SHRINE_AREA_WIDTH - pillarDef.body.width, y + SHRINE_AREA_HEIGHT - pillarDef.body.height); // Lower-right

        // Add pedestal:
        this.planPositionedScenery(SCENERY.def('shrine_pedestal'), x + 97, y + 44);

        // Add curtains:
        this.planPositionedScenery(SCENERY.def(`shrine_curtain_ctr_${color}`), x + 86, y - 113);
        this.planPositionedScenery(SCENERY.def(`shrine_curtain_left_${color}`), x + 48, y - 117);
        this.planPositionedScenery(SCENERY.def(`shrine_curtain_right_${color}`), x + SHRINE_AREA_WIDTH - 48 - 44, y - 117);

        // Add premium chest:
        this.planPositionedScenery(SCENERY.def(`${color}_chest`), x + 104, y + 32);

        // Set item to be obtained when the chest is opened:
        this.chestItem = itemName;
    }

    public planTownStreets(roadNorth: boolean, roadEast: boolean, roadSouth: boolean, roadWest: boolean): GCityBlock[] {
        const cornerBlockWidth: number = 416;
        const cornerBlockHeight: number = 256;
        const horzNorthBaseline: number = cornerBlockHeight;
        const horzSouthBaseline: number = GFF.BOTTOM_BOUND - cornerBlockHeight;
        const vertWestBaseline: number = cornerBlockWidth;
        const vertEastBaseline: number = GFF.RIGHT_BOUND - cornerBlockWidth;
        const horzWestEnd: number = vertWestBaseline;
        const vertSouthStart: number = horzSouthBaseline;

        const fullNorthHorzBlock: GCityBlock = {
            name: 'full-north horz',
            base: horzNorthBaseline,
            start: GFF.ROOM_X,
            end: GFF.ROOM_W,
            anchor: 'bottom',
            orientation: 'front',
            dimension: { x: GFF.LEFT_BOUND, y: GFF.TOP_BOUND, width: GFF.ROOM_W, height: cornerBlockHeight },
        };
        const fullSouthHorzBlock: GCityBlock = {
            name: 'full-south horz',
            base: horzSouthBaseline,
            start: GFF.ROOM_X,
            end: GFF.ROOM_W,
            anchor: 'top',
            orientation: 'back',
            dimension: { x: GFF.LEFT_BOUND, y: horzSouthBaseline, width: GFF.ROOM_W, height: cornerBlockHeight },
        };
        const fullWestVertBlock: GCityBlock = {
            name: 'full-west vert',
            base: vertWestBaseline,
            start: GFF.ROOM_Y,
            end: GFF.ROOM_H,
            anchor: 'right',
            orientation: 'side',
            dimension: { x: GFF.LEFT_BOUND, y: GFF.TOP_BOUND, width: cornerBlockWidth, height: GFF.ROOM_H },
        };
        const fullEastVertBlock: GCityBlock = {
            name: 'full-east vert',
            base: vertEastBaseline,
            start: GFF.ROOM_Y,
            end: GFF.ROOM_H,
            anchor: 'left',
            orientation: 'side',
            dimension: { x: vertEastBaseline, y: GFF.TOP_BOUND, width: cornerBlockWidth, height: GFF.ROOM_H },
        };
        const nwHorz: GCityBlock = {
            name: 'NW horz',
            base: horzNorthBaseline,
            start: GFF.ROOM_X,
            end: horzWestEnd,
            anchor: 'bottom',
            orientation: 'front',
            dimension: { x: GFF.LEFT_BOUND, y: GFF.TOP_BOUND, width: cornerBlockWidth, height: cornerBlockHeight },
        };
        const neHorz: GCityBlock = {
            name: 'NE horz',
            base: horzNorthBaseline,
            start: vertEastBaseline,
            end: GFF.ROOM_W,
            anchor: 'bottom',
            orientation: 'front',
            dimension: { x: vertEastBaseline, y: GFF.TOP_BOUND, width: cornerBlockWidth, height: cornerBlockHeight },
        };
        const swHorz: GCityBlock = {
            name: 'SW horz',
            base: horzSouthBaseline,
            start: GFF.ROOM_X,
            end: horzWestEnd,
            anchor: 'top',
            orientation: 'back',
            dimension: { x: GFF.LEFT_BOUND, y: horzSouthBaseline, width: cornerBlockWidth, height: cornerBlockHeight },
        };
        const seHorz: GCityBlock = {
            name: 'SE horz',
            base: horzSouthBaseline,
            start: vertEastBaseline,
            end: GFF.ROOM_W,
            anchor: 'top',
            orientation: 'back',
            dimension: { x: vertEastBaseline, y: horzSouthBaseline, width: cornerBlockWidth, height: cornerBlockHeight },
        };
        const nwVert: GCityBlock = {
            name: 'NW vert',
            base: vertWestBaseline,
            start: GFF.ROOM_Y,
            end: horzNorthBaseline,
            anchor: 'right',
            orientation: 'side',
            dimension: { x: GFF.LEFT_BOUND, y: GFF.TOP_BOUND, width: cornerBlockWidth, height: cornerBlockHeight },
        };
        const neVert: GCityBlock = {
            name: 'NE vert',
            base: vertEastBaseline,
            start: GFF.ROOM_Y,
            end: horzNorthBaseline,
            anchor: 'left',
            orientation: 'side',
            dimension: { x: vertEastBaseline, y: GFF.TOP_BOUND, width: cornerBlockWidth, height: cornerBlockHeight },
        };
        const swVert: GCityBlock = {
            name: 'SW vert',
            base: vertWestBaseline,
            start: vertSouthStart,
            end: GFF.ROOM_H,
            anchor: 'right',
            orientation: 'side',
            dimension: { x: GFF.LEFT_BOUND, y: horzSouthBaseline, width: cornerBlockWidth, height: cornerBlockHeight },
        };
        const seVert: GCityBlock = {
            name: 'SE vert',
            base: vertEastBaseline,
            start: vertSouthStart,
            end: GFF.ROOM_H,
            anchor: 'left',
            orientation: 'side',
            dimension: { x: vertEastBaseline, y: horzSouthBaseline, width: cornerBlockWidth, height: cornerBlockHeight },
        };

        // Add eligible blocks based on road rules:
        const cityBlocks: GCityBlock[] = [];
        if (roadWest && roadEast && !roadNorth) {
            cityBlocks.push(fullNorthHorzBlock);
        }
        if (roadWest && roadEast && !roadSouth) {
            cityBlocks.push(fullSouthHorzBlock);
        }
        if (roadNorth && roadSouth && !roadWest) {
            cityBlocks.push(fullWestVertBlock);
        }
        if (roadNorth && roadSouth && !roadEast) {
            cityBlocks.push(fullEastVertBlock);
        }
        if (roadWest) {
            cityBlocks.push(nwHorz);
            cityBlocks.push(swHorz);
        }
        if (roadEast) {
            cityBlocks.push(neHorz);
            cityBlocks.push(seHorz);
        }
        if (roadNorth) {
            cityBlocks.push(nwVert);
            cityBlocks.push(neVert);
        }
        if (roadSouth) {
            cityBlocks.push(swVert);
            cityBlocks.push(seVert);
        }

        // At this point, if there are any full blocks, we can
        // remove any partial blocks that make up the same areas:
        if (cityBlocks.includes(fullNorthHorzBlock)) {
            ARRAY.removeObject(nwHorz, cityBlocks);
            ARRAY.removeObject(neHorz, cityBlocks);
            ARRAY.removeObject(nwVert, cityBlocks);
            ARRAY.removeObject(neVert, cityBlocks);
        }
        if (cityBlocks.includes(fullSouthHorzBlock)) {
            ARRAY.removeObject(swHorz, cityBlocks);
            ARRAY.removeObject(seHorz, cityBlocks);
            ARRAY.removeObject(swVert, cityBlocks);
            ARRAY.removeObject(seVert, cityBlocks);
        }
        if (cityBlocks.includes(fullWestVertBlock)) {
            ARRAY.removeObject(nwHorz, cityBlocks);
            ARRAY.removeObject(swHorz, cityBlocks);
            ARRAY.removeObject(nwVert, cityBlocks);
            ARRAY.removeObject(swVert, cityBlocks);
        }
        if (cityBlocks.includes(fullEastVertBlock)) {
            ARRAY.removeObject(neHorz, cityBlocks);
            ARRAY.removeObject(seHorz, cityBlocks);
            ARRAY.removeObject(neVert, cityBlocks);
            ARRAY.removeObject(seVert, cityBlocks);
        }

        // Check partial (corner) blocks; if the same block exists for both
        // directions, prefer horz and remove vert
        if (cityBlocks.includes(nwHorz) && cityBlocks.includes(nwVert)) {
            ARRAY.removeObject(nwVert, cityBlocks);
        }
        if (cityBlocks.includes(neHorz) && cityBlocks.includes(neVert)) {
            ARRAY.removeObject(neVert, cityBlocks);
        }
        if (cityBlocks.includes(swHorz) && cityBlocks.includes(swVert)) {
            ARRAY.removeObject(swVert, cityBlocks);
        }
        if (cityBlocks.includes(seHorz) && cityBlocks.includes(seVert)) {
            ARRAY.removeObject(seVert, cityBlocks);
        }

        // This method is only called on town rooms, so there will always be
        // at least one road from an edge to the center. Therfore, ALWAYS put
        // a no-scenery zone in the center:
        this.noSceneryZones.push(this.getTileArea(7, 4, 2, 3));

        // Roads toward other town rooms
        // These are unaffected by intersection tiles in the center;
        // if there is an intersection, special center tiles are added after.
        if (roadNorth) {
            for (let y: number = 0; y <= 3; y++) {
                this.planTileScenery('street_vert_w', 7, y);
                this.planTileScenery('street_vert_e', 8, y);
            }
            this.noSceneryZones.push(this.getTileArea(7, 0, 2, 4));
        }
        if (roadSouth) {
            for (let y: number = 7; y <= 10; y++) {
                this.planTileScenery('street_vert_w', 7, y);
                this.planTileScenery('street_vert_e', 8, y);
            }
            this.noSceneryZones.push(this.getTileArea(7, 7, 2, 4));
        }
        if (roadWest) {
            for (let x: number = 0; x <= 6; x++) {
                this.planTileScenery('street_horz_n', x, 4);
                this.planTileScenery('street_horz_c', x, 5);
                this.planTileScenery('street_horz_s', x, 6);
            }
            this.noSceneryZones.push(this.getTileArea(0, 4.5, 7, 2));
        }
        if (roadEast) {
            for (let x: number = 9; x <= 15; x++) {
                this.planTileScenery('street_horz_n', x, 4);
                this.planTileScenery('street_horz_c', x, 5);
                this.planTileScenery('street_horz_s', x, 6);
            }
            this.noSceneryZones.push(this.getTileArea(9, 4.5, 7, 2));
        }

        // Test for different types of intersections, from most directions to least.

        // 4-way intersection
        if (roadNorth && roadWest && roadEast && roadSouth) {
            this.planTileScenery('street_vert_nw_int', 7, 4);
            this.planTileScenery('street_vert_ne_int', 8, 4);
            this.planTileScenery('street_t_nws', 7, 5);
            this.planTileScenery('street_t_nes', 8, 5);
            this.planTileScenery('street_vert_sw_int', 7, 6);
            this.planTileScenery('street_vert_se_int', 8, 6);
        }

        // 3-way intersections (T)
        if (roadNorth && roadWest && roadEast && (!roadSouth)) {
            this.planTileScenery('street_vert_nw_int', 7, 4);
            this.planTileScenery('street_vert_ne_int', 8, 4);
            this.planTileScenery('street_t_nwe_w', 7, 5);
            this.planTileScenery('street_t_nwe_e', 8, 5);
            this.planTileScenery('street_horz_s', 7, 6);
            this.planTileScenery('street_horz_s', 8, 6);
        }
        if (roadSouth && roadWest && roadEast && (!roadNorth)) {
            this.planTileScenery('street_horz_n', 7, 4);
            this.planTileScenery('street_horz_n', 8, 4);
            this.planTileScenery('street_t_wes_w', 7, 5);
            this.planTileScenery('street_t_wes_e', 8, 5);
            this.planTileScenery('street_vert_sw_int', 7, 6);
            this.planTileScenery('street_vert_se_int', 8, 6);
        }
        if (roadNorth && roadWest && roadSouth && (!roadEast)) {
            this.planTileScenery('street_vert_nw_int', 7, 4);
            this.planTileScenery('street_vert_e', 8, 4);
            this.planTileScenery('street_t_nws', 7, 5);
            this.planTileScenery('street_vert_e', 8, 5);
            this.planTileScenery('street_vert_sw_int', 7, 6);
            this.planTileScenery('street_vert_e', 8, 6);
        }
        if (roadNorth && roadEast && roadSouth && (!roadWest)) {
            this.planTileScenery('street_vert_w', 7, 4);
            this.planTileScenery('street_vert_ne_int', 8, 4);
            this.planTileScenery('street_vert_w', 7, 5);
            this.planTileScenery('street_t_nes', 8, 5);
            this.planTileScenery('street_vert_w', 7, 6);
            this.planTileScenery('street_vert_se_int', 8, 6);
        }

        // 2-way intersections: bends
        if (roadNorth && roadWest && (!roadEast) && (!roadSouth)) {
            this.planTileScenery('street_vert_nw_int', 7, 4);
            this.planTileScenery('street_vert_e', 8, 4);
            this.planTileScenery('street_curve_nw_inner', 7, 5);
            this.planTileScenery('street_curve_nw_minor', 8, 5);
            this.planTileScenery('street_horz_s', 7, 6);
            this.planTileScenery('street_curve_nw_major', 8, 6);
        }
        if (roadNorth && roadEast && (!roadWest) && (!roadSouth)) {
            this.planTileScenery('street_vert_w', 7, 4);
            this.planTileScenery('street_vert_ne_int', 8, 4);
            this.planTileScenery('street_curve_ne_minor', 7, 5);
            this.planTileScenery('street_curve_ne_inner', 8, 5);
            this.planTileScenery('street_curve_ne_major', 7, 6);
            this.planTileScenery('street_horz_s', 8, 6);
        }
        if (roadSouth && roadWest && (!roadEast) && (!roadNorth)) {
            this.planTileScenery('street_horz_n', 7, 4);
            this.planTileScenery('street_curve_sw_major', 8, 4);
            this.planTileScenery('street_curve_sw_inner', 7, 5);
            this.planTileScenery('street_curve_sw_minor', 8, 5);
            this.planTileScenery('street_vert_sw_int', 7, 6);
            this.planTileScenery('street_vert_e', 8, 6);
        }
        if (roadSouth && roadEast && (!roadWest) && (!roadNorth)) {
            this.planTileScenery('street_curve_se_major', 7, 4);
            this.planTileScenery('street_horz_n', 8, 4);
            this.planTileScenery('street_curve_se_minor', 7, 5);
            this.planTileScenery('street_curve_se_inner', 8, 5);
            this.planTileScenery('street_vert_w', 7, 6);
            this.planTileScenery('street_vert_se_int', 8, 6);
        }

        // 2-way straight
        if (roadNorth && roadSouth && (!roadWest) && (!roadEast)) {
            this.planTileScenery('street_vert_w', 7, 4);
            this.planTileScenery('street_vert_e', 8, 4);
            this.planTileScenery('street_vert_w', 7, 5);
            this.planTileScenery('street_vert_e', 8, 5);
            this.planTileScenery('street_vert_w', 7, 6);
            this.planTileScenery('street_vert_e', 8, 6);
        }
        if (roadWest && roadEast && (!roadNorth) && (!roadSouth)) {
            this.planTileScenery('street_horz_n', 7, 4);
            this.planTileScenery('street_horz_n', 8, 4);
            this.planTileScenery('street_horz_c', 7, 5);
            this.planTileScenery('street_horz_c', 8, 5);
            this.planTileScenery('street_horz_s', 7, 6);
            this.planTileScenery('street_horz_s', 8, 6);
        }

        // Dead ends
        if (roadNorth && (!roadSouth) && (!roadWest) && (!roadEast)) {
            this.planTileScenery('street_vert_w', 7, 4);
            this.planTileScenery('street_vert_e', 8, 4);
            this.planTileScenery('street_curve_ne_minor', 7, 5);
            this.planTileScenery('street_curve_nw_minor', 8, 5);
            this.planTileScenery('street_curve_ne_major', 7, 6);
            this.planTileScenery('street_curve_nw_major', 8, 6);
        }
        if (roadSouth && (!roadNorth) && (!roadWest) && (!roadEast)) {
            this.planTileScenery('street_curve_se_major', 7, 4);
            this.planTileScenery('street_curve_sw_major', 8, 4);
            this.planTileScenery('street_curve_se_minor', 7, 5);
            this.planTileScenery('street_curve_sw_minor', 8, 5);
            this.planTileScenery('street_vert_w', 7, 6);
            this.planTileScenery('street_vert_e', 8, 6);
        }
        if (roadWest && (!roadSouth) && (!roadEast) && (!roadNorth)) {
            this.planTileScenery('street_horz_n', 7, 4);
            this.planTileScenery('street_curve_sw_major', 8, 4);
            this.planTileScenery('street_horz_c', 7, 5);
            this.planTileScenery('street_deadend_w', 8, 5);
            this.planTileScenery('street_horz_s', 7, 6);
            this.planTileScenery('street_curve_nw_major', 8, 6);
        }
        if (roadEast && (!roadSouth) && (!roadWest) && (!roadNorth)) {
            this.planTileScenery('street_curve_se_major', 7, 4);
            this.planTileScenery('street_horz_n', 8, 4);
            this.planTileScenery('street_deadend_e', 7, 5);
            this.planTileScenery('street_horz_c', 8, 5);
            this.planTileScenery('street_curve_ne_major', 7, 6);
            this.planTileScenery('street_horz_s', 8, 6);
        }

        // Add curbs along the edges of all roads
        this.createCurbs(roadNorth, roadEast, roadSouth, roadWest);

        // We know which blocks are used, so we can create yards for them now
        // (skip church rooms - they don't have real blocks)
        if (!this.church) {
            for (let block of cityBlocks) {
                this.createYard(block.dimension);
            }
        }
        return cityBlocks;
    }

    private createCurbs(roadNorth: boolean, roadEast: boolean, roadSouth: boolean, roadWest: boolean) {
        const H_MAX = 1024;
        const V_MAX = 704;

        const CURB_N_HT = 12;
        const CURB_S_HT = 9;
        const CURB_VERT_WD = 9;
        const CURB_INSET = 5; // Curb inset from road edge
        const CURB_OUT_HZ = CURB_VERT_WD - (CURB_INSET + 1); // Horizontal curb out from road edge
        const CURB_OUT_N = CURB_N_HT - (CURB_INSET + 1);     // North curb out from road edge
        const CURB_OUT_S = CURB_S_HT - (CURB_INSET + 1);     // South curb out from road edge

        const ROAD_VERT_L = 448;
        const ROAD_VERT_R = ROAD_VERT_L + (GFF.TILE_W * 2) - 1;

        const ROAD_HORZ_T = 288;
        const ROAD_HORZ_B = ROAD_HORZ_T + (GFF.TILE_W * 2) - 1;

        const CURB_BEND_WD = 74;
        const CURB_BEND_HT = 82;

        const CURB_BEND_E_X = ROAD_VERT_R + (CURB_OUT_HZ + 1) - CURB_BEND_WD;
        const CURB_BEND_W_X = ROAD_VERT_L - (CURB_OUT_HZ + 1);
        const CURB_BEND_S_Y = ROAD_HORZ_B + (CURB_OUT_S + 1) - CURB_BEND_HT;
        const CURB_BEND_N_Y = ROAD_HORZ_T - CURB_OUT_N;

        const CURB_HORZ_N_Y = ROAD_HORZ_T - CURB_OUT_N;
        const CURB_HORZ_S_Y = ROAD_HORZ_B - CURB_INSET;
        const CURB_VERT_W_X = ROAD_VERT_L - (CURB_OUT_HZ + 1);
        const CURB_VERT_E_X = ROAD_VERT_R - CURB_INSET;

        const CURB_INNER_W_X = ROAD_VERT_L + CURB_INSET;
        const CURB_INNER_E_X = ROAD_VERT_R - CURB_INSET;
        const CURB_INNER_N_Y = CURB_HORZ_N_Y + 1;
        const CURB_INNER_S_Y = CURB_HORZ_S_Y + CURB_S_HT;

        const CURB_OUTER_S_Y = CURB_BEND_N_Y + CURB_BEND_HT;

        // 4-way intersection
        if (roadNorth && roadWest && roadEast && roadSouth) {
            // NW inner (square) corner curbs
            this.planCurbLine('curb_horz_n', CURB_INNER_W_X, CURB_HORZ_N_Y, -1, 0);
            this.planCurbLine('curb_vert_w', CURB_VERT_W_X, CURB_INNER_N_Y, -1, 0);
            // NE inner (square) corner curbs
            this.planCurbLine('curb_horz_n', CURB_VERT_E_X, CURB_HORZ_N_Y, 1, H_MAX);
            this.planCurbLine('curb_vert_e', CURB_INNER_E_X, CURB_INNER_N_Y, -1, 0);
            // SW inner (square) corner curbs
            this.planCurbLine('curb_horz_s', CURB_INNER_W_X, CURB_HORZ_S_Y, -1, 0);
            this.planCurbLine('curb_vert_w', CURB_VERT_W_X, CURB_INNER_S_Y, 1, V_MAX);
            // SE inner (square) corner curbs
            this.planCurbLine('curb_horz_s', CURB_VERT_E_X, CURB_HORZ_S_Y, 1, H_MAX);
            this.planCurbLine('curb_vert_e', CURB_INNER_E_X, CURB_INNER_S_Y, 1, V_MAX);
        }

        // 3-way intersections (T)
        if (roadNorth && roadWest && roadEast && (!roadSouth)) {
            // Full straight on the south
            this.planCurbLine('curb_horz_s', -32, CURB_HORZ_S_Y, 1, H_MAX);
            // NW inner (square) corner curbs
            this.planCurbLine('curb_horz_n', CURB_INNER_W_X, CURB_HORZ_N_Y, -1, 0);
            this.planCurbLine('curb_vert_w', CURB_VERT_W_X, CURB_INNER_N_Y, -1, 0);
            // NE inner (square) corner curbs
            this.planCurbLine('curb_horz_n', CURB_VERT_E_X, CURB_HORZ_N_Y, 1, H_MAX);
            this.planCurbLine('curb_vert_e', CURB_INNER_E_X, CURB_INNER_N_Y, -1, 0);
        }
        if (roadSouth && roadWest && roadEast && (!roadNorth)) {
            // Full straight on the north
            this.planCurbLine('curb_horz_n', -32, CURB_HORZ_N_Y, 1, H_MAX);
            // SW inner (square) corner curbs
            this.planCurbLine('curb_horz_s', CURB_INNER_W_X, CURB_HORZ_S_Y, -1, 0);
            this.planCurbLine('curb_vert_w', CURB_VERT_W_X, CURB_INNER_S_Y, 1, V_MAX);
            // SE inner (square) corner curbs
            this.planCurbLine('curb_horz_s', CURB_VERT_E_X, CURB_HORZ_S_Y, 1, H_MAX);
            this.planCurbLine('curb_vert_e', CURB_INNER_E_X, CURB_INNER_S_Y, 1, V_MAX);
        }
        if (roadNorth && roadWest && roadSouth && (!roadEast)) {
            // Full straight on the east
            this.planCurbLine('curb_vert_e', CURB_VERT_E_X, -32, 1, V_MAX);
            // NW inner (square) corner curbs
            this.planCurbLine('curb_horz_n', CURB_INNER_W_X, CURB_HORZ_N_Y, -1, 0);
            this.planCurbLine('curb_vert_w', CURB_VERT_W_X, CURB_INNER_N_Y, -1, 0);
            // SW inner (square) corner curbs
            this.planCurbLine('curb_horz_s', CURB_INNER_W_X, CURB_HORZ_S_Y, -1, 0);
            this.planCurbLine('curb_vert_w', CURB_VERT_W_X, CURB_INNER_S_Y, 1, V_MAX);
        }
        if (roadNorth && roadEast && roadSouth && (!roadWest)) {
            // Full straight on the west
            this.planCurbLine('curb_vert_w', CURB_VERT_W_X, -32, 1, V_MAX);
            // NE inner (square) corner curbs
            this.planCurbLine('curb_horz_n', CURB_VERT_E_X, CURB_HORZ_N_Y, 1, H_MAX);
            this.planCurbLine('curb_vert_e', CURB_INNER_E_X, CURB_INNER_N_Y, -1, 0);
            // SE inner (square) corner curbs
            this.planCurbLine('curb_horz_s', CURB_VERT_E_X, CURB_HORZ_S_Y, 1, H_MAX);
            this.planCurbLine('curb_vert_e', CURB_INNER_E_X, CURB_INNER_S_Y, 1, V_MAX);
        }

        // 2-way intersections: bends
        if (roadNorth && roadWest && (!roadEast) && (!roadSouth)) {
            this.planPositionedScenery(SCENERY.def('curb_bend_se'), CURB_BEND_E_X, CURB_BEND_S_Y);
            // NW inner (square) corner curbs
            this.planCurbLine('curb_horz_n', CURB_INNER_W_X, CURB_HORZ_N_Y, -1, 0);
            this.planCurbLine('curb_vert_w', CURB_VERT_W_X, CURB_INNER_N_Y, -1, 0);
            // SE outer (rounded) corner curbs
            this.planCurbLine('curb_horz_s', CURB_BEND_E_X, CURB_HORZ_S_Y, -1, 0);
            this.planCurbLine('curb_vert_e', CURB_VERT_E_X, CURB_BEND_S_Y, -1, 0);
        }
        if (roadNorth && roadEast && (!roadWest) && (!roadSouth)) {
            this.planPositionedScenery(SCENERY.def('curb_bend_sw'), CURB_BEND_W_X, CURB_BEND_S_Y);
            // NE inner (square) corner curbs
            this.planCurbLine('curb_horz_n', CURB_VERT_E_X, CURB_HORZ_N_Y, 1, H_MAX);
            this.planCurbLine('curb_vert_e', CURB_INNER_E_X, CURB_INNER_N_Y, -1, 0);
            // SW outer (rounded) corner curbs
            this.planCurbLine('curb_horz_s', CURB_BEND_W_X + CURB_BEND_WD, CURB_HORZ_S_Y, 1, H_MAX);
            this.planCurbLine('curb_vert_w', CURB_VERT_W_X, CURB_BEND_S_Y, -1, 0);
        }
        if (roadSouth && roadWest && (!roadEast) && (!roadNorth)) {
            this.planPositionedScenery(SCENERY.def('curb_bend_ne'), CURB_BEND_E_X, CURB_BEND_N_Y);
            // SW inner (square) corner curbs
            this.planCurbLine('curb_horz_s', CURB_INNER_W_X, CURB_HORZ_S_Y, -1, 0);
            this.planCurbLine('curb_vert_w', CURB_VERT_W_X, CURB_INNER_S_Y, 1, V_MAX);
            // NE outer (rounded) corner curbs
            this.planCurbLine('curb_horz_n', CURB_BEND_E_X, CURB_HORZ_N_Y, -1, 0);
            this.planCurbLine('curb_vert_e', CURB_VERT_E_X, CURB_OUTER_S_Y, 1, V_MAX);
        }
        if (roadSouth && roadEast && (!roadWest) && (!roadNorth)) {
            this.planPositionedScenery(SCENERY.def('curb_bend_nw'), CURB_BEND_W_X, CURB_BEND_N_Y);
            // SE inner (square) corner curbs
            this.planCurbLine('curb_horz_s', CURB_VERT_E_X, CURB_HORZ_S_Y, 1, H_MAX);
            this.planCurbLine('curb_vert_e', CURB_INNER_E_X, CURB_INNER_S_Y, 1, V_MAX);
            // NW outer (rounded) corner curbs
            this.planCurbLine('curb_horz_n', CURB_BEND_W_X + CURB_BEND_WD, CURB_HORZ_N_Y, 1, H_MAX);
            this.planCurbLine('curb_vert_w', CURB_VERT_W_X, CURB_OUTER_S_Y, 1, V_MAX);
        }

        // 2-way straight
        if (roadNorth && roadSouth && (!roadWest) && (!roadEast)) {
            this.planCurbLine('curb_vert_w', CURB_VERT_W_X, -32, 1, V_MAX);
            this.planCurbLine('curb_vert_e', CURB_VERT_E_X, -32, 1, V_MAX);
        }
        if (roadWest && roadEast && (!roadNorth) && (!roadSouth)) {
            this.planCurbLine('curb_horz_n', -32, CURB_HORZ_N_Y, 1, H_MAX);
            this.planCurbLine('curb_horz_s', -32, CURB_HORZ_S_Y, 1, H_MAX);
        }

        // Dead ends
        if (roadNorth && (!roadSouth) && (!roadWest) && (!roadEast)) {
            this.planCurbLine('curb_vert_w', CURB_VERT_W_X, CURB_INNER_N_Y, -1, 0);
            this.planCurbLine('curb_vert_e', CURB_VERT_E_X, CURB_INNER_N_Y, -1, 0);
        }
        if (roadSouth && (!roadNorth) && (!roadWest) && (!roadEast)) {
            this.planCurbLine('curb_vert_w', CURB_VERT_W_X, CURB_INNER_S_Y, 1, V_MAX);
            this.planCurbLine('curb_vert_e', CURB_VERT_E_X, CURB_INNER_S_Y, 1, V_MAX);
        }
        if (roadWest && (!roadSouth) && (!roadEast) && (!roadNorth)) {
            this.planCurbLine('curb_horz_n', CURB_INNER_W_X, CURB_HORZ_N_Y, -1, 0);
            this.planCurbLine('curb_horz_s', CURB_INNER_W_X, CURB_HORZ_S_Y, -1, 0);
        }
        if (roadEast && (!roadSouth) && (!roadWest) && (!roadNorth)) {
            this.planCurbLine('curb_horz_n', CURB_INNER_E_X, CURB_HORZ_N_Y, 1, H_MAX);
            this.planCurbLine('curb_horz_s', CURB_INNER_E_X, CURB_HORZ_S_Y, 1, H_MAX);
        }
    }

    public planChurch() {
        const churchDef = SCENERY.def('church_front');
        const churchWidth: number = 396;
        const churchHeight: number = 409;
        const churchX: number = GFF.ROOM_X + (GFF.ROOM_W / 2) - (churchWidth / 2);
        const churchY: number = 64;
        this.planPositionedScenery(churchDef, churchX + churchDef.body.x, churchY + churchDef.body.y, 0, 0);

        // As we plan the church, we can also add a trigger for the door:
        const radius: number = 100;
        const doorX: number = churchX + (churchWidth / 2);
        const doorY: number = churchY + churchHeight;
        const animX: number = doorX - 70;
        const animY: number = doorY - 135;
        const triggerArea: GRect = {x: doorX - radius, y: doorY - radius, width: radius * 2, height: radius * 2};
        const doorSpriteDepth: number = doorY + 1;
        this.addPermanentEventTrigger(new GChurchDoorTrigger(triggerArea, {x: animX, y: animY}, doorSpriteDepth));

        // A church is an important feature that shouldn't be covered up by random scenery
        this.noSceneryZones.push({x: 312, y: 128, width: 400, height: 576});

        // If this is the starting church, we'll put a help sign outside:
        if (this.isStart()) {
            this.planPositionedScenery(SCENERY.def('help_sign'), churchX + 40, churchY + 100, 0, 0);
        }
    }

    public planChurchInterior() {
        // Pulpit:
        this.planPositionedScenery(SCENERY.def('church_pulpit'), 512, 210, .5, .5);

        // Piano:
        this.planPositionedScenery(SCENERY.def('church_piano'), 832, 160, .5, .5);

        // Left-side pews:
        let h: number = 310;
        this.planPositionedScenery(SCENERY.def('church_pew'), 287, h, .5, .5);
        this.planPositionedScenery(SCENERY.def('church_pew'), 287, h += 100, .5, .5);
        this.planPositionedScenery(SCENERY.def('church_pew'), 287, h += 100, .5, .5);

        // Right-side pews:
        h = 310;
        this.planPositionedScenery(SCENERY.def('church_pew'), 735, h, .5, .5);
        this.planPositionedScenery(SCENERY.def('church_pew'), 735, h += 100, .5, .5);
        this.planPositionedScenery(SCENERY.def('church_pew'), 735, h += 100, .5, .5);
    }

    private planCurbLine(curbKey: string, startX: number, startY: number, inc: 1|-1, target: number) {
        const curbDef: GSceneryDef = SCENERY.def(curbKey);
        const horizontal: boolean = (curbKey.includes('horz'));
        const actualInc: number = (horizontal ? curbDef.body.width : curbDef.body.height) * inc;
        let x: number = startX;
        let y: number = startY;
        while ((inc === -1 && ((horizontal && x >= target) || (!horizontal && y >= target))) ||
               (inc === 1 && ((horizontal && x <= target) || (!horizontal && y <= target)))) {
            const offsetX: number = (!horizontal) || inc > 0 ? x : x - curbDef.body.width;
            const offsetY: number = horizontal || inc > 0 ? y : y - curbDef.body.height;
            this.planPositionedScenery(curbDef, offsetX, offsetY);
            if (horizontal) {
                x += actualInc;
            } else {
                y += actualInc;
            }
        }
    }

    private sampleFit(objectWidth: number, objectHeight: number, inc: number, objects: GRect[], zones: GRect[]): GRect|null {
        let x: number;
        let y: number;
        let placement: GRect;

        let z: number = RANDOM.randInt(0, zones.length - 1);
        const start: number = z;
        do {
            if (zones[z].width > objectWidth && zones[z].height > objectHeight) {
                for (y = zones[z].y; y < zones[z].height - objectHeight; y += inc) {
                    for (x = zones[z].x; x < zones[z].width - objectWidth; x += inc) {
                        placement = {x, y, width: objectWidth, height: objectHeight};
                        if (!this.intersectsAny(placement, objects, MIN_SCENERY_GAP)) {
                            return placement;
                        }
                    }
                }
            }
            z++;
            if (z >= zones.length) {
                z = 0;
            }
        } while (z !== start)

        return null;
    }

    public planStronghold() {
        const strongholdDef: GSceneryDef = SCENERY.def((this.getStronghold() as GStronghold).getBuildingKey());
        const corruptionDef: GSceneryDef = SCENERY.def('corruption_patch');
        const cX: number = GFF.ROOM_X + (GFF.ROOM_W / 2);
        const bY: number = 480;
        const cY: number = bY - (strongholdDef.body.height / 2);
        const shX: number = cX - (strongholdDef.body.width / 2);
        const shY: number = bY - strongholdDef.body.height;
        const corDist: number = 150;

        // Create 12 corruption patches in a circle around cX,cY:
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * (Math.PI * 2);
            const x = cX + Math.cos(angle) * corDist;
            const y = cY + Math.sin(angle) * corDist;
            this.planPositionedScenery(corruptionDef as GSceneryDef, x, y);
        }
        // Put some in the center too:
        this.planPositionedScenery(corruptionDef as GSceneryDef, cX - (corDist / 2), cY - (corDist / 2));
        this.planPositionedScenery(corruptionDef as GSceneryDef, cX + (corDist / 2), cY - (corDist / 2));
        this.planPositionedScenery(corruptionDef as GSceneryDef, cX - (corDist / 2), cY + (corDist / 2));
        this.planPositionedScenery(corruptionDef as GSceneryDef, cX + (corDist / 2), cY + (corDist / 2));

        // Finally, add the stronghold itself:
        this.planPositionedScenery(strongholdDef as GSceneryDef, shX, shY);

        // Place the correct door trigger for the stronghold type:
        const radius: number = 100;
        const doorX: number = shX + (strongholdDef.body.width / 2);
        const doorY: number = bY;
        const triggerArea: GRect = {x: doorX - radius, y: doorY - radius, width: radius * 2, height: radius * 2};
        const doorSpriteDepth: number = bY + 1;

        switch(strongholdDef.key) {
            case 'tower_front':
                this.addPermanentEventTrigger(new GTowerDoorTrigger(triggerArea, {x: doorX - 88, y: doorY - 148}, doorSpriteDepth));
                break;
            case 'dungeon_front':
                this.addPermanentEventTrigger(new GDungeonDoorTrigger(triggerArea, {x: doorX - 84.5, y: doorY - 150}, doorSpriteDepth));
                break;
            case 'keep_front':
                this.addPermanentEventTrigger(new GKeepDoorTrigger(triggerArea, {x: doorX - 91.5, y: doorY - 155}, doorSpriteDepth));
                break;
            case 'fortress_front':
                this.addPermanentEventTrigger(new GFortressDoorTrigger(triggerArea, {x: doorX - 50, y: doorY - 143}, doorSpriteDepth));
                break;
            case 'castle_front':
                this.addPermanentEventTrigger(new GCastleDoorTrigger(triggerArea, {x: doorX - 65.5, y: doorY - 159}, doorSpriteDepth));
                break;
        }

        // A stronghold is an important feature that shouldn't be covered up by random scenery
        this.noSceneryZones.push({x: 312, y: 128, width: 400, height: 576});
    }

    private simpleFit(objectWidth: number, objectHeight: number, maxTries: number, objects: GRect[], zones: GRect[]): GRect|null {
        let zone: GRect;
        let x: number;
        let y: number;
        let placement: GRect;
        for (let t: number = 0; t < maxTries; t++) {
            zone = RANDOM.randElement(zones) as GRect;

            if (zone.width > objectWidth && zone.height > objectHeight) {
                x = RANDOM.randInt(zone.x, zone.x + zone.width - objectWidth);
                y = RANDOM.randInt(zone.y, zone.y + zone.height - objectHeight);
                placement = {x, y, width: objectWidth, height: objectHeight};
                if (!this.intersectsAny(placement, objects, MIN_SCENERY_GAP)) {
                    return placement;
                }
            }
        }
        return null;
    }

    private intersectsAny(object: GRect, existingObjects: GRect[], minGap: number = 0): boolean {
        for (let otherObject of existingObjects) {
            if (!(
                    object.x + object.width + minGap <= otherObject.x ||
                    object.x - minGap >= otherObject.x + otherObject.width ||
                    object.y + object.height + minGap <= otherObject.y ||
                    object.y - minGap >= otherObject.y + otherObject.height
            )) {
                return true;
            }
        }
        return false;
    }

    public planTileScenery(key: string, x: number, y: number) {
        const def: GSceneryDef = SCENERY.def(key);
        this.addSceneryPlan(key, GFF.ROOM_X + (x * GFF.TILE_W) - def.body.x, GFF.ROOM_Y + (y * GFF.TILE_H) - def.body.y);
    }

    public getTileArea(x: number, y: number, w: number, h: number): GRect {
        return {
            x: GFF.ROOM_X + (x * GFF.TILE_W),
            y: GFF.ROOM_Y + (y * GFF.TILE_H),
            width: (w * GFF.TILE_W),
            height: (h * GFF.TILE_H)
        };
    }

    public addRoomLogEntry(entry: string) {
        this.roomLog.push(entry);
    }

    public logRoomInfo() {
        // Print out room log (for testing room generation):
        this.roomLog.forEach(s => {
            console.log(s);
        });

        // Log scenery plans:
        console.log('Scenery Plans:');
        console.dir(this.plans);
    }

    public static createPortal(room1: GRoom, room2: GRoom) {
        room1.portalRoom = room2;
        room2.portalRoom = room1;
    }
}
