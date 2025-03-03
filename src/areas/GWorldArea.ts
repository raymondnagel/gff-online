import { GArea } from "./GArea";
import { GRegion } from "../regions/GRegion";
import { GRoom } from "../GRoom";
import { CardDir, Dir9, GPerson, GPoint, ProgressCallback } from "../types";
import { GPlainRegion } from "../regions/GPlainRegion";
import { GForestRegion } from "../regions/GForestRegion";
import { GDesertRegion } from "../regions/GDesertRegion";
import { GSwampRegion } from "../regions/GSwampRegion";
import { GTundraRegion } from "../regions/GTundraRegion";
import { GMountRegion } from "../regions/GMountRegion";
import { GRandom } from "../GRandom";
import { GFF } from "../main";
import { GDirection } from "../GDirection";
import { TOWN } from "../town";
import { GTown } from "../GTown";
import { GChurch } from "../GChurch";
import { CHURCH } from "../church";
import { GStronghold } from "../GStronghold";
import { PEOPLE } from "../people";
import { BOOKS } from "../books";
import { COMMANDMENTS } from "../commandments";

type BorderWall = {
    room: GRoom,
    dir: CardDir,
};

const WORLD_WIDTH: number = 16;
const WORLD_HEIGHT: number = 16;
const REGION_MIN: number = 25;
const REGION_MAX: number = 35;
const NUM_TOWNS: number = 10;
const TOWN_MIN: number = 3;
const TOWN_MAX: number = 6;
const MIN_DIST_REGION_CENTERS: number = 5;
const MIN_DIST_TOWN_CENTERS: number = 4;
const START_DIST_HOLDS_TO_TOWNS: number = 5;

const REGION_FOREST: GRegion = new GForestRegion();
const REGION_DESERT: GRegion = new GDesertRegion();
const REGION_SWAMP: GRegion = new GSwampRegion();
const REGION_TUNDRA: GRegion = new GTundraRegion();
const REGION_MOUNT: GRegion = new GMountRegion();
const PlainRegions: GRegion[] = [];

export class GWorldArea extends GArea {

    private regionCenters: GRoom[] = [];
    private townCenters: GRoom[];
    private startRoom: GRoom;

    constructor() {
        super(
            'Land of Allegoria',
            'togodglory',
            1, // floor
            WORLD_WIDTH,
            WORLD_HEIGHT
        );

        this.createRooms();
        this.createRegions();
        this.addRandomWallSections(0, true, false, 200);
        this.createOuterBorder(0);
        this.fixCornerWallSections();
        this.createCivilization();
        this.createStrongholds();
        this.concealAllRooms(0);
        this.createShrines();
    }

    public getStartRoom(): GRoom {
        return this.startRoom;
    }

    protected initRoom(room: GRoom): void {
        super.initRoom(room);
    }

    private createRegions() {
        // Create regions in order of how restrictive their geographical zones are;
        // return lists of their border walls, so we can use them when creating gateways
        const tundraBorders: BorderWall[] = this.createRegion(REGION_TUNDRA, 0, 2);
        const desertBorders: BorderWall[] = this.createRegion(REGION_DESERT, 13, 15);
        const swampBorders: BorderWall[] = this.createRegion(REGION_SWAMP, 9, 13);
        const forestBorders: BorderWall[] = this.createRegion(REGION_FOREST, 3, 10);
        const mountBorders: BorderWall[] = this.createRegion(REGION_MOUNT, 1, 13);

        // Create plains regions in leftover areas
        this.createPlainRegions();

        // Create gateways between regions

        // Initial gateways ensure we have at least one per adjacent region
        this.createInitialRegionGateways(REGION_TUNDRA, tundraBorders);
        this.createInitialRegionGateways(REGION_DESERT, desertBorders);
        this.createInitialRegionGateways(REGION_SWAMP, swampBorders);
        this.createInitialRegionGateways(REGION_FOREST, forestBorders);
        this.createInitialRegionGateways(REGION_MOUNT, mountBorders);

        // Extra gateways are added to ensure there are no areas of the default region
        // that are completely blocked off by border walls
        this.createExtraRegionGateways(REGION_TUNDRA, tundraBorders);
        this.createExtraRegionGateways(REGION_DESERT, desertBorders);
        this.createExtraRegionGateways(REGION_SWAMP, swampBorders);
        this.createExtraRegionGateways(REGION_FOREST, forestBorders);
        this.createExtraRegionGateways(REGION_MOUNT, mountBorders);
    }

