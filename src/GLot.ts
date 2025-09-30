import { GTownDistrict } from "./districts/GTownDistrict";
import { GRoom } from "./GRoom";
import { RANDOM } from "./random";
import { SCENERY } from "./scenery";
import { CardDir, Dir9, GAnchorSide, GBuildingOrientation, GRect, GSceneryDef, GSceneryPlan } from "./types";

// Create a combined type that has the body of a def and the position of a plan:
export type LotPlan = GSceneryDef & GSceneryPlan;

// Building lots can have any of these types:
export type BuildingLotType = 'building_only' | 'building_fence' | 'enclosed';

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
    private entirelyOnScreen: boolean;

    private constructor(buildingDef?: GSceneryDef) {
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
    public static createFrontBuildingLot(buildingDef: GSceneryDef, room: GRoom, district: GTownDistrict, type?: BuildingLotType): GLot {
        // Create an instance for the lot
        const lot: GLot = new GLot(buildingDef);
        // Determine which type to create (unless it was already supplied)
        if (!type) {
            type = GLot.canBeFenced(buildingDef.key) ?
                RANDOM.randElement(['building_only', 'building_fence', 'enclosed']) :
                'building_only';
        }
        switch (type) {
            case 'building_only':
                // Building-only is pretty simple; unless we decide to add other decorations,
                // it's pretty much already done.
                break;
            case 'building_fence':
                // We'll add a section of fencing after the building
                const fenceSectionStyle: string = GLot.getFenceForBuilding(buildingDef.key, district);
                const segments: number = district.getFenceSpacing();
                const building: LotPlan = lot.buildingPlan!;
                lot.createHorzFenceSection(
                    fenceSectionStyle,
                    segments,
                    building.y + building.body.height,
                    building.x + building.body.width,
                    1
                );
                break;
            case 'enclosed':
                // We'll enclose the building with a fence around the perimeter
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
        return lot;
    }

    /**
     * Create a new lot for a back-facing building (south side, facing north)
     */
    public static createBackBuildingLot(buildingDef: GSceneryDef, room: GRoom, district: GTownDistrict, type?: BuildingLotType): GLot {
        // Create an instance for the lot
        const lot: GLot = new GLot(buildingDef);
        // Determine which type to create (unless it was already supplied)
        if (!type) {
            type = GLot.canBeFenced(buildingDef.key) ?
                RANDOM.randElement(['building_only', 'building_fence', 'enclosed']) :
                'building_only';
        }
        switch (type) {
            case 'building_only':
                // Building-only is pretty simple; unless we decide to add other decorations,
                // it's pretty much already done.
                break;
            case 'building_fence':
                // We'll add a fence section after the building
                const fenceSectionStyle: string = GLot.getFenceForBuilding(buildingDef.key, district);
                const segments: number = district.getFenceSpacing();
                const building: LotPlan = lot.buildingPlan!;
                const fenceSegment: GSceneryDef = SCENERY.def(FENCE_STYLES[fenceSectionStyle].backHorz);
                lot.createHorzFenceSection(
                    fenceSectionStyle,
                    segments,
                    building.y + fenceSegment.body.height,
                    building.x + building.body.width,
                    1
                );
                break;
            case 'enclosed':
                // We'll enclose the building with a fence around the perimeter
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
        return lot;
    }

    /**
     * Create a new lot for a left-facing building (east side, facing west)
     */
    public static createLeftBuildingLot(buildingDef: GSceneryDef, room: GRoom, district: GTownDistrict, type?: BuildingLotType): GLot {
        // Create an instance for the lot
        const lot: GLot = new GLot(buildingDef);
        // Determine which type to create (unless it was already supplied)
        if (!type) {
            type = GLot.canBeFenced(buildingDef.key) ?
                RANDOM.randElement(['building_only', 'building_fence', 'enclosed']) :
                'building_only';
        }
        switch (type) {
            case 'building_only':
                // Building-only is pretty simple; unless we decide to add other decorations,
                // it's pretty much already done.
                break;
            case 'building_fence':
                // We'll add a fence section after the building
                const fenceSectionStyle: string = GLot.getFenceForBuilding(buildingDef.key, district);
                const segments: number = district.getFenceSpacing();
                const building: LotPlan = lot.buildingPlan!;
                const fenceSegment: GSceneryDef = SCENERY.def(FENCE_STYLES[fenceSectionStyle].leftVert);
                lot.createVertFenceSection(
                    fenceSectionStyle,
                    segments,
                    building.x,
                    building.y + building.body.height + fenceSegment.body.height,
                    1,
                    false,
                    true
                );
                break;
            case 'enclosed':
                // We'll enclose the building with a fence around the perimeter
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
        return lot;
    }

    /**
     * Create a new lot for a right-facing building (west side, facing east)
     */
    public static createRightBuildingLot(buildingDef: GSceneryDef, room: GRoom, district: GTownDistrict, type?: BuildingLotType): GLot {
        // Create an instance for the lot
        const lot: GLot = new GLot(buildingDef);
        // Determine which type to create (unless it was already supplied)
        if (!type) {
            type = GLot.canBeFenced(buildingDef.key) ?
                RANDOM.randElement(['building_only', 'building_fence', 'enclosed']) :
                'building_only';
        }
        switch (type) {
            case 'building_only':
                // Building-only is pretty simple; unless we decide to add other decorations,
                // it's pretty much already done.
                break;
            case 'building_fence':
                // We'll add a fence section after the building
                const fenceSectionStyle: string = GLot.getFenceForBuilding(buildingDef.key, district);
                const segments: number = district.getFenceSpacing();
                const building: LotPlan = lot.buildingPlan!;
                const fenceSegment: GSceneryDef = SCENERY.def(FENCE_STYLES[fenceSectionStyle].leftVert);
                lot.createVertFenceSection(
                    fenceSectionStyle,
                    segments,
                    building.x + building.body.width - fenceSegment.body.width,
                    building.y + building.body.height + fenceSegment.body.height,
                    1,
                    true,
                    true
                );
                break;
            case 'enclosed':
                // We'll enclose the building with a fence around the perimeter
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
        return lot;
    }

    public isRequiredToBeWhole(): boolean {
        return this.entirelyOnScreen;
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
        const minX = Math.min(...this.objectPlans.map(obj => obj.x));
        const minY = Math.min(...this.objectPlans.map(obj => obj.y));
        const maxX = Math.max(...this.objectPlans.map(obj => obj.x + obj.body.width));
        const maxY = Math.max(...this.objectPlans.map(obj => obj.y + obj.body.height));

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
        };
        this.objectPlans.push(plan);
        return plan;
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
        let lotWidth: number;
        let lotHeight: number;
        let backyardDepth: number;
        let offsetX: number;
        let offsetY: number;
        switch (facingDirection) {
            case Dir9.S: // Front facing SOUTH (front visible)
                // Backyard depth is whatever is left over after the building, fence gap, and the combined front and back fence heights
                backyardDepth = NS_LOT_HEIGHT - (building.body.height + FENCE_BUILDING_GAP + (hFenceDef.body.height * 2));
                // Fence is placed behind the backyard, which is directly behind the building
                offsetY = building.y - backyardDepth;
                offsetX = -(leftSegments * hFenceDef.body.width);
                lotWidth = (hFenceDef.body.width * (leftSegments + rightSegments)) + building.body.width;
                lotHeight = NS_LOT_HEIGHT;
                break;
            case Dir9.N: // Front facing NORTH (back visible)
                // Fence is placed before the front yard (fence gap)
                offsetY = building.y - (FENCE_BUILDING_GAP + hFenceDef.body.height);
                offsetX = -(rightSegments * hFenceDef.body.width);
                lotWidth = (hFenceDef.body.width * (leftSegments + rightSegments)) + building.body.width;
                lotHeight = NS_LOT_HEIGHT;
                break;
            case Dir9.E: // Front facing EAST (side visible; on the left side of the room)
                // Backyard depth is whatever is left over after the building, fence gap, and the combined side fence widths
                backyardDepth = WE_LOT_WIDTH - (building.body.width + FENCE_BUILDING_GAP + (vFenceDef.body.width * 2));
                // Fence is placed behind the backyard, which is directly behind the building
                offsetX = building.x - backyardDepth;
                offsetY = -(leftSegments * vFenceDef.body.height);
                lotWidth = WE_LOT_WIDTH;
                lotHeight = (vFenceDef.body.height * (leftSegments + rightSegments)) + building.body.height;
                break;
            case Dir9.W: // Front facing WEST (side visible; on the right side of the room)
                // Fence is placed before the front yard (fence gap)
                offsetX = building.x - (FENCE_BUILDING_GAP + vFenceDef.body.width);
                offsetY = -(rightSegments * vFenceDef.body.height);
                lotWidth = WE_LOT_WIDTH;
                lotHeight = (vFenceDef.body.height * (leftSegments + rightSegments)) + building.body.height;
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

        // Create the back fence section
        let horzFenceEnd: number = this.createHorzFenceSection(
            fenceType,
            horizontalSegments,
            offsetY,
            offsetX,
            1,
            true
        );

        // Create the left fence section
        let vertFenceEnd: number = this.createVertFenceSection(
            fenceType,
            verticalSegments,
            offsetX,
            offsetY + hFenceDef.body.height,
            1
        );

        // Create the right fence section
        this.createVertFenceSection(
            fenceType,
            verticalSegments,
            horzFenceEnd - vFenceDef.body.width,
            offsetY + hFenceDef.body.height,
            1,
            true
        );

        // Create the front fence section
        this.createHorzFenceSection(
            fenceType,
            horizontalSegments,
            vertFenceEnd,
            offsetX,
            1
        );
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
}