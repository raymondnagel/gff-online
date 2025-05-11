import { GRegion } from "./regions/GRegion";
import { CardDir, Dir9, GCityBlock, GPoint2D, GRect, GRoomWalls, GSceneryDef, GSceneryPlan } from "./types";
import { SCENERY } from "./scenery";
import { GFF } from "./main";
import { RANDOM } from "./random";
import { GArea } from "./areas/GArea";
import { DIRECTION } from "./direction";
import { GTown } from "./GTown";
import { GChurch } from "./GChurch";
import { GStronghold } from "./GStronghold";
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
import { GChurchRegion } from "./regions/GChurchRegion";
import { GWallSouthWithDoor } from "./objects/obstacles/walls/GWallSouthWithDoor";
import { GWallSouth } from "./objects/obstacles/walls/GWallSouth";
import { GInsideRegion } from "./regions/GInsideRegion";

const WALL_GUARD_THICK: number = 10;
const WALL_CTRS: number[] = [
    32, 96, 160, 224, 288, 352, 416, 480, 544, 608, 672, 736, 800, 864, 928, 992
];
const HORZ_WALL_SECTIONS: number = 16;
const VERT_WALL_SECTIONS: number = 11;
const TERRAIN_FADE_ALPHA: number = .5;
const MIN_SCENERY_GAP: number = 16;

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
    private town: GTown|null = null;
    private church: GChurch|null = null;
    private stronghold: GStronghold|null = null;
    private portalRoom: GRoom|null = null;
    private walls: GRoomWalls;
    private startRoom: boolean = false;
    private discovered: boolean = false;
    private travelAgency: boolean = false;
    private chestItem: string|null = null;
    private eventTriggers: GEventTrigger[] = [];

    private ROOM_LOG: string[] = [];

    constructor(floor: number, x: number, y: number, area: GArea) {
        this.area = area;
        this.floor = floor;
        this.x = x;
        this.y = y;
        this.ROOM_LOG.push(`*** Room @ ${x},${y}...`);
        this.walls = {
            [Dir9.N]: new Array(HORZ_WALL_SECTIONS).fill(false),
            [Dir9.E]: new Array(VERT_WALL_SECTIONS).fill(false),
            [Dir9.S]: new Array(HORZ_WALL_SECTIONS).fill(false),
            [Dir9.W]: new Array(VERT_WALL_SECTIONS).fill(false)
        };
    }

    public setStart() {
        this.startRoom = true;
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
        } else if (this.hasPlanKey('blue_chest')) {
            return 'map_blue_chest';
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

    public addEventTrigger(trigger: GEventTrigger) {
        this.eventTriggers.push(trigger);
    }

    public getEventTriggers(): GEventTrigger[] {
        return this.eventTriggers;
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

    public hasNeighbor(direction: Dir9): boolean {
        const velocity: GPoint2D = DIRECTION.getVelocity(direction);
        return this.area.containsRoom(this.floor, this.x + velocity.x, this.y + velocity.y);
    }

    public getNeighbor(direction: Dir9): GRoom|null {
        const velocity: GPoint2D = DIRECTION.getVelocity(direction);
        return this.area.getRoomAt(this.floor, this.x + velocity.x, this.y + velocity.y);
    }

    public getNeighbors(condition?: (n: GRoom) => boolean): GRoom[] {
        const neighbors: GRoom[] = [];
        for (let d: number = 0; d < 4; d++) {
            const neighbor: GRoom|null = this.getNeighbor(DIRECTION.cardDirFrom4(d as 0|1|2|3));
            if (neighbor) {
                if (condition === undefined || condition(neighbor)) {
                    neighbors.push(neighbor);
                }
            }
        }
        return neighbors;
    }

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
        if (this.church || this.area.isSafe()) {
            return true;
        } else {
            return false;
        }
    }

    public hasPlanKey(planKey: string): boolean {
        return this.plans.some(plan => plan.key === planKey);
    }

    public hasPremiumChest(): boolean {
        return this.plans.some(plan => plan.key === 'blue_chest' || plan.key === 'red_chest');
    }

    public canHavePremiumChest(): boolean {
        return !this.church && !this.town && !this.stronghold && !this.hasPremiumChest();
    }

    public removePremiumChest() {
        const index = this.plans.findIndex(plan => plan.key === 'blue_chest' || plan.key === 'red_chest');
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
        this.addFadeImageForNeighbor(Dir9.N, 'n');
        this.addFadeImageForNeighbor(Dir9.E, 'e');
        this.addFadeImageForNeighbor(Dir9.W, 'w');
        this.addFadeImageForNeighbor(Dir9.S, 's');

        // Create a render-texture for any decorations:
        const decorRenderer: Phaser.GameObjects.RenderTexture = GFF.AdventureContent.add.renderTexture(GFF.ROOM_X, GFF.ROOM_Y, GFF.ROOM_W, GFF.ROOM_H);
        decorRenderer.setOrigin(0, 0).setDepth(DEPTH.BG_DECOR);

        // Create partial wall guards: (blocks movement in case player slips past wall scenery)
        this.addPartialWallGuards();

        // Create full wall objects:
        this.addFullWallObjects();

        // Create partial wall indicators (TEST):
        // this.addPartialWallIndicators();

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

        // Reset the event triggers:
        this.eventTriggers.forEach(t => {
            t.resetTimes();
        });
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
        const northWall: boolean = this.hasFullWall(Dir9.N);
        const westWall: boolean = this.hasFullWall(Dir9.W);
        const eastWall: boolean = this.hasFullWall(Dir9.E);
        const southWall: boolean = this.hasFullWall(Dir9.S);
        const wallSet: Record<Dir9, GSceneryDef|null> = this.region.getWalls();

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
            if (this.region instanceof GChurchRegion) {
                // For a church interior, southWall is set so it is shown on the map;
                // However, we need to do it in sections: the left and right sections
                // are solid walls, but the center section is the doorway, which will
                // be positioned above the player so he can walk under/through it.
                new GWallSouthWithDoor(
                    SCENERY.CHURCH_WALL_S_LEFT_DEF,
                    SCENERY.CHURCH_WALL_S_RIGHT_DEF,
                    SCENERY.CHURCH_WALL_S_DOORWAY_DEF
                );
            } else {
                new GWallSouth(wallSet[Dir9.S] as GSceneryDef);
            }
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

    public addSceneryPlan(key: string, x: number, y: number) {
        this.plans.push({key, x, y});
    }

    public planPartialWallScenery(sceneryDefs: GSceneryDef[]) {
        this.ROOM_LOG.push(`Planning scenery...`);

        // Omit first/last section of N/S walls IF there is a full wall next to it:
        const omitFirstNorthSouth: boolean = this.hasFullWall(Dir9.W);
        const omitLastNorthSouth: boolean = this.hasFullWall(Dir9.E);
        // Omit first/last section of W/E walls IF there is a full wall next to it:
        const omitFirstWestEast: boolean = this.hasFullWall(Dir9.N);
        const omitLastWestEast: boolean = this.hasFullWall(Dir9.S);

        if (this.hasAnyWall(Dir9.N) && !this.hasFullWall(Dir9.N)) {
            this.planWallSections(Dir9.N, sceneryDefs, omitFirstNorthSouth, omitLastNorthSouth);
        }
        if (this.hasAnyWall(Dir9.W) && !this.hasFullWall(Dir9.W)) {
            this.planWallSections(Dir9.W, sceneryDefs, omitFirstWestEast, omitLastWestEast);
        }
        if (this.hasAnyWall(Dir9.E) && !this.hasFullWall(Dir9.E)) {
            this.planWallSections(Dir9.E, sceneryDefs, omitFirstWestEast, omitLastWestEast);
        }
        if (this.hasAnyWall(Dir9.S) && !this.hasFullWall(Dir9.S)) {
            this.planWallSections(Dir9.S, sceneryDefs, omitFirstNorthSouth, omitLastNorthSouth);
        }
    }

    private planWallSections(dir: CardDir, sceneryPool: GSceneryDef[], omitFirst: boolean, omitLast: boolean) {
        let wallSections: boolean[] = this.getWallSections(dir);
        if (omitLast) {
            wallSections = wallSections.slice(0, -1);
        }
        this.ROOM_LOG.push(`Planning ${DIRECTION.dir9Texts()[dir]} Wall...`);

        let beginWall: number|null = null;
        let endWall: number|null = null;
        let startX: number = 0;
        let startY: number = 0;
        let wallSpace: number;
        for (let w = 0; w < wallSections.length; w++) {
            if (w === 0 && omitFirst) {
                continue;
            }
            this.ROOM_LOG.push(`Checking section ${w}: ${wallSections[w]}`);

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
                this.ROOM_LOG.push(`* Wall from ${beginWall} to ${endWall}:`);
                const tiles: number = (endWall - beginWall) + 1;
                const sceneryCombination: GSceneryDef[] = this.getSceneryCombinationForWall(sceneryPool, tiles, dir);
                RANDOM.shuffle(sceneryCombination);

                sceneryCombination.forEach(c => {
                    this.ROOM_LOG.push(`${c.key}: ${c.body.x},${c.body.y} (${c.body.width}x${c.body.height})`);
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
        this.ROOM_LOG.push(`inc: ${inc}`);

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

    // Explicitly plan an object at a specific position, regardless of any zones or objects
    public planPositionedScenery(sceneryDef: GSceneryDef, x: number, y: number, originX: number = 0, originY: number = 0) {
        const pX: number = x - (sceneryDef.body.width * originX) - sceneryDef.body.x;
        const pY: number = y - (sceneryDef.body.height * originY) - sceneryDef.body.y;
        this.addSceneryPlan(sceneryDef.key, pX, pY);
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

    public planPremiumChestShrine(itemName: string, color: 'blue'|'red' = 'blue') {
        const shrineAreaWidth: number = 275;
        const shrineAreaHeight: number = 122;
        const borderSize: number = 64;

        // Don't need to check for any intersections, because this will be planned before other scenery
        // Can go anywhere within the room area rectangle - anywhere except space reserved for walls
        let x: number = RANDOM.randInt(GFF.ROOM_AREA_LEFT + borderSize, GFF.ROOM_AREA_RIGHT - shrineAreaWidth - borderSize);
        let y: number = RANDOM.randInt(GFF.ROOM_AREA_TOP + borderSize, GFF.ROOM_AREA_BOTTOM - shrineAreaHeight - borderSize);

        // Create a no-scenery zone:
        this.noSceneryZones.push({x, y, width: shrineAreaWidth + (borderSize * 2), height: shrineAreaHeight + (borderSize * 2)});

        // Adjust these to the physical bounds of the enclosed objects:
        x += borderSize;
        y += borderSize;

        // Add pillars:
        this.addSceneryPlan('shrine_pillar', x + 55, y - 109); // Upper-left
        this.addSceneryPlan('shrine_pillar', x + 211, y - 83); // Upper-right
        this.addSceneryPlan('shrine_pillar', x, y - 43);       // Lower-left
        this.addSceneryPlan('shrine_pillar', x + 156, y - 16); // Lower-right

        // Add pedestal:
        this.addSceneryPlan('shrine_pedestal', x + 104, y + 42);

        // Add premium chest:
        if (color === 'red') {
            this.addSceneryPlan('red_chest', x + 111, y + 16);
        } else {
            this.addSceneryPlan('blue_chest', x + 111, y + 16);
        }

        // Set item to be obtained when the chest is opened:
        this.chestItem = itemName;
    }

    public planTownStreets(roadNorth: boolean, roadEast: boolean, roadSouth: boolean, roadWest: boolean): GCityBlock[] {

        const horzNorthBaseline: number = 256;
        const horzSouthBaseline: number = 640;
        const vertWestBaseline: number = 416;
        const vertEastBaseline: number = 608;
        const horzWestEnd: number = 384;
        const vertSouthStart: number = 512;

        const fullNorthHorzBlock: GCityBlock = {
            name: 'full-north horz',
            base: horzNorthBaseline,
            start: GFF.ROOM_X,
            end: GFF.ROOM_W,
            orientation: 'bottom'
        };
        const fullSouthHorzBlock: GCityBlock = {
            name: 'full-south horz',
            base: horzSouthBaseline,
            start: GFF.ROOM_X,
            end: GFF.ROOM_W,
            orientation: 'bottom'
        };
        const fullWestVertBlock: GCityBlock = {
            name: 'full-west vert',
            base: vertWestBaseline,
            start: GFF.ROOM_Y,
            end: GFF.ROOM_H,
            orientation: 'right'
        };
        const fullEastVertBlock: GCityBlock = {
            name: 'full-east vert',
            base: vertEastBaseline,
            start: GFF.ROOM_Y,
            end: GFF.ROOM_H,
            orientation: 'left'
        };
        const nwHorz: GCityBlock = {
            name: 'NW horz',
            base: horzNorthBaseline,
            start: GFF.ROOM_X,
            end: horzWestEnd,
            orientation: 'bottom'
        };
        const neHorz: GCityBlock = {
            name: 'NE horz',
            base: horzNorthBaseline,
            start: vertEastBaseline,
            end: GFF.ROOM_W,
            orientation: 'bottom'
        };
        const swHorz: GCityBlock = {
            name: 'SW horz',
            base: horzSouthBaseline,
            start: GFF.ROOM_X,
            end: horzWestEnd,
            orientation: 'bottom'
        };
        const seHorz: GCityBlock = {
            name: 'SE horz',
            base: horzSouthBaseline,
            start: vertEastBaseline,
            end: GFF.ROOM_W,
            orientation: 'bottom'
        };
        const nwVert: GCityBlock = {
            name: 'NW vert',
            base: vertWestBaseline,
            start: GFF.ROOM_Y,
            end: horzNorthBaseline,
            orientation: 'right'
        };
        const neVert: GCityBlock = {
            name: 'NE vert',
            base: vertEastBaseline,
            start: GFF.ROOM_Y,
            end: horzNorthBaseline,
            orientation: 'left'
        };
        const swVert: GCityBlock = {
            name: 'SW vert',
            base: vertWestBaseline,
            start: vertSouthStart,
            end: GFF.ROOM_H,
            orientation: 'right'
        };
        const seVert: GCityBlock = {
            name: 'SE vert',
            base: vertEastBaseline,
            start: vertSouthStart,
            end: GFF.ROOM_H,
            orientation: 'left'
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
            ARRAY.removeIfExistsIn(nwHorz, cityBlocks);
            ARRAY.removeIfExistsIn(neHorz, cityBlocks);
            ARRAY.removeIfExistsIn(nwVert, cityBlocks);
            ARRAY.removeIfExistsIn(neVert, cityBlocks);
        }
        if (cityBlocks.includes(fullSouthHorzBlock)) {
            ARRAY.removeIfExistsIn(swHorz, cityBlocks);
            ARRAY.removeIfExistsIn(seHorz, cityBlocks);
            ARRAY.removeIfExistsIn(swVert, cityBlocks);
            ARRAY.removeIfExistsIn(seVert, cityBlocks);
        }
        if (cityBlocks.includes(fullWestVertBlock)) {
            ARRAY.removeIfExistsIn(nwHorz, cityBlocks);
            ARRAY.removeIfExistsIn(swHorz, cityBlocks);
            ARRAY.removeIfExistsIn(nwVert, cityBlocks);
            ARRAY.removeIfExistsIn(swVert, cityBlocks);
        }
        if (cityBlocks.includes(fullEastVertBlock)) {
            ARRAY.removeIfExistsIn(neHorz, cityBlocks);
            ARRAY.removeIfExistsIn(seHorz, cityBlocks);
            ARRAY.removeIfExistsIn(neVert, cityBlocks);
            ARRAY.removeIfExistsIn(seVert, cityBlocks);
        }

        // Check partial (corner) blocks; if the same block exists for both
        // directions, prefer horz and remove vert
        if (cityBlocks.includes(nwHorz) && cityBlocks.includes(nwVert)) {
            ARRAY.removeIfExistsIn(nwVert, cityBlocks);
        }
        if (cityBlocks.includes(neHorz) && cityBlocks.includes(neVert)) {
            ARRAY.removeIfExistsIn(neVert, cityBlocks);
        }
        if (cityBlocks.includes(swHorz) && cityBlocks.includes(swVert)) {
            ARRAY.removeIfExistsIn(swVert, cityBlocks);
        }
        if (cityBlocks.includes(seHorz) && cityBlocks.includes(seVert)) {
            ARRAY.removeIfExistsIn(seVert, cityBlocks);
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

        return cityBlocks;
    }

    public planCityBlock(block: GCityBlock, buildingPool: GSceneryDef[]) {
        this.ROOM_LOG.push(`Block: name:${block.name} ${block.orientation} base:${block.base} start:${block.start} end:${block.end}`)

        const totalSpace: number = block.end - block.start;
        const buildings: GSceneryDef[] = [];
        let usedSpace: number = 0;

        // Add some buildings to the block:
        while (buildingPool.length > 0 && usedSpace < totalSpace) {
            const nextBuilding: GSceneryDef = buildingPool[buildingPool.length-1];
            const size: number = this.getBuildingSize(nextBuilding, block);

            if (size < totalSpace - usedSpace) {
                buildingPool.pop();
                buildings.push(nextBuilding);
                usedSpace += size;
            } else {
                // There wasn't room for the next building;
                // leave it in the pool and break out of the loop.
                break;
            }
        }

        const spaces: number[] = RANDOM.toSlices(totalSpace - usedSpace, buildings.length + 1);

        let p: number = block.start;
        for (let building of buildings) {
            p += (spaces.pop() as number);
            p += (this.positionBuilding(building, block, p));
        }
    }

    private positionBuilding(building: GSceneryDef, block: GCityBlock, p: number): number {
        let x: number, y: number, size: number;

        switch(block.orientation) {
            case 'top':
                x = p - building.body.x;
                y = block.base - building.body.y;
                size = building.body.width;
                break;
            case 'bottom':
                x = p - building.body.x;
                y = block.base - building.body.height - building.body.y;
                size = building.body.width;
                break;
            case 'left':
                x = block.base - building.body.x;
                y = p - building.body.y;
                size = building.body.height;
                break;
            case 'right':
                x = block.base - building.body.width - building.body.x;
                y = p - building.body.y;
                size = building.body.height;
                break;
        }
        this.addSceneryPlan(building.key, x, y);
        this.ROOM_LOG.push(`Building:${building.key} x:${x} y:${y}`);
        return size;
    }

    private getBuildingSize(building: GSceneryDef, block: GCityBlock): number {
        switch(block.orientation) {
            case 'top':
            case 'bottom':
                return building.body.width;
            case 'left':
            case 'right':
                return building.body.height;
        }
    }

    public planChurch() {
        const churchX: number = 362;
        const churchY: number = 64;
        const bodyX: number = 25;
        const bodyY: number = 260;
        const churchWidth: number = 300;
        const churchHeight: number = 363;
        this.planPositionedScenery(SCENERY.def('church_house'), churchX + bodyX, churchY + bodyY);

        // As we plan the church, we can also add a trigger for the door:
        const radius: number = 100;
        const doorX: number = churchX + (churchWidth / 2);
        const doorY: number = churchY + churchHeight;
        const triggerArea: GRect = {x: doorX-radius, y: doorY-radius, width: radius*2, height: radius*2};
        const doorOpenLocation: GPoint2D = {x: churchX + 94, y: churchY + 244};
        const doorSpriteDepth: number = churchY + churchHeight + 1;
        this.addEventTrigger(new GChurchDoorTrigger(triggerArea, doorOpenLocation, doorSpriteDepth));

        // A church is an important feature that shouldn't be covered up by random scenery
        this.noSceneryZones.push({x: 362, y: 128, width: 300, height: 576});
    }

    public planChurchInterior() {
        // Pulpit:
        this.planPositionedScenery(SCENERY.def('church_pulpit'), 512, 210, .5, .5);

        // Piano:
        this.planPositionedScenery(SCENERY.def('church_piano'), 832, 160, .5, .5);

        // Left-side pews:
        let h: number = 310;
        this.planPositionedScenery(SCENERY.def('church_pew'), 287, h, .5, .5);
        this.planPositionedScenery(SCENERY.def('church_pew'), 287, h += 128, .5, .5);
        this.planPositionedScenery(SCENERY.def('church_pew'), 287, h += 128, .5, .5);

        // Right-side pews:
        h = 310;
        this.planPositionedScenery(SCENERY.def('church_pew'), 735, h, .5, .5);
        this.planPositionedScenery(SCENERY.def('church_pew'), 735, h += 128, .5, .5);
        this.planPositionedScenery(SCENERY.def('church_pew'), 735, h += 128, .5, .5);
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
        this.addSceneryPlan(key, GFF.ROOM_X + (x * GFF.TILE_W), GFF.ROOM_Y + (y * GFF.TILE_H));
    }

    public getTileArea(x: number, y: number, w: number, h: number): GRect {
        return {
            x: GFF.ROOM_X + (x * GFF.TILE_W),
            y: GFF.ROOM_Y + (y * GFF.TILE_H),
            width: (w * GFF.TILE_W),
            height: (h * GFF.TILE_H)
        };
    }

    public logRoomInfo() {
        // Print out room log (for testing room generation):
        this.ROOM_LOG.forEach(s => {
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
