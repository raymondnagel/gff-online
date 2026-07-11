import { GTownDistrict } from "./districts/GTownDistrict";
import { GRoom } from "./GRoom";
import { RANDOM } from "./random";
import { SCENERY } from "./scenery";
import { CardDir, Dir9, GAnchorSide, GBuildingOrientation, GRect, GSceneryDef, GSceneryPlan } from "./types";

// Create a combined type that has the body of a def and the position of a plan:
export type LotPlan = GSceneryDef & GSceneryPlan;

// Building lots can have any of these types:
export type BuildingLotType = 'unfenced' | 'fenced';

export type YardBorderSide = 'left'|'right'|'top'|'bottom';

type YardBorderOrientation = 'horizontal'|'vertical';

type YardBorder = {
    orientation: YardBorderOrientation;
    keys: string[];
};

type DrivewayGate = {
    direction: CardDir;
    center: number;
    width: number;
};

// Each fence style can have these segments:
export type FenceStyle = {
    frontHorz: string;
    backHorz: string;
    leftHorz: string;
    rightHorz: string;
    leftVert: string;
    rightVert: string;
    leftVertEnd: string;
    rightVertEnd: string;
}

/**
 * Distance (in pixels) between the front of a lot and the road.
 */
const DIST_TO_ROAD = 32;

/**
 * Driveways overlap the curb slightly so the curb does not show through.
 */
const DRIVEWAY_CURB_OVERLAP = 6;

/**
 * Gates are a little wider than driveways so the fence doesn't crowd the lane.
 */
const GATE_CLEARANCE = 8;

/**
 * Gap (in pixels) between a building and a fence between it and the road.
 *
 * (Fence lengths on the sides of a building are in fence sections, not pixels,
 * and they are determined by the district's fence spacing settings.)
 */
const FENCE_BUILDING_GAP = 20;

/**
 * Depth of a lot (in pixels) from front/roadside to the room edge.
 * For north/south facing buildings, this is the lot's height.
 * For east/west facing buildings, this is the lot's width.
 */
const NS_LOT_HEIGHT = 256;
const WE_LOT_WIDTH = 416;

const YARD_BORDER_POOLS: YardBorder[] = [
    { orientation: 'horizontal', keys: ['bush', 'shrub', 'boulder'] },
    { orientation: 'vertical', keys: ['bush', 'shrub', 'boulder'] },
];

const FENCE_STYLES: { [key: string]: FenceStyle } = {
    'fence_link': {
        frontHorz: 'fence_link_h',
        backHorz: 'fence_link_h',
        leftHorz: 'fence_link_h_left',
        rightHorz: 'fence_link_h_right',
        leftVert: 'fence_link_v_left',
        rightVert: 'fence_link_v_right',
        leftVertEnd: 'fence_link_vend_left',
        rightVertEnd: 'fence_link_vend_right'
    },
    'fence_stockade': {
        frontHorz: 'fence_stockade_h',
        backHorz: 'fence_stockade_h',
        leftHorz: 'fence_stockade_h_left',
        rightHorz: 'fence_stockade_h_right',
        leftVert: 'fence_stockade_v_left',
        rightVert: 'fence_stockade_v_right',
        leftVertEnd: 'fence_stockade_vend_left',
        rightVertEnd: 'fence_stockade_vend_right'
    },
    'fence_picket': {
        frontHorz: 'fence_picket_h',
        backHorz: 'fence_picket_h_back',
        leftHorz: 'fence_picket_h_left',
        rightHorz: 'fence_picket_h_right',
        leftVert: 'fence_picket_v_left',
        rightVert: 'fence_picket_v_right',
        leftVertEnd: 'fence_picket_vend_left',
        rightVertEnd: 'fence_picket_vend_right'
    },
};

/**
 * A lot is a temporary construct for filling a space in a city block.
 * 1. Add and position objects relative to the lot, not the room.
 * 2. All objects are positioned physically, using their body rectangles.
 * 3. Calculate the lot's dimensions based on its contents.
 * 4. When the lot is finally positioned, its contents are placed in the correct location within the room.
 * 5. The lot is no longer used after world-building.
 *
 * There will be different methods for creating:
 * - front-facing building lots
 * - back-facing building lots
 * - side-facing building lots
 * - parks
 * - parking lots
 */
export class GLot {

    private buildingPlan: LotPlan|null;
    private objectPlans: LotPlan[] = [];
    private decorationPlans: LotPlan[] = [];
    private layoutBounds: GRect[] = [];
    private drivewayGate: DrivewayGate|null = null;
    private entirelyOnScreen: boolean;
    private facingDirection: CardDir|null;
    private fenced: boolean = false;

    private constructor(buildingDef?: GSceneryDef, facingDirection?: CardDir) {
        this.facingDirection = facingDirection ?? null;
        if (buildingDef) {
            this.buildingPlan = this.addObjectPlan(buildingDef);
            // Position building so its physical top-left is at (0, 0)
            this.buildingPlan.x = -this.buildingPlan.body.x;
            this.buildingPlan.y = -this.buildingPlan.body.y;
        }
        // Set a flag if this lot MUST remain entirely on the screen
        this.entirelyOnScreen = buildingDef?.key === 'travel_agency_front';
    }