    private createPlainRegions() {
        const allRooms: GRoom[] = this.getRoomsByFloor(0);
        allRooms.forEach(r => {
            if (!r.getRegion()) {
                const newRegion: GRegion = new GPlainRegion();
                PlainRegions.push(newRegion);
                this.expandContiguous(r, newRegion);
            }
        });
    }

    private expandContiguous(startRoom: GRoom, region: GRegion) {
        startRoom.setRegion(region);
        for (let d: number = 0; d < 4; d++) {
            const dir: CardDir = GDirection.cardDirFrom4(d as 0|1|2|3);
            const neighbor: GRoom|null = startRoom.getNeighbor(dir);
            if (neighbor && !neighbor.getRegion() && !startRoom.hasFullWall(dir)) {
                this.expandContiguous(neighbor, region);
            }
        }
    }

    private createInitialRegionGateways(region: GRegion, borderWall: BorderWall[]) {
        const otherRegions: GRegion[] = [];
        GRandom.shuffle(borderWall);
        for (let b of borderWall) {
            const outerNeighbor: GRoom|null = b.room.getNeighbor(b.dir);
            if (outerNeighbor) {
                if (!otherRegions.includes(outerNeighbor.getRegion())) {
                    otherRegions.push(outerNeighbor.getRegion());
                    this.setWallByRoom(b.room, b.dir, false);
                    GFF.log(`Initial Gateway: ${b.room.getX()}, ${b.room.getY()} : ${GDirection.dir9Texts()[b.dir]}`);
                }
            }
        }
    }

    private createExtraRegionGateways(region: GRegion, borderWall: BorderWall[]) {
        for (let b of borderWall) {
            const outerNeighbor: GRoom|null = b.room.getNeighbor(b.dir);
            if (outerNeighbor && !outerNeighbor.isDiscovered()) {
                this.setWallByRoom(b.room, b.dir, false);
                GFF.log(`Extra Gateway: ${b.room.getX()}, ${b.room.getY()} : ${GDirection.dir9Texts()[b.dir]}`);
                this.exploreContiguous(outerNeighbor);
            }
        }
    }

    private createRegion(region: GRegion, minY: number, maxY: number): BorderWall[] {
        GFF.log(`Creating region: ${region.getName()}...`);
        let centerRoom: GRoom|null = this.findValidRegionCenter(minY, maxY);
        if (!centerRoom) {
            GFF.genLog(`Could not find valid center for region: ${region.getName()}`);
            return [];
        }
        region.setCenter(centerRoom);

        const targetSize: number = GRandom.randInt(REGION_MIN, REGION_MAX);
        const candidates: GRoom[] = [centerRoom];
        const neighborCondition = (n: GRoom): boolean => {
            return n.getRegion() === undefined;
        };

        while (region.getRooms().length < targetSize && candidates.length > 0) {
            let current: GRoom = GRandom.randElement(candidates);
            let neighbors: GRoom[] = current.getNeighbors(neighborCondition);

            for (let neighbor of neighbors) {
                if (
                    region.getRooms().length < targetSize
                    && neighbor.getY() >= minY
                    && neighbor.getY() <= maxY
                ) {
                    neighbor.setRegion(region);
                    if (neighbor.getNeighbors(neighborCondition).length > 0)
                    candidates.push(neighbor);
                }
            }
        }

        return this.borderRegion(region);
    }

