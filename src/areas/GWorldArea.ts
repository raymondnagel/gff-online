import { GArea } from "./GArea";
import { GRegion } from "../regions/GRegion";
import { GRoom } from "../GRoom";
import { CardDir, Dir9, GCityBlock, GPerson, GSceneryDef } from "../types";
import { GPlainRegion } from "../regions/GPlainRegion";
import { GForestRegion } from "../regions/GForestRegion";
import { GDesertRegion } from "../regions/GDesertRegion";
import { GSwampRegion } from "../regions/GSwampRegion";
import { GTundraRegion } from "../regions/GTundraRegion";
import { GMountRegion } from "../regions/GMountRegion";
import { RANDOM } from "../random";
import { GFF } from "../main";
import { DIRECTION } from "../direction";
import { TOWN } from "../town";
import { GTown } from "../GTown";
import { GChurch } from "../GChurch";
import { CHURCH } from "../church";
import { GStronghold } from "../strongholds/GStronghold";
import { PEOPLE } from "../people";
import { BOOKS } from "../books";
import { COMMANDMENTS } from "../commandments";
import { SCENERY } from "../scenery";
import { AREA } from "../area";
import { GChurchArea } from "./GChurchArea";
import { REGISTRY } from "../registry";
import { GTownDistrict } from "../districts/GTownDistrict";
import { GCityResMonoDistrict } from "../districts/GCityResMonoDistrict";
import { GCityResDiverseDistrict } from "../districts/GCityResDiverseDistrict";
import { GSuburbResMonoDistrict } from "../districts/GSuburbResMonoDistrict";
import { GSuburbResDiverseDistrict } from "../districts/GSuburbResDiverseDistrict";
import { GBusinessDistrict } from "../districts/GBusinessDistrict";
import { GMixedDistrict } from "../districts/GMixedDistrict";
import { ARRAY } from "../array";
import { GStrongholdCastle } from "../strongholds/GStrongholdCastle";
import { GStrongholdDungeon } from "../strongholds/GStrongholdDungeon";
import { GStrongholdFortress } from "../strongholds/GStrongholdFortress";
import { GStrongholdKeep } from "../strongholds/GStrongholdKeep";
import { GStrongholdTower } from "../strongholds/GStrongholdTower";

type BorderWall = {
    room: GRoom,
    dir: CardDir,
};

const WORLD_WIDTH: number = 16;
const WORLD_HEIGHT: number = 16;
const REGION_MIN: number = 25;
const REGION_MAX: number = 35;
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