    /**
     * Create a new lot for a front-facing building (north side, facing south)
     */
    public static createFrontBuildingLot(
        buildingDef: GSceneryDef,
        room: GRoom,
        district: GTownDistrict,
        type?: BuildingLotType,
        partnerDef?: GSceneryDef
    ): GLot {
        // Create an instance for the lot
        const lot: GLot = new GLot(buildingDef, Dir9.S);
        let partner: LotPlan|undefined;
        if (partnerDef) {
            partner = lot.addSidePartnerBuilding(partnerDef);
            lot.reserveGarageDrivewayGate(partner);
        }
        const addHouseDriveway: boolean = !partner && GLot.canHaveDriveway(buildingDef.key);
        if (addHouseDriveway) {
            lot.reserveHouseDrivewaySpace();
        }
        // Determine which type to create (unless it was already supplied)
        if (!type) {
            type = GLot.canBeFenced(buildingDef.key) ?
                RANDOM.randElement(['unfenced', 'fenced']) :
                'unfenced';
        }
        switch (type) {
            case 'unfenced':
                // Unfenced is pretty simple; unless we decide to add other decorations,
                // it's pretty much already done.
                break;
            case 'fenced':
                // We'll enclose the building with a fence around the perimeter
                lot.fenced = true;
                const fenceBoxStyle: string = GLot.getFenceForBuilding(buildingDef.key, district);
                const leftSegments: number = district.getFenceSpacing();
                const rightSegments: number = district.getFenceSpacing();
                lot.createFencedLot(
                    fenceBoxStyle,
                    Dir9.S,
                    leftSegments,
                    rightSegments,
                    room
                );
                break;
        }
        if (partner) {
            lot.createGarageDriveway(partner);
        } else if (addHouseDriveway) {
            lot.createHouseDriveway();
        }
        return lot;
    }

    /**
     * Create a new lot for a back-facing building (south side, facing north)
     */
    public static createBackBuildingLot(buildingDef: GSceneryDef, room: GRoom, district: GTownDistrict, type?: BuildingLotType): GLot {
        // Create an instance for the lot
        const lot: GLot = new GLot(buildingDef, Dir9.N);
        const addHouseDriveway: boolean = GLot.canHaveDriveway(buildingDef.key);
        if (addHouseDriveway) {
            lot.reserveHouseDrivewaySpace();
        }
        // Determine which type to create (unless it was already supplied)
        if (!type) {
            type = GLot.canBeFenced(buildingDef.key) ?
                RANDOM.randElement(['unfenced', 'fenced']) :
                'unfenced';
        }
        switch (type) {
            case 'unfenced':
                // Unfenced is pretty simple; unless we decide to add other decorations,
                // it's pretty much already done.
                break;
            case 'fenced':
                // We'll enclose the building with a fence around the perimeter
                lot.fenced = true;
                const fenceBoxStyle: string = GLot.getFenceForBuilding(buildingDef.key, district);
                const leftSegments: number = district.getFenceSpacing();
                const rightSegments: number = district.getFenceSpacing();
                lot.createFencedLot(
                    fenceBoxStyle,
                    Dir9.N,
                    leftSegments,
                    rightSegments,
                    room
                );
                break;
        }
        if (addHouseDriveway) {
            lot.createHouseDriveway();
        }
        return lot;
    }

    /**
     * Create a new lot for a left-facing building (east side, facing west)
     */
    public static createLeftBuildingLot(buildingDef: GSceneryDef, room: GRoom, district: GTownDistrict, type?: BuildingLotType): GLot {
        // Create an instance for the lot
        const lot: GLot = new GLot(buildingDef, Dir9.W);
        const addHouseDriveway: boolean = GLot.canHaveDriveway(buildingDef.key);
        if (addHouseDriveway) {
            lot.reserveHouseDrivewaySpace();
        }
        // Determine which type to create (unless it was already supplied)
        if (!type) {
            type = GLot.canBeFenced(buildingDef.key) ?
                RANDOM.randElement(['unfenced', 'fenced']) :
                'unfenced';
        }
        switch (type) {
            case 'unfenced':
                // Unfenced is pretty simple; unless we decide to add other decorations,
                // it's pretty much already done.
                break;
            case 'fenced':
                // We'll enclose the building with a fence around the perimeter
                lot.fenced = true;
                const fenceBoxStyle: string = GLot.getFenceForBuilding(buildingDef.key, district);
                const leftSegments: number = district.getFenceSpacing();
                const rightSegments: number = district.getFenceSpacing();
                lot.createFencedLot(
                    fenceBoxStyle,
                    Dir9.W,
                    leftSegments,
                    rightSegments,
                    room
                );
                break;
        }
        if (addHouseDriveway) {
            lot.createHouseDriveway();
        }
        return lot;
    }

    /**
     * Create a new lot for a right-facing building (west side, facing east)
     */
    public static createRightBuildingLot(buildingDef: GSceneryDef, room: GRoom, district: GTownDistrict, type?: BuildingLotType): GLot {
        // Create an instance for the lot
        const lot: GLot = new GLot(buildingDef, Dir9.E);
        const addHouseDriveway: boolean = GLot.canHaveDriveway(buildingDef.key);
        if (addHouseDriveway) {
            lot.reserveHouseDrivewaySpace();
        }
        // Determine which type to create (unless it was already supplied)
        if (!type) {
            type = GLot.canBeFenced(buildingDef.key) ?
                RANDOM.randElement(['unfenced', 'fenced']) :
                'unfenced';
        }
        switch (type) {
            case 'unfenced':
                // Unfenced is pretty simple; unless we decide to add other decorations,
                // it's pretty much already done.
                break;
            case 'fenced':
                // We'll enclose the building with a fence around the perimeter
                lot.fenced = true;
                const fenceBoxStyle: string = GLot.getFenceForBuilding(buildingDef.key, district);
                const leftSegments: number = district.getFenceSpacing();
                const rightSegments: number = district.getFenceSpacing();
                lot.createFencedLot(
                    fenceBoxStyle,
                    Dir9.E,
                    leftSegments,
                    rightSegments,
                    room
                );
                break;
        }
        if (addHouseDriveway) {
            lot.createHouseDriveway();
        }
        return lot;
    }

    public isRequiredToBeWhole(): boolean {
        return this.entirelyOnScreen;
    }