    private borderRegion(region: GRegion): BorderWall[] {
        const borderWalls: BorderWall[] = [];
        for (let room of region.getRooms()) {
            let neighbor: GRoom|null = room.getNeighbor(Dir9.N);
            if (neighbor && neighbor.getRegion() !== room.getRegion()) {
                this.setWallByRoom(room, Dir9.N, true);
                borderWalls.push({ room, dir: Dir9.N });
            }
            neighbor = room.getNeighbor(Dir9.E);
            if (neighbor && neighbor.getRegion() !== room.getRegion()) {
                this.setWallByRoom(room, Dir9.E, true);
                borderWalls.push({ room, dir: Dir9.E });
            }
            neighbor = room.getNeighbor(Dir9.W);
            if (neighbor && neighbor.getRegion() !== room.getRegion()) {
                this.setWallByRoom(room, Dir9.W, true);
                borderWalls.push({ room, dir: Dir9.W });
            }
            neighbor = room.getNeighbor(Dir9.S);
            if (neighbor && neighbor.getRegion() !== room.getRegion()) {
                this.setWallByRoom(room, Dir9.S, true);
                borderWalls.push({ room, dir: Dir9.S });
            }
        }
        return borderWalls;
    }

    private findValidRegionCenter(minY: number, maxY: number): GRoom|null {
        // Get all un-regioned rooms from the map within the required zone:
        const eligibleRooms: GRoom[] = this.getRoomsWithCondition(r => {
            return r.getY() >= minY && r.getY() <= maxY && r.getRegion() === undefined;
        });

        // Shuffle the list:
        GRandom.shuffle(eligibleRooms);

        // Proceed through the list until we find one far enough away from other centers:
        for (let room of eligibleRooms) {
            if (this.isFarEnoughFromOtherCenters(room, this.regionCenters, MIN_DIST_REGION_CENTERS)) {
                GFF.log(`Created region center @: ${room.getX()}, ${room.getY()}`);
                this.regionCenters.push(room);
                return room;
            }
        }
        return null;
    }

    private isFarEnoughFromOtherCenters(room: GRoom, otherCenters: GRoom[], minDistance: number): boolean {
        for (let center of otherCenters) {
            let distance = Math.sqrt(Math.pow(center.getX() - room.getX(), 2) + Math.pow(center.getY() - room.getY(), 2));
            if (distance < minDistance) {
                return false;
            }
        }
        return true;
    }

    private createCivilization() {
        for (let t: number = 0; t < NUM_TOWNS; t++) {
            const town: GTown = new GTown();
            TOWN.addTown(town);
            CHURCH.addChurch(new GChurch(town));
        }

        while (!this.createTowns(NUM_TOWNS)) {
            this.clearTowns();
        }

        this.finalizeTowns();

        this.addPopulation();

        // Create start location:
        this.startRoom = (GRandom.randElement(CHURCH.getChurches()) as GChurch).getWorldRoom();
        this.startRoom.setStart();

        // Test population by town:
        // const towns: GTown[] = TOWN.getTowns();
        // for (let t: number = 0; t < NUM_TOWNS; t++) {
        //     GFF.genLog(`${towns[t].getName()}, citizens: ${towns[t].getPeople().length}`);
        //     // console.dir(towns[t].getPeople());
        //     GFF.genLog(`${towns[t].getChurch().getName()}, saints: ${towns[t].getChurch().getPeople().length}`);
        //     // console.dir(towns[t].getChurch().getPeople());
        // }
    }

    private addPopulation() {
        const people: GPerson[] = PEOPLE.getPersons();
        const towns: GTown[] = TOWN.getTowns();

        // Shuffle people and towns:
        GRandom.shuffle(people);
        GRandom.shuffle(towns);

        // Reserve some people who will be "captured":
        const capturedPeople: number = GRandom.randInt(3, 7);
        for (let p: number = 0; p < capturedPeople; p++) {
            PEOPLE.addCapturedPerson(people[p]);
        }

        // Distribute the rest of people into the towns:
        let t: number = 0;
        for (let p: number = capturedPeople; p < people.length; p++) {
            towns[t].addPerson(people[p]);
            t++;
            if (t >= towns.length) {
                t = 0;
            }
        }

        // Pre-convert a handful of people in each town:
        for (let t: number = 0; t < NUM_TOWNS; t++) {
            const converts: number = GRandom.randInt(4, 6);
            for (let c: number = 0; c < converts; c++) {
                towns[t].transferAnyoneToChurch();
            }
        }
    }

