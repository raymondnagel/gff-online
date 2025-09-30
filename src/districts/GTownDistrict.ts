import { ARRAY } from "../array";
import { COLOR } from "../colors";
import { GLot } from "../GLot";
import { GRoom } from "../GRoom";
import { GFF } from "../main";
import { RANDOM } from "../random";
import { SCENERY } from "../scenery";
import { GAnchorSide, GCityBlock, GSceneryDef } from "../types";

/**
 * Partner buildings pair a front-facing main building with another building that
 * can sometimes appear next to it. This is typically used to have garages match
 * the style of the house next to them, but there could be other use cases as well.
 */
type PartnerBuildings = {
    mainKey: string;
    partnerKey: string;
};

export abstract class GTownDistrict {

    private static partnerBuildings: PartnerBuildings[] = [
        { mainKey: 'house_1_front', partnerKey: 'garage_1_front' },
        { mainKey: 'house_4_front', partnerKey: 'garage_1_front' },
        { mainKey: 'house_5_front', partnerKey: 'garage_1_front' },
        { mainKey: 'house_2_front', partnerKey: 'garage_2_front' },
        { mainKey: 'house_3_front', partnerKey: 'garage_3_front' },
    ];

    private name: string;
    private requiresTravelAgency: boolean = false;
    private frontBuildingKeys: string[] = [];
    private backBuildingKeys: string[] = [];
    private sideBuildingKeys: string[] = [];
    private singleInstanceKeys: string[] = [];

    constructor(name: string) {
        this.name = name;
    }

    // Subclasses can override this for special initialization, but they
    // should still call this to set requiresTravelAgency flag.
    public initForRoom(room: GRoom, requiresTravelAgency: boolean) {
        this.requiresTravelAgency = requiresTravelAgency;
    }

    protected setFrontBuildingKeys(keys: string[]) {
        this.frontBuildingKeys = keys;
    }

    protected setBackBuildingKeys(keys: string[]) {
        this.backBuildingKeys = keys;
    }

    protected setSideBuildingKeys(keys: string[]) {
        this.sideBuildingKeys = keys;
    }

    public addSingleInstanceKeys(keys: string[]) {
        this.singleInstanceKeys.push(...keys);
    }


    public planCityBlocks(room: GRoom, blocks: GCityBlock[]) {
        // Plan the layout of city blocks within the room

        // The old logic calls room.planCityBlock for each one, but it didn't have districts.
        // The new logic will be handled here, taking into account any special district rules.

        // For this room, begin with a copy of each key array;
        // then we can modify the copy without changing the original arrays.
        let frontKeys = ARRAY.copy(this.frontBuildingKeys);
        const backKeys = ARRAY.copy(this.backBuildingKeys);
        const sideKeys = ARRAY.copy(this.sideBuildingKeys);

        // If a travel agency is required in this room, choose a random block that is front-facing,
        // and store the index:
        let travelAgencyBlockIndex: number = -1;
        if (this.requiresTravelAgency) {
            travelAgencyBlockIndex = RANDOM.randElement(
                blocks.map(
                    (block, index) => block.orientation === 'front' ? index : -1
                ).filter(index => index !== -1)
            );
        }

        for (const [index, block] of blocks.entries()) {
            switch (block.orientation) {
                case 'front':
                    this.planHorzBlock(room, block, frontKeys, index === travelAgencyBlockIndex);
                    break;
                case 'back':
                    this.planHorzBlock(room, block, backKeys);
                    break;
                case 'side':
                    this.planVertBlock(room, block, sideKeys);
                    break;
            }
        }
    }