    public addYardBorder(side: YardBorderSide, room: GRoom) {
        if (this.fenced || !this.buildingPlan || !this.facingDirection) {
            return;
        }

        const borderRect: GRect|null = this.getYardBorderRect(side);
        if (!borderRect) {
            return;
        }

        const orientation: YardBorderOrientation = side === 'left' || side === 'right' ? 'vertical' : 'horizontal';
        const border: YardBorder = RANDOM.randElement(YARD_BORDER_POOLS.filter(pool => pool.orientation === orientation));
        room.addRoomLogEntry(`Adding ${side} yard border from ${border.keys.join(', ')}`);

        if (orientation === 'vertical') {
            this.addVerticalYardBorder(border, side, borderRect);
        } else {
            this.addHorizontalYardBorder(border, side, borderRect);
        }
    }

    /**
     * Call this to normalize the positions of all objects in the lot.
     * Originally, the building is set at 0, 0. If we add another object
     * at -100, -100, we'll now shift everything so that other object
     * is at 0, 0, and the building is at 100, 100.
     *
     * This must be done ahead of finalizing the lot within the room.
     */
    public normalizePositions(room: GRoom) {
        const minX = Math.min(...this.objectPlans.map(obj => obj.x));
        const minY = Math.min(...this.objectPlans.map(obj => obj.y));

        for (const obj of this.objectPlans) {
            room.addRoomLogEntry(`Normalizing ${obj.key} from (${obj.x}, ${obj.y})`);
            obj.x -= minX;
            obj.y -= minY;
            room.addRoomLogEntry(`...to (${obj.x}, ${obj.y})!`);
        }

        for (const obj of this.decorationPlans) {
            obj.x -= minX;
            obj.y -= minY;
        }

        for (const bounds of this.layoutBounds) {
            bounds.x -= minX;
            bounds.y -= minY;
        }

        if (this.drivewayGate) {
            switch (this.drivewayGate.direction) {
                case Dir9.N:
                case Dir9.S:
                    this.drivewayGate.center -= minX;
                    break;
                case Dir9.E:
                case Dir9.W:
                    this.drivewayGate.center -= minY;
                    break;
            }
        }
    }

    /**
     * Return the physical x, y, width, and height of the lot by spanning the
     * smallest left-edge to the largest right-edge, and the smallest top-edge
     * to the largest bottom-edge.
     *
     * Call this after normalizing positions; the returned shape will essentially
     * be the "body" of the lot.
     */
    public getPhysicalBounds(): GRect {
        const bounds: GRect[] = [
            ...this.objectPlans.map(obj => ({ x: obj.x, y: obj.y, width: obj.body.width, height: obj.body.height })),
            ...this.layoutBounds
        ];
        const minX = Math.min(...bounds.map(obj => obj.x));
        const minY = Math.min(...bounds.map(obj => obj.y));
        const maxX = Math.max(...bounds.map(obj => obj.x + obj.width));
        const maxY = Math.max(...bounds.map(obj => obj.y + obj.height));

        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }

    /**
     * Finalize the plans for the lot by adding them directly to the room,
     * using the anchor to determine how the lot should align with the given
     * coordinates. Make sure positions are normalized before calling this.
     */
    public finalizePlansToRoom(room: GRoom, lotX: number, lotY: number, anchor: GAnchorSide) {
        // Get the physical bounds of the lot's contents:
        const lotBounds: GRect = this.getPhysicalBounds();

        room.addRoomLogEntry(`Finalizing lot at (${lotX}, ${lotY}) with anchor ${anchor}`);
        for (const obj of this.objectPlans) {
            room.addRoomLogEntry(` - ${obj.key} at (${obj.x}, ${obj.y})`);
        }

        // Move the anchored physical edge to the associated coordinate, so that it will
        // be placed in the correct position to be physically aligned.
        switch (anchor) {
            case 'top':
                lotY -= lotBounds.y;
                break;
            case 'bottom':
                lotY -= (lotBounds.y + lotBounds.height);
                break;
            case 'left':
                lotX -= lotBounds.x;
                break;
            case 'right':
                lotX -= (lotBounds.x + lotBounds.width);
                break;
        }

        for (const obj of this.objectPlans) {
            // Scenery plans are in visual coordinates, so translate them back
            // (normalization made them all physical coordinates)
            room.addSceneryPlan(obj.key, lotX + obj.x - obj.body.x, lotY + obj.y - obj.body.y);
        }

        for (const obj of this.decorationPlans) {
            room.addSceneryPlan(obj.key, lotX + obj.x - obj.body.x, lotY + obj.y - obj.body.y);
        }
    }

    /**
     * Add an object to the lot as a plan.
     * It is initially unpositioned, and needs to be anchored to something afterward.
     * Alternatively, it can be positioned directly by setting x/y on the returned object.
     */
    private addObjectPlan(objDef: GSceneryDef): LotPlan {
        const plan: LotPlan = {
            ...objDef,
            x: 0,
            y: 0,
            id: 0 // The LotPlan itself doesn't get added to the room, so this won't be used.
        };
        this.objectPlans.push(plan);
        return plan;
    }

    private addDecorationPlan(objDef: GSceneryDef): LotPlan {
        const plan: LotPlan = {
            ...objDef,
            x: 0,
            y: 0,
            id: 0
        };
        this.decorationPlans.push(plan);
        return plan;
    }

    private addSidePartnerBuilding(partnerDef: GSceneryDef): LotPlan {
        const building: LotPlan = this.buildingPlan!;
        const partner: LotPlan = this.addObjectPlan(partnerDef);

        partner.x = RANDOM.flipCoin()
            ? building.x - partner.body.width
            : building.x + building.body.width;
        partner.y = building.y + building.body.height - partner.body.height;
        return partner;
    }

    private createGarageDriveway(garage: LotPlan) {
        if (this.facingDirection !== Dir9.S) {
            return;
        }

        this.createDriveway(
            garage.x + (garage.body.width / 2),
            garage.y + garage.body.height,
            Dir9.S
        );
    }

    private reserveGarageDrivewayGate(garage: LotPlan) {
        if (this.facingDirection !== Dir9.S) {
            return;
        }

        const stripDef: GSceneryDef = SCENERY.def(GLot.getDrivewayStripKey(Dir9.S));
        this.drivewayGate = {
            direction: Dir9.S,
            center: garage.x + (garage.body.width / 2),
            width: stripDef.body.width + GATE_CLEARANCE
        };
    }

