import { GRegion } from "./regions/GRegion";
import { CardDir, GPoint, GRoomWalls, GSceneryPlan } from "./types";
import { GScenery } from "./objects/GScenery";
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

    public addScenery(key: string, x: number, y: number) {
        this.plans.push({key, x, y});
    }

    public isSafe(): boolean {
        if (this.x === 0 && this.y === 0) {
            return true;
        } else {
            return false;
        }
    }

    public load(scene: GAdventureContent) {
        // Set background image from region:
        if (this.region !== undefined) {
            scene.add.image(0, 0, this.region.getBgImageName()).setOrigin(0, 0);
        }

        // Create terrain fade images, if applicable, based on neighbors:
        this.addFadeImageForNeighbor(scene, GDirection.Dir9.N, 'n');
        this.addFadeImageForNeighbor(scene, GDirection.Dir9.E, 'e');
        this.addFadeImageForNeighbor(scene, GDirection.Dir9.W, 'w');
        this.addFadeImageForNeighbor(scene, GDirection.Dir9.S, 's');

        // Create scenery objects from plan:
        this.plans.forEach((plan) => {
            GScenery.create(scene, plan.key, plan.x, plan.y);
        });

        // Treasure chest test:
        new GTreasureChest(scene, 512, 384, GRandom.flipCoin());

        // Help text on first room:
        if (this.isStart()) {
            scene.add.text(30, 30, GFF.TEST_INFO, {
                color: '#000000',
                fontSize: '16px',
                fontFamily: 'time',
                fontStyle: 'bold',
                lineSpacing: -6
            });
        }
    }

    public unload(scene: GAdventureContent) {
        let objs: Phaser.GameObjects.GameObject[] = scene.children.getChildren();

        // Destroy everything in the scene not marked as 'permanent':
        for (let n = objs.length - 1; n >= 0; n--) {
            if (objs[n].data !== undefined) {
                if (!objs[n].data?.get('permanent')) {
                    objs[n].destroy();
                }
            }
        }
    }

    private addFadeImageForNeighbor(scene: GAdventureContent, dir: CardDir, dirStr: string) {
        const neighbor: GRoom|null = this.getNeighbor(dir);
        if (neighbor && neighbor.getRegion() !== this.getRegion()) {
            const fadeImageName: string = neighbor.getRegion().getBgImageName() + `_fade_` + dirStr;
            switch (dir) {
                case GDirection.Dir9.N:
                case GDirection.Dir9.W:
                    scene.add.image(0, 0, fadeImageName).setOrigin(0, 0).setAlpha(TERRAIN_FADE_ALPHA);
                    break;
                case GDirection.Dir9.E:
                    scene.add.image(GFF.ROOM_W, 0, fadeImageName).setOrigin(1, 0).setAlpha(TERRAIN_FADE_ALPHA);
                    break;
                case GDirection.Dir9.S:
                    scene.add.image(0, GFF.ROOM_H, fadeImageName).setOrigin(0, 1).setAlpha(TERRAIN_FADE_ALPHA);
                    break;
            }
        }
    }
}