    private finalizeTowns() {
        // Add rooms to all towns:
        const rooms: GRoom[] = this.getRoomsByFloor(0);
        for (let room of rooms) {
            room.getTown()?.addRoom(room);
        }

        // Create a church in each town:
        const towns: GTown[] = TOWN.getTowns();
        for (let t: number = 0; t < towns.length; t++) {
            const churchRoom: GRoom = GRandom.randElement(towns[t].getRooms());
            const church: GChurch = CHURCH.getChurches()[t];
            towns[t].setChurch(church);
            churchRoom.setChurch(church);
            GFF.genLog(`Created church: ${church.getName()}`);
        }

        // Plan streets for each town room:
        this.createTownStructures();
    }

    private createTowns(numTowns: number): boolean {
        GFF.genLog('Attempting to create towns...');
        // Start with each region center as a town center:
        this.townCenters = [...this.regionCenters];

        // Get list of pre-created towns:
        const towns: GTown[] = TOWN.getTowns();

        // Find centers for other towns:
        let center: GRoom|null;
        for (let t: number = this.regionCenters.length; t < numTowns; t++) {
            center = this.findValidTownCenter();
            if (!center) {
                GFF.genLog(`Couldn't find enough town centers!`);
                return false;
            }
        }

        // Create each town:
        for (let t: number = 0; t < NUM_TOWNS; t++) {
            GFF.genLog(`Creating town #${t}`);
            if (!this.createTown(this.townCenters[t], towns[t])) {
                GFF.genLog(`Couldn't expand town enough!`);
                return false;
            }
        }

        return true;
    }

    private findValidTownCenter(): GRoom|null {
        const rooms: GRoom[] = this.getRoomsByFloor(0);
        GRandom.shuffle(rooms);

        // Proceed through the list until we find one far enough away from other centers:
        for (let room of rooms) {
            if (this.isFarEnoughFromOtherCenters(room, this.townCenters, MIN_DIST_TOWN_CENTERS)) {
                GFF.log(`Created town center @: ${room.getX()}, ${room.getY()}`);
                this.townCenters.push(room);
                return room;
            }
        }
        return null;
    }

    private createTown(townCenter: GRoom, town: GTown): boolean {
        const targetSize: number = GRandom.randInt(TOWN_MIN, TOWN_MAX);

        GFF.genLog(`Creating town: ${town.getName()}, targetSize: ${targetSize}`);
        if (this.expandTown(townCenter, town, targetSize) > 0) {
            return false;
        }
        return true;
    }

    private expandTown(startRoom: GRoom, town: GTown, total: number): number {
        startRoom.setTown(town);
        total--;

        const expansions: GRoom[] = [];

        // Shuffle expansion directions, so towns don't always look the same when they succeed the first time:
        const dirs: CardDir[] = [
            Dir9.N,
            Dir9.E,
            Dir9.W,
            Dir9.S
        ];
        GRandom.shuffle(dirs);

        for (let dir of dirs) {
            if (total > 0) {
                const neighbor: GRoom|null = startRoom.getNeighbor(dir);
                if (
                    neighbor
                    && neighbor.getTown() === null
                    && neighbor.getRegion() === startRoom.getRegion()
                    && !this.hasNeighboringTown(neighbor, town)
                    && !startRoom.hasFullWall(dir)
                ) {
                    this.setWallByRoom(startRoom, dir, false);
                    neighbor.setTown(town);
                    if (GRandom.flipCoin()) {
                        // Expand to neighbor, but don't recurse yet
                        expansions.push(neighbor);
                        total--;
                    } else {
                        // Recurse immediately
                        total = this.expandTown(neighbor, town, total);
                    }
                }
            }
        }

        // Do recursions at the end; this makes sure we don't expand too far from the center
        // before we have actually expanded around the center
        while (total > 0 && expansions.length > 0) {
            total = this.expandTown(expansions.pop() as GRoom, town, total);
        }

        return total;
    }