    private reserveHouseDrivewaySpace() {
        const building: LotPlan = this.buildingPlan!;
        const stripDef: GSceneryDef = SCENERY.def(GLot.getDrivewayStripKey(this.facingDirection!));

        switch (this.facingDirection) {
            case Dir9.S:
            case Dir9.N:
                this.layoutBounds.push({
                    x: building.x + building.body.width,
                    y: building.y,
                    width: stripDef.body.width,
                    height: building.body.height
                });
                this.drivewayGate = {
                    direction: this.facingDirection,
                    center: building.x + building.body.width + (stripDef.body.width / 2),
                    width: stripDef.body.width + GATE_CLEARANCE
                };
                break;
            case Dir9.E:
            case Dir9.W:
                this.layoutBounds.push({
                    x: building.x,
                    y: building.y + building.body.height,
                    width: building.body.width,
                    height: stripDef.body.height
                });
                this.drivewayGate = {
                    direction: this.facingDirection,
                    center: building.y + building.body.height + (stripDef.body.height / 2),
                    width: stripDef.body.height + GATE_CLEARANCE
                };
                break;
        }
    }

    private createHouseDriveway() {
        const building: LotPlan = this.buildingPlan!;
        const stripDef: GSceneryDef = SCENERY.def(GLot.getDrivewayStripKey(this.facingDirection!));

        switch (this.facingDirection) {
            case Dir9.S:
                this.createDriveway(
                    building.x + building.body.width + (stripDef.body.width / 2),
                    building.y,
                    Dir9.S
                );
                break;
            case Dir9.N:
                this.createDriveway(
                    building.x + building.body.width + (stripDef.body.width / 2),
                    building.y + building.body.height,
                    Dir9.N
                );
                break;
            case Dir9.E:
                this.createDriveway(
                    building.x,
                    building.y + building.body.height + (stripDef.body.height / 2),
                    Dir9.E
                );
                break;
            case Dir9.W:
                this.createDriveway(
                    building.x + building.body.width,
                    building.y + building.body.height + (stripDef.body.height / 2),
                    Dir9.W
                );
                break;
        }
    }

    private createDriveway(originX: number, originY: number, direction: CardDir) {
        const endDef: GSceneryDef = SCENERY.def(GLot.getDrivewayEndKey(direction));
        const stripDef: GSceneryDef = SCENERY.def(GLot.getDrivewayStripKey(direction));

        switch (direction) {
            case Dir9.S:
                this.createSouthDriveway(originX, originY, endDef, stripDef);
                break;
            case Dir9.N:
                this.createNorthDriveway(originX, originY, endDef, stripDef);
                break;
            case Dir9.E:
                this.createEastDriveway(originX, originY, endDef, stripDef);
                break;
            case Dir9.W:
                this.createWestDriveway(originX, originY, endDef, stripDef);
                break;
        }
    }

    private createSouthDriveway(originX: number, originY: number, endDef: GSceneryDef, stripDef: GSceneryDef) {
        const lotBounds: GRect = this.getPhysicalBounds();
        const roadEdgeY: number = lotBounds.y + lotBounds.height + DIST_TO_ROAD + DRIVEWAY_CURB_OVERLAP;
        const end: LotPlan = this.addDecorationPlan(endDef);
        end.x = originX - (end.body.width / 2);
        end.y = roadEdgeY - end.body.height;

        let y: number = end.y - stripDef.body.height;
        while (y > originY - stripDef.body.height) {
            const strip: LotPlan = this.addDecorationPlan(stripDef);
            strip.x = originX - (strip.body.width / 2);
            strip.y = y;
            y -= strip.body.height;
        }
    }

    private createNorthDriveway(originX: number, originY: number, endDef: GSceneryDef, stripDef: GSceneryDef) {
        const lotBounds: GRect = this.getPhysicalBounds();
        const roadEdgeY: number = lotBounds.y - DIST_TO_ROAD - DRIVEWAY_CURB_OVERLAP;
        const end: LotPlan = this.addDecorationPlan(endDef);
        end.x = originX - (end.body.width / 2);
        end.y = roadEdgeY;

        let y: number = end.y + end.body.height;
        while (y < originY) {
            const strip: LotPlan = this.addDecorationPlan(stripDef);
            strip.x = originX - (strip.body.width / 2);
            strip.y = y;
            y += strip.body.height;
        }
    }

    private createEastDriveway(originX: number, originY: number, endDef: GSceneryDef, stripDef: GSceneryDef) {
        const lotBounds: GRect = this.getPhysicalBounds();
        const roadEdgeX: number = lotBounds.x + lotBounds.width + DIST_TO_ROAD + DRIVEWAY_CURB_OVERLAP;
        const end: LotPlan = this.addDecorationPlan(endDef);
        end.x = roadEdgeX - end.body.width;
        end.y = originY - (end.body.height / 2);

        let x: number = end.x - stripDef.body.width;
        while (x > originX - stripDef.body.width) {
            const strip: LotPlan = this.addDecorationPlan(stripDef);
            strip.x = x;
            strip.y = originY - (strip.body.height / 2);
            x -= strip.body.width;
        }
    }

    private createWestDriveway(originX: number, originY: number, endDef: GSceneryDef, stripDef: GSceneryDef) {
        const lotBounds: GRect = this.getPhysicalBounds();
        const roadEdgeX: number = lotBounds.x - DIST_TO_ROAD - DRIVEWAY_CURB_OVERLAP;
        const end: LotPlan = this.addDecorationPlan(endDef);
        end.x = roadEdgeX;
        end.y = originY - (end.body.height / 2);

        let x: number = end.x + end.body.width;
        while (x < originX) {
            const strip: LotPlan = this.addDecorationPlan(stripDef);
            strip.x = x;
            strip.y = originY - (strip.body.height / 2);
            x += strip.body.width;
        }
    }

