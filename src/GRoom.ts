import { GRegion } from "./regions/GRegion";
import { CardDir, Dir9, GPoint, GRect, GRoomWalls, GSceneryDef, GSceneryPlan } from "./types";
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
import { GWallEast } from "./objects/obstacles/walls/GWallEast";
import { GWallNorth } from "./objects/obstacles/walls/GWallNorth";
import { GWallSouth } from "./objects/obstacles/walls/GWallSouth";
import { GWallWest } from "./objects/obstacles/walls/GWallWest";
import { GWallNE } from "./objects/obstacles/walls/GWallNE";
import { GWallNW } from "./objects/obstacles/walls/GWallNW";
import { GWallSE } from "./objects/obstacles/walls/GWallSE";
import { GWallSW } from "./objects/obstacles/walls/GWallSW";

const WALL_GUARD_THICK: number = 10;
const WALL_CTRS: number[] = [
    32, 96, 160, 224, 288, 352, 416, 480, 544, 608, 672, 736, 800, 864, 928, 992
];
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

    public getNearestWallCenter(wallDir: CardDir, point: GPoint): GPoint {
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
        const velocity: GPoint = GDirection.getVelocity(direction);
        return this.area.containsRoom(this.floor, this.x + velocity.x, this.y + velocity.y);
    }

    public getNeighbor(direction: Dir9): GRoom|null {
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
        if (this.start || this.church) {
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
        this.addFadeImageForNeighbor(Dir9.N, 'n');
        this.addFadeImageForNeighbor(Dir9.E, 'e');
        this.addFadeImageForNeighbor(Dir9.W, 'w');
        this.addFadeImageForNeighbor(Dir9.S, 's');

        // Create a render-texture for any decorations:
        const decorRenderer: Phaser.GameObjects.RenderTexture = GFF.AdventureContent.add.renderTexture(GFF.ROOM_X, GFF.ROOM_Y, GFF.ROOM_W, GFF.ROOM_H);
        decorRenderer.setOrigin(0, 0);

        // Create partial wall guards: (blocks movement in case player slips past wall scenery)
        this.addPartialWallGuards();

        // Create full wall objects:
        this.addFullWallObjects();

        // Create partial wall indicators (TEST):
        // this.addPartialWallIndicators();

        // Create scenery objects from plan:
        this.plans.forEach((plan) => {
            SCENERY.create(plan.key, plan.x, plan.y, decorRenderer);
        });

        // Treasure chest test:
        new GTreasureChest(GFF.AdventureContent, 512, 384, GRandom.flipCoin());

        // Help text on first room:
        if (this.isStart()) {
            GFF.AdventureContent.add.text(64, 64, GFF.TEST_INFO, {
                color: '#000000',
                fontSize: '14px',
                fontFamily: 'oxygen',
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
                case Dir9.N:
                case Dir9.W:
                    GFF.AdventureContent.add.image(0, 0, fadeImageName).setOrigin(0, 0).setAlpha(TERRAIN_FADE_ALPHA);
                    break;
                case Dir9.E:
                    GFF.AdventureContent.add.image(GFF.ROOM_W, 0, fadeImageName).setOrigin(1, 0).setAlpha(TERRAIN_FADE_ALPHA);
                    break;
                case Dir9.S:
                    GFF.AdventureContent.add.image(0, GFF.ROOM_H, fadeImageName).setOrigin(0, 1).setAlpha(TERRAIN_FADE_ALPHA);
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
            if (southWall[w]) {
                this.createPartialWallGuard(x, y, GFF.TILE_W, WALL_GUARD_THICK);
            }
        }
    }

    private createPartialWallGuard(x: number, y: number, width: number, height: number) {
        const guard: Phaser.GameObjects.Rectangle = GFF.AdventureContent.add.rectangle(x, y, width, height).setOrigin(0, 0);
        GFF.AdventureContent.physics.add.existing(guard, false);
        (guard.body as Phaser.Physics.Arcade.Body).setImmovable(true);
        GFF.AdventureContent.addObstacle(guard);
    }

    public addScenery(key: string, x: number, y: number) {
        this.plans.push({key, x, y});
    }

    public planPartialWallScenery(sceneryDefs: GSceneryDef[]) {
        this.ROOM_LOG.push(`Planning scenery...`);

        // Omit first/last section of N/S walls IF there is a full wall next to it:
        const omitFirstNorthSouth: boolean = this.hasFullWall(Dir9.W);
        const omitLastNorthSouth: boolean = this.hasFullWall(Dir9.E);
        // Omit first/last section of W/E walls if they are shared with N/S walls:
        const omitFirstWest: boolean = this.area.isFirstWallSection(this, Dir9.N);
        const omitLastWest: boolean = this.area.isFirstWallSection(this, Dir9.S);
        const omitLastEast: boolean = this.area.isLastWallSection(this, Dir9.S);
        const omitFirstEast: boolean = this.area.isLastWallSection(this, Dir9.N);

        if (this.hasAnyWall(Dir9.N) && !this.hasFullWall(Dir9.N)) {
            this.planWallSections(Dir9.N, sceneryDefs, omitFirstNorthSouth, omitLastNorthSouth);
        }
        if (this.hasAnyWall(Dir9.W) && !this.hasFullWall(Dir9.W)) {
            this.planWallSections(Dir9.W, sceneryDefs, omitFirstWest, omitLastWest);
        }
        if (this.hasAnyWall(Dir9.E) && !this.hasFullWall(Dir9.E)) {
            this.planWallSections(Dir9.E, sceneryDefs, omitFirstEast, omitLastEast);
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
        this.ROOM_LOG.push(`Planning ${GDirection.dir9Texts()[dir]} Wall...`);

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
                GRandom.shuffle(sceneryCombination);

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
        this.ROOM_LOG.push(`Space to distribute: ${space - totalSceneryWidth}`);

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
                    sY = GRandom.randInt(sY, sY + adjustRange);
                    break;
                case Dir9.W:
                    adjustRange = s.body.width >= GFF.TILE_W ? GFF.TILE_W - minEdgeShown : GFF.CHAR_BODY_W;
                    sX = s.body.width >= GFF.TILE_W ? GFF.LEFT_BOUND - (s.body.width - minEdgeShown) : GFF.LEFT_BOUND;
                    sX = GRandom.randInt(sX, sX + adjustRange);
                    break;
                case Dir9.E:
                    adjustRange = s.body.width >= GFF.TILE_W ? GFF.TILE_W - minEdgeShown : GFF.CHAR_BODY_W;
                    sX = s.body.width >= GFF.TILE_W ? GFF.ROOM_AREA_RIGHT : GFF.ROOM_AREA_RIGHT + minEdgeShown;
                    sX = GRandom.randInt(sX, sX + adjustRange);
                    break;
                case Dir9.S:
                    adjustRange = s.body.height >= GFF.TILE_H ? GFF.TILE_H - minEdgeShown : GFF.CHAR_BODY_H;
                    sY = s.body.height >= GFF.TILE_H ? GFF.ROOM_AREA_BOTTOM : GFF.ROOM_AREA_BOTTOM + minEdgeShown;
                    sY = GRandom.randInt(sY, sY + adjustRange);
                    break;
            }
            this.addScenery(s.key, sX - s.body.x, sY - s.body.y);

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
        return GRandom.randElement(results);
    }

    // If chance is met, add min-max of scenery type
    // (adds a flexible group based on 1 chance)
    public planSceneryChanceForBatch(sceneryDef: GSceneryDef, pctChance: number, min: number, max: number, objects: GRect[], zones?: GRect[]) {
        if (GRandom.randPct() < pctChance) {
            this.planZonedScenery(sceneryDef, GRandom.randInt(min, max), objects, zones);
        }
    }

    // Add instance of scenery type, up to max, only if chance is met in succession times
    // (assumes the same rarity for each instance)
    public planSceneryChanceForEach(sceneryDef: GSceneryDef, pctChance: number, max: number, objects: GRect[], zones?: GRect[]) {
        for (let n: number = 0; n < max; n++) {
            if (GRandom.randPct() < pctChance) {
                this.planZonedScenery(sceneryDef, 1, objects, zones);
            }
        }
    }

    public planZonedScenery(sceneryDef: GSceneryDef, targetInstances: number, objects: GRect[], zones?: GRect[]) {
        for (let i: number = 0; i < targetInstances; i++) {
            const placement: GRect|null = this.fitScenery(sceneryDef.body.width, sceneryDef.body.height, objects, zones);
            if (!placement) {
                return;
            }
            objects.push(placement);
            this.addScenery(sceneryDef.key, placement.x - sceneryDef.body.x, placement.y - sceneryDef.body.y);
        }
    }

    public fitScenery(objectWidth: number, objectHeight: number, objects: GRect[], zones?: GRect[]): GRect|null {
        // Create a default zone if zones is undefined;
        // The default zone allows space for walls around the perimeter.
        if (zones === undefined) {
            zones = [ {x: GFF.ROOM_AREA_LEFT, y: GFF.ROOM_AREA_TOP, width: GFF.ROOM_AREA_WIDTH, height: GFF.ROOM_AREA_HEIGHT} ];
        }

        // Simple placement: try random X,Y:
        let placement: GRect|null = this.simpleFit(objectWidth, objectHeight, 10, objects, zones);

        // Sample placement: sample all areas and choose a random acceptable one:
        // if (!placement) {
        //     placement = this.sampleFit(objectWidth, objectHeight, 5, objects, zones);
        // }

        // Will return null if no placement was available
        return placement;
    }

    private sampleFit(objectWidth: number, objectHeight: number, inc: number, objects: GRect[], zones: GRect[]): GRect|null {
        let x: number;
        let y: number;
        let placement: GRect;

        let z: number = GRandom.randInt(0, zones.length - 1);
        const start: number = z;
        do {
            for (y = 0; y < zones[z].height - objectHeight; y += inc) {
                for (x = 0; x < zones[z].width - objectWidth; x += inc) {
                    placement = {x, y, width: objectWidth, height: objectHeight};
                    if (!this.intersectsAny(placement, objects)) {
                        return placement;
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
            zone = GRandom.randElement(zones) as GRect;
            x = GRandom.randInt(zone.x, zone.x + zone.width - objectWidth);
            y = GRandom.randInt(zone.y, zone.y + zone.height - objectHeight);
            placement = {x, y, width: objectWidth, height: objectHeight};
            if (!this.intersectsAny(placement, objects)) {
                return placement;
            }
        }
        return null;
    }

    private intersectsAny(object: GRect, existingObjects: GRect[]): boolean {
        for (let otherObject of existingObjects) {
            if (!(
                    object.x + object.width <= otherObject.x ||
                    object.x >= otherObject.x + otherObject.width ||
                    object.y + object.height <= otherObject.y ||
                    object.y >= otherObject.y + otherObject.height
            )) {
                return true;
            }
        }
        return false;
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
}