    /**
     * Plan buildings in a horizontal layout along a baseline.
     * Can be used for both front-facing and back-facing buildings by supplying a different keyList.
     */
    public planHorzBlock(room: GRoom, block: GCityBlock, keyList: string[], hasTravelAgency: boolean = false) {
        let x: number = block.start;
        let y: number = block.base;
        const blockWidth: number = block.end - block.start;

        // Create a test zone so we can see exactly where the target area is:
        // const label: string = `${block.name}`;
        // room.createTestZone(x, y, blockWidth, 2, label, COLOR.RED);
        // room.addRoomLogEntry(`Created test zone for ${label}: width: ${blockWidth}`);

        // Create an array of lots to fill the block
        const lots: GLot[] = [];

        // Continue adding lots to the array until we have exceeded the available space
        let totalLotsWidth: number = 0;
        while (totalLotsWidth < blockWidth) {
            // If this block has a travel agency, add it first to make sure it gets included:
            if (hasTravelAgency && totalLotsWidth === 0) {
                const travelAgencyDef = SCENERY.def('travel_agency_front') as GSceneryDef;
                const lot = GLot.createFrontBuildingLot(travelAgencyDef, room, this);
                totalLotsWidth += lot.getPhysicalBounds().width;
                lots.push(lot);
                room.addRoomLogEntry(`Added lot for ${travelAgencyDef.key}, total width = ${totalLotsWidth}`);
            } else {
                // Select a random building from the list
                const buildingDef = SCENERY.def(RANDOM.randElement(keyList));
                // If the selected building is single-instance, remove it from the list
                if (this.singleInstanceKeys.includes(buildingDef.key)) {
                    ARRAY.removeIfExistsIn(buildingDef.key, keyList);
                }
                // Create the lot, either front or back
                const lot = block.orientation === 'front' ? GLot.createFrontBuildingLot(buildingDef, room, this) : GLot.createBackBuildingLot(buildingDef, room, this);

                // Get its width and add it to the running total
                totalLotsWidth += lot.getPhysicalBounds().width;
                lots.push(lot);
                room.addRoomLogEntry(`Added lot for ${buildingDef.key}, total width = ${totalLotsWidth}`);
            }
        }

        // Shuffle the array to add variety, making sure whole lots are not on the edge
        GTownDistrict.shuffleLotsForBlock(lots, block);

        // We'll also have to figure out what to do with partner buildings;
        // probably add the partner building as an optional argument alongside the main building,
        // and have it included in the same lot.

        // We'll place the lots one after another to fill the block

        // totalLotsWidth is now larger than blockWidth; get the difference:
        const spaceDiff = totalLotsWidth - blockWidth;

        // If this is a full block, center the lots in the block
        if (blockWidth === GFF.ROOM_W) {
            room.addRoomLogEntry(`Centering lots in full block: ${block.name}`);
            x -= (spaceDiff / 2);
            room.addRoomLogEntry(`SpaceDiff: ${spaceDiff}, x: ${x}`);
        } // If this is a west block, begin off the screen so it ends before the vertical road
        else if (block.start === GFF.ROOM_X) {
            room.addRoomLogEntry(`West block (begins at 0): ${block.name}`);
            x -= spaceDiff;
            room.addRoomLogEntry(`SpaceDiff: ${spaceDiff}, x: ${x}`);
        } // Otherwise, the block is an east block; it will begin at the vertical road and then go off the screen
        else {
            room.addRoomLogEntry(`Assuming east block: ${block.name}`);
            room.addRoomLogEntry(`SpaceDiff: ${spaceDiff}, x: ${x}`);
        }

        // Finally, add the lots to the room
        lots.forEach(lot => {
            lot.normalizePositions(room);
            const lotPhys = lot.getPhysicalBounds();
            lot.finalizePlansToRoom(room, x, y, block.anchor);
            x += lotPhys.width;
        });
    }