    private getYardBorderRect(side: YardBorderSide): GRect|null {
        const building: LotPlan = this.buildingPlan!;
        const lotBounds: GRect = this.getPhysicalBounds();
        const nsBackyardDepth: number = NS_LOT_HEIGHT - building.body.height;
        const weBackyardDepth: number = WE_LOT_WIDTH - building.body.width;
        const deepestEdge: number = this.getDeepestPhysicalEdgeWithinLot();

        switch (this.facingDirection) {
            case Dir9.S:
                if (side !== 'left' && side !== 'right') {
                    return null;
                }
                return {
                    x: lotBounds.x,
                    y: building.y - nsBackyardDepth,
                    width: lotBounds.width,
                    height: deepestEdge - (building.y - nsBackyardDepth)
                };
            case Dir9.N:
                if (side !== 'left' && side !== 'right') {
                    return null;
                }
                return {
                    x: lotBounds.x,
                    y: deepestEdge,
                    width: lotBounds.width,
                    height: building.y + building.body.height + nsBackyardDepth - deepestEdge
                };
            case Dir9.E:
                if (side !== 'top' && side !== 'bottom') {
                    return null;
                }
                return {
                    x: building.x - weBackyardDepth,
                    y: lotBounds.y,
                    width: deepestEdge - (building.x - weBackyardDepth),
                    height: lotBounds.height
                };
            case Dir9.W:
                if (side !== 'top' && side !== 'bottom') {
                    return null;
                }
                return {
                    x: deepestEdge,
                    y: lotBounds.y,
                    width: building.x + building.body.width + weBackyardDepth - deepestEdge,
                    height: lotBounds.height
                };
        }
        return null;
    }

    private getDeepestPhysicalEdgeWithinLot(): number {
        switch (this.facingDirection) {
            case Dir9.S:
                return Math.min(...this.objectPlans.map(obj => obj.y));
            case Dir9.N:
                return Math.max(...this.objectPlans.map(obj => obj.y + obj.body.height));
            case Dir9.E:
                return Math.min(...this.objectPlans.map(obj => obj.x));
            case Dir9.W:
                return Math.max(...this.objectPlans.map(obj => obj.x + obj.body.width));
            default:
                return 0;
        }
    }

    private addVerticalYardBorder(border: YardBorder, side: YardBorderSide, borderRect: GRect) {
        let y: number = borderRect.y;
        const endY: number = borderRect.y + borderRect.height;

        while (y < endY) {
            const def: GSceneryDef = SCENERY.def(RANDOM.randElement(border.keys));
            const plan: LotPlan = this.addObjectPlan(def);
            plan.x = side === 'left' ? borderRect.x : borderRect.x + borderRect.width - def.body.width;
            plan.y = y;
            y += def.body.height;
        }
    }

    private addHorizontalYardBorder(border: YardBorder, side: YardBorderSide, borderRect: GRect) {
        let x: number = borderRect.x;
        const endX: number = borderRect.x + borderRect.width;

        while (x < endX) {
            const def: GSceneryDef = SCENERY.def(RANDOM.randElement(border.keys));
            const plan: LotPlan = this.addObjectPlan(def);
            plan.x = x;
            plan.y = side === 'top' ? borderRect.y : borderRect.y + borderRect.height - def.body.height;
            x += def.body.width;
        }
    }

    /**
     * Anchor thisObj to thatObj by aligning their physical edges.
     * A positive or negative offset can be supplied.
     *
     * When anchoring a left to another left, a 0-offset would keep them flush.
     * When anchoring a left to a right, use a 1-offset to place thisObj directly after thatObj.
     */
    private anchorHorz(
        thisObj: LotPlan,
        thatObj: LotPlan,
        thisAnchor: 'left'|'right',
        thatAnchor: 'left'|'right',
        offset: number = 0
    ) {
        let targetX: number;

        switch (thatAnchor) {
            case 'left':
                targetX = thatObj.x + thatObj.body.x
                break;
            case 'right':
                targetX = thatObj.x + thatObj.body.x + thatObj.body.width;
                break;
        }

        switch (thisAnchor) {
            case 'left':
                thisObj.x = targetX! - thisObj.body.x - thisObj.x + offset;
                break;
            case 'right':
                thisObj.x = targetX! - thisObj.body.width - thisObj.body.x - thisObj.x + offset;
                break;
        }
    }

    /**
     * Anchor thisObj to thatObj by aligning their physical edges.
     * A positive or negative offset can be supplied.
     *
     * When anchoring a top to another top, a 0-offset would keep them flush.
     * When anchoring a top to a bottom, use a 1-offset to place thisObj directly after thatObj.
     */
    private anchorVert(
        thisObj: LotPlan,
        thatObj: LotPlan,
        thisAnchor: 'top'|'bottom',
        thatAnchor: 'top'|'bottom',
        offset: number = 0
    ) {
        let targetY: number;

        switch (thatAnchor) {
            case 'top':
                targetY = thatObj.y + thatObj.body.y;
                break;
            case 'bottom':
                targetY = thatObj.y + thatObj.body.y + thatObj.body.height;
                break;
        }

        switch (thisAnchor) {
            case 'top':
                thisObj.y = targetY! - thisObj.body.y - thisObj.y + offset;
                break;
            case 'bottom':
                thisObj.y = targetY! - thisObj.body.height - thisObj.body.y - thisObj.y + offset;
                break;
        }
    }