const DISTRICT_CITY_RES_MONO: GTownDistrict = new GCityResMonoDistrict();
const DISTRICT_CITY_RES_DIVERSE: GTownDistrict = new GCityResDiverseDistrict();
const DISTRICT_SUBURB_RES_MONO: GTownDistrict = new GSuburbResMonoDistrict();
const DISTRICT_SUBURB_RES_DIVERSE: GTownDistrict = new GSuburbResDiverseDistrict();
const DISTRICT_BUSINESS: GTownDistrict = new GBusinessDistrict();
const DISTRICT_MIXED: GTownDistrict = new GMixedDistrict();

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
            const dir: CardDir = DIRECTION.cardDirFrom4(d as 0|1|2|3);
            const neighbor: GRoom|null = startRoom.getNeighbor(dir);
            if (neighbor && !neighbor.getRegion() && !startRoom.hasFullWall(dir)) {
                this.expandContiguous(neighbor, region);
            }
        }
    }

    private createInitialRegionGateways(region: GRegion, borderWall: BorderWall[]) {
        const otherRegions: GRegion[] = [];
        RANDOM.shuffle(borderWall);
        for (let b of borderWall) {
            const outerNeighbor: GRoom|null = b.room.getNeighbor(b.dir);
            if (outerNeighbor) {
                if (!otherRegions.includes(outerNeighbor.getRegion())) {
                    otherRegions.push(outerNeighbor.getRegion());
                    this.setWallByRoom(b.room, b.dir, false);
                    GFF.log(`Initial Gateway: ${b.room.getX()}, ${b.room.getY()} : ${DIRECTION.dir9Texts()[b.dir]}`);
                }
            }
        }
    }

    private createExtraRegionGateways(region: GRegion, borderWall: BorderWall[]) {
        for (let b of borderWall) {
            const outerNeighbor: GRoom|null = b.room.getNeighbor(b.dir);
            if (outerNeighbor && !outerNeighbor.isDiscovered()) {
                this.setWallByRoom(b.room, b.dir, false);
                GFF.log(`Extra Gateway: ${b.room.getX()}, ${b.room.getY()} : ${DIRECTION.dir9Texts()[b.dir]}`);
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

        const targetSize: number = RANDOM.randInt(REGION_MIN, REGION_MAX);
        const candidates: GRoom[] = [centerRoom];
        const neighborCondition = (n: GRoom): boolean => {
            return n.getRegion() === undefined;
        };

        while (region.getRooms().length < targetSize && candidates.length > 0) {
            let current: GRoom = RANDOM.randElement(candidates);
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
        RANDOM.shuffle(eligibleRooms);

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
        for (let t: number = 0; t < TOWN.TOWN_COUNT; t++) {
            const town: GTown = new GTown();
            TOWN.addTown(town);
            const fruitNum: number|null = t === 0 ? null : t;
            const church: GChurch = new GChurch(town);
            const interior: GChurchArea = AREA.CHURCH_AREAS[t];
            church.setInteriorArea(interior);
            CHURCH.addChurch(church);
        }

        while (!this.createTowns(TOWN.TOWN_COUNT)) {
            this.clearTowns();
        }

        this.finalizeTowns();

        this.addPopulation();

        // Now that towns are finalized, add fruit to the churches:
        RANDOM.shuffle(CHURCH.getChurches());
        CHURCH.getChurches().forEach((c, i) => {
            const fruitNum: number|null = i === 0 ? null : i;
            c.setFruitNum(fruitNum);
        });

        // Create start location the first church's world room (the one with no fruit)
        this.startRoom = CHURCH.getChurches()[0].getWorldRoom();
        this.startRoom.setStart();

        // Test population by town:
        // const towns: GTown[] = TOWN.getTowns();
        // for (let t: number = 0; t < TOWN.TOWN_COUNT; t++) {
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
        RANDOM.shuffle(people);
        RANDOM.shuffle(towns);

        // Reserve some people who will be "captured":
        const capturedPeople: number = RANDOM.randInt(3, 7);
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
        for (let t: number = 0; t < TOWN.TOWN_COUNT; t++) {
            const converts: number = RANDOM.randInt(4, 6);
            for (let c: number = 0; c < converts; c++) {
                towns[t].transferAnyoneToChurch();
            }
        }
    }

    private finalizeTowns() {
        // Add rooms to all towns;
        // also create road passage sections for town rooms
        const rooms: GRoom[] = this.getRoomsByFloor(0);
        for (let room of rooms) {
            room.getTown()?.addRoom(room);
            if (room.getTown()) {
                // This is done here to ensure that all rooms have their towns assigned
                room.setRoadPassageSections();
            }
        }

        // (Travel agencies were already placed during town creation, since they have the
        // possibility of failure. Churches can be placed anywhere.)


        const towns: GTown[] = TOWN.getTowns();
        for (let t: number = 0; t < towns.length; t++) {
            // Create the town's travel agency in its chosen room:
            const travelAgencyRoom: GRoom = towns[t].getTravelAgencyLocation();
            travelAgencyRoom.setTravelLocation();
            GFF.genLog(`Created travel agency in: ${towns[t].getName()}`);

            // Create the town's church in a random room that isn't the travel agency location:
            const otherRooms: GRoom[] = towns[t].getRooms().filter(room => room !== travelAgencyRoom);
            const churchRoom: GRoom = RANDOM.randElement(otherRooms);
            const church: GChurch = CHURCH.getChurches()[t];
            towns[t].setChurch(church);
            churchRoom.setChurch(church);
            GFF.genLog(`Created church: ${church.getName()}`);
        }

        // Schedule flights between towns:
        TOWN.scheduleFlights(TOWN.getTowns());

        // Plan streets for each town room:
        this.createTownDistricts();
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
        for (let t: number = 0; t < TOWN.TOWN_COUNT; t++) {
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
        RANDOM.shuffle(rooms);

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
        // Expand the town from the center to a random target size:
        const targetSize: number = RANDOM.randInt(TOWN_MIN, TOWN_MAX);
        GFF.genLog(`Creating town: ${town.getName()}, targetSize: ${targetSize}`);
        if (this.expandTown(townCenter, town, targetSize) > 0) {
            return false;
        }

        // Choose a travel agency location. It can be any room that has a town neighbor to the
        // east or west, allowing a horizontal road on which a south-facing travel_agency_front can be placed.
        // If no such room exists, we must return false and retry the entire town creation process.
        const townRooms: GRoom[] = this.getRoomsByFloor(0).filter(r => r.getTown() === town);
        const travelRooms: GRoom[] = townRooms.filter(r => {
            const eastNeighbor: GRoom|null = r.getNeighbor(Dir9.E);
            const westNeighbor: GRoom|null = r.getNeighbor(Dir9.W);
            return (
                (eastNeighbor?.getTown() === town)
                || (westNeighbor?.getTown() === town)
            );
        });
        if (travelRooms.length === 0) {
            GFF.genLog(`Couldn't find suitable travel agency location!`);
            return false;
        } else {
            const travelRoom: GRoom = RANDOM.randElement(travelRooms);
            town.setTravelAgencyLocation(travelRoom);
            GFF.genLog(`Travel agency location: ${travelRoom.getX()}, ${travelRoom.getY()}`);
            return true;
        }
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
        RANDOM.shuffle(dirs);

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
                    if (RANDOM.flipCoin()) {
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

    // Used when town creation fails and we need to retry
    private clearTowns() {
        const rooms: GRoom[] = this.getRoomsByFloor(0);
        for (let room of rooms) {
            room.setTown(null);
        }
    }

    private createStrongholds() {
        const strongholds: GStronghold[] = [
            new GStrongholdTower(),    // Boss: Mammon     // Treasure: Girdle of Truth
            new GStrongholdDungeon(),  // Boss: Apollyon   // Treasure: Shield of Faith
            new GStrongholdFortress(), // Boss: Legion     // Treasure: Preparation of Peace
            new GStrongholdKeep(),     // Boss: Belial     // Treasure: Breastplate of Righteousness
            new GStrongholdCastle(),   // Boss: Beelzebub  // Treasure: Helmet of Salvation
        ];
        RANDOM.shuffle(strongholds);

        this.createStronghold(REGION_FOREST, strongholds[0]);
        this.createStronghold(REGION_DESERT, strongholds[1]);
        this.createStronghold(REGION_SWAMP, strongholds[2]);
        this.createStronghold(REGION_TUNDRA, strongholds[3]);
        this.createStronghold(REGION_MOUNT, strongholds[4]);
    }

    private createStronghold(region: GRegion, stronghold: GStronghold) {
        const rooms: GRoom[] = region.getRooms();
        RANDOM.shuffle(rooms);

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
                room = RANDOM.randElement(allRooms);
            }
            const book: string|undefined = REGISTRY.get('booksOrder') === 'canonical' ?
                'NEXT_BOOK' :
                BOOKS.getNextBookToFind();

            if (book !== undefined) {
                room.planRandomPremiumChestShrine(book, 'red');
            }
        }

        // For 5 commandments:
        for (let c: number = 0; c < 5; c++) {
            // Try to find a place to put the chest:
            while (!room || !room.canHavePremiumChest()) {
                room = RANDOM.randElement(allRooms);
            }
            const commandment: string|undefined = COMMANDMENTS.getNextCommandmentToFind();
            if (commandment !== undefined) {
                room.planRandomPremiumChestShrine(commandment, 'purple');
            }
        }
    }

    private createTownDistricts(): void {
        // Get list of pre-created towns:
        const towns: GTown[] = TOWN.getTowns();
        for (let town of towns) {

            // For each town, reset districts:
            const availableDistricts: GTownDistrict[] = [
                DISTRICT_CITY_RES_MONO,
                DISTRICT_CITY_RES_DIVERSE,
                DISTRICT_SUBURB_RES_MONO,
                DISTRICT_SUBURB_RES_DIVERSE,
                DISTRICT_BUSINESS,
                DISTRICT_MIXED
            ];

            // Choose now whether to use the business or mixed district for the town's travel location:
            const travelDistrict: GTownDistrict = RANDOM.randElement([DISTRICT_BUSINESS, DISTRICT_MIXED]);
            // Remove the chosen district from the available districts:
            ARRAY.removeIfExistsIn(travelDistrict, availableDistricts);
            // Remaining districts can be used for non-travel locations

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

                const cityBlocks: GCityBlock[] = room.planTownStreets(roadNorth, roadEast, roadSouth, roadWest);

                /**
                 * New town logic:
                 * 1. We have a list of the blocks; this will be used regardless of the district type.
                 * 2. Determine the type of district to use for this room. At this point, at least one of the
                 *    town rooms will have been determined to be eligible for the travel agency; so if
                 *    room.isTravelLocation() is true, we must use either the business district or the mixed
                 *    district.
                 * 3. For each town, we can have a business district and a mixed district, but we don't want
                 *    to allow more than one of each. Remaining rooms can be assigned any residential district.
                 * 4. Once we determine the district type for the room, we can use the district to plan the
                 *    blocks using its unique building lists.
                 */

                // Only use district logic if the room doesn't contain the town's church;
                // churches are independent and not part of a district, so they'll have their own layout logic.
                if (room.getChurch() === null) {

                    // If the room is a travel location, we'll use the travel district chosen earlier
                    if (room.isTravelLocation()) {
                        travelDistrict.initForRoom(room, true);
                        travelDistrict.planCityBlocks(room, cityBlocks);
                    } else {
                        // Otherwise, we'll pick a random available district
                        const district = RANDOM.randElement(availableDistricts);
                        // If the chosen district is business or mixed, we'll remove it from the list so it isn't used again
                        if (district instanceof GBusinessDistrict || district instanceof GMixedDistrict) {
                            ARRAY.removeIfExistsIn(district, availableDistricts);
                        }
                        district.initForRoom(room, false);
                        district.planCityBlocks(room, cityBlocks);
                    }
                }
            }
        }
    }
}