    private hasNeighboringTown(room: GRoom, otherThan?: GTown) {
        const neighborCondition = (n: GRoom): boolean => {
            return n.getTown() !== null && (otherThan === undefined || n.getTown() !== otherThan);
        };
        return room.getNeighbors(neighborCondition).length > 0;
    }

    private clearTowns() {
        const rooms: GRoom[] = this.getRoomsByFloor(0);
        for (let room of rooms) {
            room.setTown(null);
        }
    }

    private createStrongholds() {
        const strongholds: GStronghold[] = [
            new GStronghold('Tower of Deception'),
            new GStronghold('Dungeon of Doubt'),
            new GStronghold('Fortress of Enmity'),
            new GStronghold('Keep of Wickedness'),
            new GStronghold('Castle of Perdition'),
        ];
        GRandom.shuffle(strongholds);

        this.createStronghold(REGION_FOREST, strongholds[0]);
        this.createStronghold(REGION_DESERT, strongholds[1]);
        this.createStronghold(REGION_SWAMP, strongholds[2]);
        this.createStronghold(REGION_TUNDRA, strongholds[3]);
        this.createStronghold(REGION_MOUNT, strongholds[4]);
    }

    private createStronghold(region: GRegion, stronghold: GStronghold) {
        const rooms: GRoom[] = region.getRooms();
        GRandom.shuffle(rooms);

        // We would prefer a stronghold location as far away as possible from town centers;
        // we'll start at the max distance, and repeat the algorithm with a lower distance
        // until a suitable center is found.
        for (let d: number = START_DIST_HOLDS_TO_TOWNS; d >= 0; d--) {
            // Proceed through the list until we find one far enough away from other centers:
            for (let room of rooms) {
                if (
                    this.isFarEnoughFromOtherCenters(room, this.townCenters, d)
                    && !this.hasNeighboringTown(room)
                ) {
                    room.setStronghold(stronghold);
                    GFF.genLog(`Created stronghold: ${stronghold.getName()} @: ${room.getX()}, ${room.getY()}`);
                    return;
                }
            }
        }

        GFF.genLog(`Couldn't find a suitable location for ${stronghold.getName()} in ${region.getName()}!`);
    }

    private createShrines(): void {
        // Decide where premium treasure chests are going:
        // There are 35 in World Area: 30 books and 5 commandments
        const allRooms: GRoom[] = this.getRoomsByFloor(0);
        let room: GRoom|null = null;

        // For 30 books:
        for (let b: number = 0; b < 30; b++) {
            // Try to find a place to put the chest:
            while (!room || !room.canHavePremiumChest()) {
                room = GRandom.randElement(allRooms);
            }
            const book: string|undefined = BOOKS.getNextBookToFind();
            if (book !== undefined) {
                room.planPremiumChestShrine(book, 'blue');
            }
        }

        // For 5 commandments:
        for (let c: number = 0; c < 5; c++) {
            // Try to find a place to put the chest:
            while (!room || !room.canHavePremiumChest()) {
                room = GRandom.randElement(allRooms);
            }
            const commandment: string|undefined = COMMANDMENTS.getNextCommandmentToFind();
            if (commandment !== undefined) {
                room.planPremiumChestShrine(commandment, 'red');
            }
        }
    }

    private createTownStructures(): void {
        // Get list of pre-created towns:
        const towns: GTown[] = TOWN.getTowns();
        for (let town of towns) {
            const rooms: GRoom[] = town.getRooms();
            for (let room of rooms) {
                let neighbor: GRoom|null = room.getNeighbor(Dir9.N);
                const roadNorth: boolean = neighbor !== null && neighbor.getTown() !== null;
                neighbor = room.getNeighbor(Dir9.E);
                const roadEast: boolean = neighbor !== null && neighbor.getTown() !== null;
                neighbor = room.getNeighbor(Dir9.S);
                const roadSouth: boolean = neighbor !== null && neighbor.getTown() !== null;
                neighbor = room.getNeighbor(Dir9.W);
                const roadWest: boolean = neighbor !== null && neighbor.getTown() !== null;
                room.planTownStreets(roadNorth, roadEast, roadSouth, roadWest);
            }
        }
    }
}