    /**
     * Create a section of horizontal fence segments along a base Y,
     * starting at startX and moving in dirX (1 for right, -1 for left).
     * Returns the ending X position after placing all segments.
     */
    private createHorzFenceSection(
        fenceType: string,
        segments: number,
        baseY: number,
        startX: number,
        dirX: 1|-1,
        backSide: boolean = false
    ): number {
        const fenceStyle = FENCE_STYLES[fenceType];
        const mainDef = SCENERY.def(backSide ? fenceStyle.backHorz : fenceStyle.frontHorz);
        const leftDef = SCENERY.def(fenceStyle.leftHorz);
        const rightDef = SCENERY.def(fenceStyle.rightHorz);
        const segmentHeight = mainDef.body.height;

        let x: number = startX;
        let plan: LotPlan;
        for (let s: number = 0; s < segments; s++) {
            if (s === 0) {
                plan = this.addObjectPlan(leftDef);
                plan.x = x;
                plan.y = baseY - segmentHeight;
                x += (dirX * leftDef.body.width);
            } else if (s === segments - 1) {
                plan = this.addObjectPlan(rightDef);
                plan.x = x;
                plan.y = baseY - segmentHeight;
                x += (dirX * rightDef.body.width);
            } else {
                plan = this.addObjectPlan(mainDef);
                plan.x = x;
                plan.y = baseY - segmentHeight;
                x += (dirX * mainDef.body.width);
            }
        }
        return x;
    }

    /**
     * Create a section of vertical fence segments along a base X,
     * starting at startY and moving in dirY (1 for down, -1 for up).
     * Returns the ending Y position after placing all segments.
     */
    private createVertFenceSection(
        fenceType: string,
        segments: number,
        baseX: number,
        startY: number,
        dirY: 1|-1,
        rightSide: boolean = false,
        addEndPosts: boolean = false
    ): number {
        const fenceStyle = FENCE_STYLES[fenceType];
        const mainDef = SCENERY.def(rightSide ? fenceStyle.rightVert : fenceStyle.leftVert);
        const endDef = SCENERY.def(rightSide ? fenceStyle.rightVertEnd : fenceStyle.leftVertEnd);
        const segmentHeight = mainDef.body.height;

        let y: number = startY;
        let plan: LotPlan;
        for (let s: number = 0; s < segments; s++) {
            if (addEndPosts && (s === 0 || s === segments - 1)) {
                plan = this.addObjectPlan(endDef);
            } else {
                plan = this.addObjectPlan(mainDef);
            }
            plan.x = baseX;
            plan.y = y - segmentHeight;
            y += (dirY * segmentHeight);
        }
        return y;
    }

    private createHorzFenceSectionWithGate(
        fenceType: string,
        segments: number,
        baseY: number,
        startX: number,
        dirX: 1|-1,
        gate: DrivewayGate,
        backSide: boolean = false
    ): number {
        const fenceStyle = FENCE_STYLES[fenceType];
        const mainDef = SCENERY.def(backSide ? fenceStyle.backHorz : fenceStyle.frontHorz);
        const leftDef = SCENERY.def(fenceStyle.leftHorz);
        const rightDef = SCENERY.def(fenceStyle.rightHorz);
        const segmentHeight = mainDef.body.height;
        const gateStart = gate.center - (gate.width / 2);
        const gateEnd = gate.center + (gate.width / 2);
        const slots: { x: number; def: GSceneryDef }[] = [];

        let x: number = startX;
        for (let s: number = 0; s < segments; s++) {
            const def = s === 0 ? leftDef : s === segments - 1 ? rightDef : mainDef;
            slots.push({ x, def });
            x += (dirX * def.body.width);
        }

        const skipped: boolean[] = slots.map(slot => (
            slot.x < gateEnd && slot.x + slot.def.body.width > gateStart
        ));
        const firstSkipped = skipped.findIndex(Boolean);
        const lastSkipped = skipped.length - 1 - [...skipped].reverse().findIndex(Boolean);

        for (let s: number = 0; s < slots.length; s++) {
            if (skipped[s]) {
                continue;
            }

            let def = slots[s].def;
            if (s === firstSkipped - 1) {
                def = rightDef;
            } else if (s === lastSkipped + 1) {
                def = leftDef;
            }

            const plan = this.addObjectPlan(def);
            plan.x = slots[s].x;
            plan.y = baseY - segmentHeight;
        }

        return x;
    }

    private getHorzGateActualCenter(
        fenceType: string,
        segments: number,
        startX: number,
        dirX: 1|-1,
        gate: DrivewayGate,
        backSide: boolean = false
    ): number {
        const fenceStyle = FENCE_STYLES[fenceType];
        const mainDef = SCENERY.def(backSide ? fenceStyle.backHorz : fenceStyle.frontHorz);
        const leftDef = SCENERY.def(fenceStyle.leftHorz);
        const rightDef = SCENERY.def(fenceStyle.rightHorz);
        const gateStart = gate.center - (gate.width / 2);
        const gateEnd = gate.center + (gate.width / 2);
        const slots: { x: number; def: GSceneryDef }[] = [];

        let x: number = startX;
        for (let s: number = 0; s < segments; s++) {
            const def = s === 0 ? leftDef : s === segments - 1 ? rightDef : mainDef;
            slots.push({ x, def });
            x += (dirX * def.body.width);
        }

        const skipped = slots.filter(slot => (
            slot.x < gateEnd && slot.x + slot.def.body.width > gateStart
        ));
        if (skipped.length === 0) {
            return gate.center;
        }

        const openingStart = Math.min(...skipped.map(slot => slot.x));
        const openingEnd = Math.max(...skipped.map(slot => slot.x + slot.def.body.width));
        return openingStart + ((openingEnd - openingStart) / 2);
    }

    private createVertFenceSectionWithGate(
        fenceType: string,
        segments: number,
        baseX: number,
        startY: number,
        dirY: 1|-1,
        gate: DrivewayGate,
        rightSide: boolean = false
    ): number {
        const fenceStyle = FENCE_STYLES[fenceType];
        const mainDef = SCENERY.def(rightSide ? fenceStyle.rightVert : fenceStyle.leftVert);
        const endDef = SCENERY.def(rightSide ? fenceStyle.rightVertEnd : fenceStyle.leftVertEnd);
        const segmentHeight = mainDef.body.height;
        const gateStart = gate.center - (gate.width / 2);
        const gateEnd = gate.center + (gate.width / 2);
        const slots: { y: number; def: GSceneryDef }[] = [];

        let y: number = startY;
        for (let s: number = 0; s < segments; s++) {
            slots.push({ y, def: mainDef });
            y += (dirY * segmentHeight);
        }

        const skipped: boolean[] = slots.map(slot => (
            slot.y - segmentHeight < gateEnd && slot.y > gateStart
        ));
        const firstSkipped = skipped.findIndex(Boolean);
        const lastSkipped = skipped.length - 1 - [...skipped].reverse().findIndex(Boolean);

        for (let s: number = 0; s < slots.length; s++) {
            if (skipped[s]) {
                continue;
            }

            const def = s === firstSkipped - 1 || s === lastSkipped + 1 ? endDef : slots[s].def;
            const plan = this.addObjectPlan(def);
            plan.x = baseX;
            plan.y = slots[s].y - segmentHeight;
        }

        return y;
    }