    /**
     * Plan buildings in a vertical layout, anchored to left or right side.
     * Used for side-facing buildings.
     */
    public planVertBlock(room: GRoom, block: GCityBlock, keyList: string[]) {
        let x: number = block.base;
        let y: number = block.start;
        const blockHeight: number = block.end - block.start;

        // Create a test zone so we can see exactly where the target area is:
        // const label: string = `${block.name}`;
        // room.createTestZone(x, y, 2, blockHeight, label, COLOR.RED);
        // room.addRoomLogEntry(`Created test zone for ${label}: height: ${blockHeight}`);

        // Create an array of lots to fill the block
        const lots: GLot[] = [];

        // Continue adding lots to the array until we have exceeded the available space
        let totalLotsHeight: number = 0;
        while (totalLotsHeight < blockHeight) {
            // Select a random building from the list
            const buildingDef = SCENERY.def(RANDOM.randElement(keyList));
            // If the selected building is single-instance, remove it from the list
            if (this.singleInstanceKeys.includes(buildingDef.key)) {
                ARRAY.removeIfExistsIn(buildingDef.key, keyList);
            }
            // Create the lot (since this is vertical, we can assume either left or right)
            const lot = block.anchor === 'left' ? GLot.createLeftBuildingLot(buildingDef, room, this) : GLot.createRightBuildingLot(buildingDef, room, this);

            // Get its height and add it to the running total
            totalLotsHeight += lot.getPhysicalBounds().height;
            lots.push(lot);
            room.addRoomLogEntry(`Added lot for ${buildingDef.key}, total height = ${totalLotsHeight}`);
        }

        // Shuffle the array to add variety, making sure whole lots are not on the edge
        GTownDistrict.shuffleLotsForBlock(lots, block);

        // Side-facing buildings don't have partner buildings or travel agencies, so don't worry about that

        // totalLotsHeight is now larger than blockHeight; get the difference:
        const spaceDiff = totalLotsHeight - blockHeight;

        // If this is a full block, center the lots in the block
        if (blockHeight === GFF.ROOM_H) {
            room.addRoomLogEntry(`Centering lots in full block: ${block.name}`);
            y -= (spaceDiff / 2);
            room.addRoomLogEntry(`SpaceDiff: ${spaceDiff}, y: ${y}`);
        } // If this is a north block, begin off the screen so it ends before the vertical road
        else if (block.start === GFF.ROOM_X) {
            room.addRoomLogEntry(`North block (begins at 0): ${block.name}`);
            y -= spaceDiff;
            room.addRoomLogEntry(`SpaceDiff: ${spaceDiff}, y: ${y}`);
        } // Otherwise, the block is a south block; it will begin at the horizontal road and then go off the screen
        else {
            room.addRoomLogEntry(`Assuming south block: ${block.name}`);
            room.addRoomLogEntry(`SpaceDiff: ${spaceDiff}, y: ${y}`);
        }

        // Finally, add the lots to the room
        lots.forEach(lot => {
            lot.normalizePositions(room);
            const lotPhys = lot.getPhysicalBounds();
            lot.finalizePlansToRoom(room, x, y, block.anchor);
            y += lotPhys.height;
        });
    }

    // Other
    public planPark(room: GRoom) {

    }

    public planParkingLot(room: GRoom) {

    }

    public planDeadEnd(room: GRoom) {

    }

    private static shuffleLotsForBlock(lots: GLot[], block: GCityBlock) {
        /**
         * Shuffle the lots, making sure lots that must be whole are not
         * on the edge of the screen.
         *
         * For full blocks, they must not be first or last.
         * For west(horz)/north(vert) blocks, they must not be first.
         * For east(horz)/south(vert) blocks, they must not be last.
         *
         * The simplest way to do this is probably to:
         * - do a regular shuffle
         * - find any whole lot and swap it with an inner lot
         */
        RANDOM.shuffle(lots);
        const wholeIndex = lots.findIndex(lot => lot.isRequiredToBeWhole());

        if (block.name.includes('full')) {
            if (wholeIndex === 0) {
                // Swap with the second-to-last lot
                ARRAY.swap(lots, wholeIndex, lots.length - 2);
            } else if (wholeIndex === lots.length - 1) {
                // Swap with the second lot
                ARRAY.swap(lots, wholeIndex, 1);
            }
        } else if (
            (block.name.includes('W') && block.name.includes('horz'))
            || (block.name.includes('N') && block.name.includes('vert'))){
            if (wholeIndex === 0) {
                // Swap with the second lot
                ARRAY.swap(lots, wholeIndex, 1);
            }
        } else if (
            (block.name.includes('E') && block.name.includes('horz'))
            || (block.name.includes('S') && block.name.includes('vert'))) {
            if (wholeIndex === lots.length - 1) {
                // Swap with the second-to-last lot
                ARRAY.swap(lots, wholeIndex, lots.length - 2);
            }
        }
    }

    public abstract getFenceStyle(): 'fence_link'|'fence_stockade'|'fence_picket';
    public abstract getFenceSpacing(): number;
}