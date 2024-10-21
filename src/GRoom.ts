import { GameObjects } from "phaser";
import { GRegion } from "./GRegion";
import { CardDir, GPoint, GSceneryPlan } from "./types";
import { GObstacleStatic } from "./objects/obstacles/GObstacleStatic";
import { GScenery } from "./objects/GScenery";
import { GAdventureContent } from "./scenes/GAdventureContent";
import { GFF } from "./main";
import { GTreasureChest } from "./objects/GTreasureChest";
import { GRandom } from "./GRandom";
import { GArea } from "./GArea";
import { GDirection } from "./GDirection";

type RoomWalls = {
    [key in CardDir]: boolean[];
};

/**
 * GRoom represents a single screen/room within a GArea.
 * Each GRoom has a collection of objects that should be loaded
 * to the AdventureScene when the room is entered, and unloaded
 * when the room is exited.
 */
export class GRoom {
    private area: GArea;
    private x: number;
    private y: number;
    private plans: GSceneryPlan[] = [];
    private region: GRegion;
    private walls: RoomWalls;
    private discovered: boolean = false;

    constructor(x: number, y: number, area: GArea) {
        this.area = area;
        this.x = x;
        this.y = y;

        this.walls = {
            [GDirection.Dir9.N]: new Array(16).fill(false),
            [GDirection.Dir9.E]: new Array(11).fill(false),
            [GDirection.Dir9.S]: new Array(16).fill(false),
            [GDirection.Dir9.W]: new Array(11).fill(false)
        };
    }

    public getX() {
        return this.x;
    }

    public getY() {
        return this.y;
    }

    public setRegion(region: GRegion) {
        this.region = region;
    }

    public getRegion() {
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

    public setFullWall(dir: CardDir) {
        const sections = new Array(this.walls[dir].length).fill(true);
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
        return this.area.containsRoom(this.x + velocity.x, this.y + velocity.y);
    }

    public getNeighbor(direction: GDirection.Dir9): GRoom|null {
        const velocity: GPoint = GDirection.getVelocity(direction);
        return this.area.getRoomAt(this.x + velocity.x, this.y + velocity.y);
    }

    public connectToRandomUndiscoveredNeighbor(): GRoom|null {
        let d: number = GRandom.randInt(1, 4);
        const start: number = d;
        do {
            let neighbor: GRoom|null = this.getNeighbor(GDirection.Dir9.N);
            if (d === 1 && (neighbor != null) && !neighbor.isDiscovered()) {
                this.area.setWallAt(this, GDirection.Dir9.N, false);
                return neighbor;
            }
            neighbor = this.getNeighbor(GDirection.Dir9.E);
            if (d === 2 && (neighbor != null) && !neighbor.isDiscovered()) {
                this.area.setWallAt(this, GDirection.Dir9.E, false);
                return neighbor;
            }
            neighbor = this.getNeighbor(GDirection.Dir9.S);
            if (d === 3 && (neighbor != null) && !neighbor.isDiscovered()) {
                this.area.setWallAt(this, GDirection.Dir9.S, false);
                return neighbor;
            }
            neighbor = this.getNeighbor(GDirection.Dir9.W);
            if (d === 4 && (neighbor != null) && !neighbor.isDiscovered()) {
                this.area.setWallAt(this, GDirection.Dir9.W, false);
                return neighbor;
            }
            d++;
            if (d > 4) d = 1;
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
        if (this.region !== undefined) {
            scene.add.image(0, 0, this.region.getBgImageName()).setOrigin(0, 0);
        }
        this.plans.forEach((plan) => {
            GScenery.create(scene, plan.key, plan.x, plan.y);
        });

        // Treasure chest test:
        new GTreasureChest(scene, 512, 384, GRandom.flipCoin());

        // Help text on first room:
        if (this.x === 0 && this.y === 0) {
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
}