    private getVertGateActualCenter(
        fenceType: string,
        segments: number,
        startY: number,
        dirY: 1|-1,
        gate: DrivewayGate,
        rightSide: boolean = false
    ): number {
        const fenceStyle = FENCE_STYLES[fenceType];
        const mainDef = SCENERY.def(rightSide ? fenceStyle.rightVert : fenceStyle.leftVert);
        const segmentHeight = mainDef.body.height;
        const gateStart = gate.center - (gate.width / 2);
        const gateEnd = gate.center + (gate.width / 2);
        const slots: { y: number; def: GSceneryDef }[] = [];

        let y: number = startY;
        for (let s: number = 0; s < segments; s++) {
            slots.push({ y, def: mainDef });
            y += (dirY * segmentHeight);
        }

        const skipped = slots.filter(slot => (
            slot.y - segmentHeight < gateEnd && slot.y > gateStart
        ));
        if (skipped.length === 0) {
            return gate.center;
        }

        const openingStart = Math.min(...skipped.map(slot => slot.y - segmentHeight));
        const openingEnd = Math.max(...skipped.map(slot => slot.y));
        return openingStart + ((openingEnd - openingStart) / 2);
    }

    private shiftPreFenceContentsForGate(delta: number) {
        if (!this.drivewayGate || delta === 0) {
            return;
        }

        switch (this.drivewayGate.direction) {
            case Dir9.N:
            case Dir9.S:
                for (const obj of this.objectPlans) {
                    obj.x += delta;
                }
                for (const bounds of this.layoutBounds) {
                    bounds.x += delta;
                }
                this.drivewayGate.center += delta;
                break;
            case Dir9.E:
            case Dir9.W:
                for (const obj of this.objectPlans) {
                    obj.y += delta;
                }
                for (const bounds of this.layoutBounds) {
                    bounds.y += delta;
                }
                this.drivewayGate.center += delta;
                break;
        }
    }

    private alignPreFenceContentsToGate(
        fenceType: string,
        horizontalSegments: number,
        verticalSegments: number,
        offsetX: number,
        offsetY: number,
        hFenceDef: GSceneryDef
    ) {
        if (!this.drivewayGate) {
            return;
        }

        let actualCenter: number;
        switch (this.drivewayGate.direction) {
            case Dir9.N:
                actualCenter = this.getHorzGateActualCenter(fenceType, horizontalSegments, offsetX, 1, this.drivewayGate, true);
                break;
            case Dir9.S:
                actualCenter = this.getHorzGateActualCenter(fenceType, horizontalSegments, offsetX, 1, this.drivewayGate);
                break;
            case Dir9.E:
                actualCenter = this.getVertGateActualCenter(
                    fenceType,
                    verticalSegments,
                    offsetY + hFenceDef.body.height,
                    1,
                    this.drivewayGate,
                    true
                );
                break;
            case Dir9.W:
                actualCenter = this.getVertGateActualCenter(
                    fenceType,
                    verticalSegments,
                    offsetY + hFenceDef.body.height,
                    1,
                    this.drivewayGate
                );
                break;
        }

        this.shiftPreFenceContentsForGate(actualCenter! - this.drivewayGate.center);
    }

    /**
     * leftSegments and rightSegments are the number of segments to place on each side of the building.
     * They are relative to the building's front; so for a south-facing building, leftSegments is on the west side,
     * and rightSegments is on the east side. For an east-facing building, leftSegments is on the north side, etc.
     */
    private createFencedLot(
        fenceType: string,
        facingDirection: CardDir,
        leftSegments: number,
        rightSegments: number,
        room: GRoom
    ) {
        const fenceStyle = FENCE_STYLES[fenceType];
        const hFenceDef = SCENERY.def(fenceStyle.frontHorz);
        const vFenceDef = SCENERY.def(fenceStyle.leftVert);
        const building: LotPlan = this.buildingPlan!;
        const structureBounds: GRect = this.getPhysicalBounds();
        let lotWidth: number;
        let lotHeight: number;
        let backyardDepth: number;
        let offsetX: number;
        let offsetY: number;
        switch (facingDirection) {
            case Dir9.S: // Front facing SOUTH (front visible)
                // Backyard depth is whatever is left over after the structure, fence gap, and the combined front and back fence heights
                backyardDepth = NS_LOT_HEIGHT - (structureBounds.height + FENCE_BUILDING_GAP + (hFenceDef.body.height * 2));
                // Fence is placed behind the backyard, which is directly behind the structure
                offsetY = structureBounds.y - backyardDepth;
                offsetX = structureBounds.x - (leftSegments * hFenceDef.body.width);
                lotWidth = (hFenceDef.body.width * (leftSegments + rightSegments)) + structureBounds.width;
                lotHeight = NS_LOT_HEIGHT;
                break;
            case Dir9.N: // Front facing NORTH (back visible)
                // Fence is placed before the front yard (fence gap)
                offsetY = structureBounds.y - (FENCE_BUILDING_GAP + hFenceDef.body.height);
                offsetX = structureBounds.x - (rightSegments * hFenceDef.body.width);
                lotWidth = (hFenceDef.body.width * (leftSegments + rightSegments)) + structureBounds.width;
                lotHeight = NS_LOT_HEIGHT;
                break;
            case Dir9.E: // Front facing EAST (side visible; on the left side of the room)
                // Backyard depth is whatever is left over after the building, fence gap, and the combined side fence widths
                backyardDepth = WE_LOT_WIDTH - (structureBounds.width + FENCE_BUILDING_GAP + (vFenceDef.body.width * 2));
                // Fence is placed behind the backyard, which is directly behind the building
                offsetX = structureBounds.x - backyardDepth;
                offsetY = structureBounds.y - (leftSegments * vFenceDef.body.height);
                lotWidth = WE_LOT_WIDTH;
                lotHeight = (vFenceDef.body.height * (leftSegments + rightSegments)) + structureBounds.height;
                break;
            case Dir9.W: // Front facing WEST (side visible; on the right side of the room)
                // Fence is placed before the front yard (fence gap)
                offsetX = structureBounds.x - (FENCE_BUILDING_GAP + vFenceDef.body.width);
                offsetY = structureBounds.y - (rightSegments * vFenceDef.body.height);
                lotWidth = WE_LOT_WIDTH;
                lotHeight = (vFenceDef.body.height * (leftSegments + rightSegments)) + structureBounds.height;
                break;
        }

        const horizontalSegments: number = Math.floor(lotWidth / hFenceDef.body.width);
        const verticalSegments: number = Math.floor((lotHeight - (hFenceDef.body.height * 2)) / vFenceDef.body.height);
        const actualWidth: number = horizontalSegments * hFenceDef.body.width;
        const actualHeight: number = verticalSegments * vFenceDef.body.height;

        const buildingEndX: number = building.x + building.body.width;
        const buildingEndY: number = building.y + building.body.height;

        room.addRoomLogEntry(`Creating fenced lot: ${horizontalSegments} horizontal segments, ${verticalSegments} vertical segments`);
        room.addRoomLogEntry(`Positioned at: (${offsetX}, ${offsetY})`);
        room.addRoomLogEntry(`Actual lot dimensions: ${actualWidth}w x ${actualHeight}h`);
        room.addRoomLogEntry(`Lot ends at: (${offsetX + actualWidth}, ${offsetY + actualHeight})`);
        room.addRoomLogEntry(`Building from: (${building.x}, ${building.y}) to (${buildingEndX}, ${buildingEndY})`);
        room.addRoomLogEntry(`Structure bounds: (${structureBounds.x}, ${structureBounds.y}) ${structureBounds.width}w x ${structureBounds.height}h`);

        this.alignPreFenceContentsToGate(
            fenceType,
            horizontalSegments,
            verticalSegments,
            offsetX,
            offsetY,
            hFenceDef
        );

        // Create the back fence section
        let horzFenceEnd: number = this.drivewayGate?.direction === Dir9.N
            ? this.createHorzFenceSectionWithGate(
                fenceType,
                horizontalSegments,
                offsetY,
                offsetX,
                1,
                this.drivewayGate,
                true
            )
            : this.createHorzFenceSection(
                fenceType,
                horizontalSegments,
                offsetY,
                offsetX,
                1,
                true
            );

        // Create the left fence section
        let vertFenceEnd: number = this.drivewayGate?.direction === Dir9.W
            ? this.createVertFenceSectionWithGate(
                fenceType,
                verticalSegments,
                offsetX,
                offsetY + hFenceDef.body.height,
                1,
                this.drivewayGate
            )
            : this.createVertFenceSection(
                fenceType,
                verticalSegments,
                offsetX,
                offsetY + hFenceDef.body.height,
                1
            );

        // Create the right fence section
        if (this.drivewayGate?.direction === Dir9.E) {
            this.createVertFenceSectionWithGate(
                fenceType,
                verticalSegments,
                horzFenceEnd - vFenceDef.body.width,
                offsetY + hFenceDef.body.height,
                1,
                this.drivewayGate,
                true
            );
        } else {
            this.createVertFenceSection(
                fenceType,
                verticalSegments,
                horzFenceEnd - vFenceDef.body.width,
                offsetY + hFenceDef.body.height,
                1,
                true
            );
        }

        // Create the front fence section
        if (this.drivewayGate?.direction === Dir9.S) {
            this.createHorzFenceSectionWithGate(
                fenceType,
                horizontalSegments,
                vertFenceEnd,
                offsetX,
                1,
                this.drivewayGate
            );
        } else {
            this.createHorzFenceSection(
                fenceType,
                horizontalSegments,
                vertFenceEnd,
                offsetX,
                1
            );
        }
    }

    private static getFenceForBuilding(buildingKey: string, district: GTownDistrict): string {
        switch (buildingKey) {
            case 'factory_front':
            case 'warehouse_front':
            case 'police_station_front':
            case 'school_front':
            case 'apartments_front':
                return 'fence_link';
            default:
                return district.getFenceStyle();
        }
    }

    private static getDrivewayEndKey(direction: CardDir): string {
        switch (direction) {
            case Dir9.N:
                return 'driveway_end_n';
            case Dir9.S:
                return 'driveway_end_s';
            case Dir9.E:
                return 'driveway_end_e';
            case Dir9.W:
                return 'driveway_end_w';
        }
    }

    private static getDrivewayStripKey(direction: CardDir): string {
        switch (direction) {
            case Dir9.N:
            case Dir9.S:
                return 'driveway_strip_vert';
            case Dir9.E:
            case Dir9.W:
                return 'driveway_strip_horz';
        }
    }

    private static canBeFenced(buildingKey: string): boolean {
        switch (buildingKey) {
            case 'factory_front':
            case 'warehouse_front':
            case 'police_station_front':
            case 'school_front':
            case 'apartments_front':
            case 'cottage_front':
            case 'mansion_front':
                return true;
            default:
                if (buildingKey.startsWith('house_')) {
                    return true;
                }
        }  return false;
    }

    private static canHaveDriveway(buildingKey: string): boolean {
        return buildingKey.startsWith('house_');
    }
}
