import { GStrongholdArea } from "../areas/GStrongholdArea";
import { GRoom } from "../GRoom";
import { GFF } from "../main";
import { RANDOM } from "../random";
import { SCENERY } from "../scenery";
import { Dir9, GDoorways, GInteriorWallPiece, GInteriorWallSet, GPoint2D, GSceneryDef } from "../types";
import { GInsideRegion } from "./GInsideRegion";

const WALLS: GInteriorWallSet = {
    n_left: 'hold_wall_n_left',
    n_right: 'hold_wall_n_right',
    n_mid: 'hold_wall_n_mid',
    n_door_lower: 'hold_wall_n_door_lower',
    n_door_upper: 'hold_wall_n_door_upper',
    s_left: 'hold_wall_s_left',
    s_right: 'hold_wall_s_right',
    s_mid: 'hold_wall_s_mid',
    s_door: 'hold_wall_s_door',
    e_top: 'hold_wall_e_top',
    e_bottom: 'hold_wall_e_bottom',
    e_mid: 'hold_wall_e_mid',
    e_door_lower: 'hold_wall_e_door_lower',
    e_door_upper: 'hold_wall_e_door_upper',
    w_top: 'hold_wall_w_top',
    w_bottom: 'hold_wall_w_bottom',
    w_mid: 'hold_wall_w_mid',
    w_door_lower: 'hold_wall_w_door_lower',
    w_door_upper: 'hold_wall_w_door_upper',
    ne_corner: 'hold_wall_ne_corner',
    nw_corner: 'hold_wall_nw_corner',
    se_corner: 'hold_wall_se_corner',
    sw_corner: 'hold_wall_sw_corner',
};

const ROOM_TILE_W: number = 14;
const ROOM_TILE_H: number = 9;

const NONE_C     = '0,0,0';     // Nothing
const WALL_C     = '1,1,1';     // Wall block
const CHASM_C    = '0,0,1';     // Any chasm tile (e.g. lava, abyss)
const ORNAMENT_C = '0,1,0';     // Any ornamental scenery [centered] (e.g., obelisk, torch, statue)
const TRAP_C     = '1,0,0';     // Hidden trap
const BRIDGE_C   = '0,1,1';     // Any bridge tile (e.g. bridge, grate)
const BONES_C    = '1,1,0';     // Bone pile
const WEB_C      = '1,0,1';     // Cobweb

// Plans a tile scenery and marks the tile as obstructed or not in the tile matrix.
// If mirrorX and/or mirrorY are true, also mirrors the placement across the respective axis.
// Aborts if the tile is a doorway or already in the desired state.
function planTile(
    room: GRoom,
    tileMatrix: boolean[][],
    sceneryKey: string,
    x: number,
    y: number,
    centered: boolean,
    obstacle: boolean,
    avoidDoorways: boolean,
    mirrorX: boolean = false,
    mirrorY: boolean = false
): void {
    if (
        (obstacle && tileMatrix[y][x])
        || (avoidDoorways && isDoorway(x, y, room.getDoorways()))
    ) {
        return;
    }

    room.planTileScenery(sceneryKey, 1 + x, 1 + y, centered);
    tileMatrix[y][x] = obstacle;

    // If mirrorX, copy to mirrored X position
    if (mirrorX && x < 7) {
        const mx = ROOM_TILE_W - 1 - x;
        planTile(room, tileMatrix, sceneryKey, mx, y, centered, obstacle, avoidDoorways);
    }
    // If mirrorY, copy to mirrored Y position
    if (mirrorY && y < 4) {
        const my = ROOM_TILE_H - 1 - y;
        planTile(room, tileMatrix, sceneryKey, x, my, centered, obstacle, avoidDoorways);
    }
    // If both mirrorX and mirrorY, copy to diagonally mirrored position
    if (mirrorX && mirrorY && x < 7 && y < 4) {
        const mx = ROOM_TILE_W - 1 - x;
        const my = ROOM_TILE_H - 1 - y;
        planTile(room, tileMatrix, sceneryKey, mx, my, centered, obstacle, avoidDoorways);
    }
}

function createRect(
    room: GRoom,
    tileMatrix: boolean[][],
    sceneryKey: string,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    centered: boolean,
    obstacle: boolean,
    avoidDoorways: boolean
): void {
    for (let tx = x1; tx <= x2; tx++) {
        for (let ty = y1; ty <= y2; ty++) {
            planTile(room, tileMatrix, sceneryKey, tx, ty, centered, obstacle, avoidDoorways);
        }
    }
}

function isDoorway(x: number, y: number, doorways: GDoorways): boolean {
    // North doorway
    if (y === 0 && (x === 6 || x === 7) && doorways[Dir9.N]) {
        return true;
    }
    // South doorway
    if (y === 8 && (x === 6 || x === 7) && doorways[Dir9.S]) {
        return true;
    }
    // West doorway
    if (y === 4 && x === 0 && doorways[Dir9.W]) {
        return true;
    }
    // East doorway
    if (y === 4 && x === 13 && doorways[Dir9.E]) {
        return true;
    }
    return false;
}

// Checks whether all doorway tiles are connected in the tile matrix
function isConnected(tileMatrix: boolean[][], doorways: GDoorways): boolean {
    const starts: GPoint2D[] = [];

    // Collect all reachable doorway tiles
    if (doorways[Dir9.N]) {
        if (!tileMatrix[0][6]) starts.push({ x: 6, y: 0 });
        if (!tileMatrix[0][7]) starts.push({ x: 7, y: 0 });
    }
    if (doorways[Dir9.S]) {
        if (!tileMatrix[8][6]) starts.push({ x: 6, y: 8 });
        if (!tileMatrix[8][7]) starts.push({ x: 7, y: 8 });
    }
    if (doorways[Dir9.W]) {
        if (!tileMatrix[4][0]) starts.push({ x: 0, y: 4 });
    }
    if (doorways[Dir9.E]) {
        if (!tileMatrix[4][13]) starts.push({ x: 13, y: 4 });
    }

    // If there are 0 or 1 unblocked door tiles, trivially true
    if (starts.length <= 1) return true;

    // BFS from the first doorway
    const queue: GPoint2D[] = [starts[0]];
    const visited = new Set<string>();
    visited.add(`${starts[0].x},${starts[0].y}`);

    while (queue.length > 0) {
        const { x, y } = queue.shift()!;

        const neighbors = [
        { x, y: y - 1 },
        { x, y: y + 1 },
        { x: x - 1, y },
        { x: x + 1, y },
        ];

        for (const n of neighbors) {
        if (
            n.x >= 0 &&
            n.x < ROOM_TILE_W &&
            n.y >= 0 &&
            n.y < ROOM_TILE_H &&
            !tileMatrix[n.y][n.x]
        ) {
            const key = `${n.x},${n.y}`;
            if (!visited.has(key)) {
            visited.add(key);
            queue.push(n);
            }
        }
        }
    }

    // All door tiles must be visited
    return starts.every(p => visited.has(`${p.x},${p.y}`));
}

type RoomSceneryGenerator = (room: GRoom, area: GStrongholdArea, doorways: GDoorways, tileMatrix: boolean[][]) => boolean;

const RANDOM_GEN: RoomSceneryGenerator = (room: GRoom, _area: GStrongholdArea, doorways: GDoorways, tileMatrix: boolean[][]): boolean => {
    GFF.genLog('Creating room with RANDOM_GEN generator...');
    const sceneryKey: string = RANDOM.randElement(['bone_pile']);
    const count: number = RANDOM.randInt(1, 10);
    for (let i = 0; i < count; i++) {
        const x = RANDOM.randInt(0, 13);
        const y = RANDOM.randInt(0, 8);
        planTile(room, tileMatrix, sceneryKey, x, y, true, true, true);
    }
    return isConnected(tileMatrix, doorways);
}

const HORZ_SYM_GEN: RoomSceneryGenerator = (room: GRoom, _area: GStrongholdArea, doorways: GDoorways, tileMatrix: boolean[][]): boolean => {
    GFF.genLog('Creating room with HORZ_SYM_GEN generator...');
    const sceneryKey: string = RANDOM.randElement(['wall_block']);
    const count: number = RANDOM.randInt(1, 10);
    for (let i = 0; i < count; i++) {
        const x = RANDOM.randInt(0, 6);
        const y = RANDOM.randInt(0, 8);
        planTile(room, tileMatrix, sceneryKey, x, y, false, true, true, true, false);
    }
    return isConnected(tileMatrix, doorways);
}

const VERT_SYM_GEN: RoomSceneryGenerator = (room: GRoom, _area: GStrongholdArea, doorways: GDoorways, tileMatrix: boolean[][]): boolean => {
    GFF.genLog('Creating room with VERT_SYM_GEN generator...');
    const sceneryKey: string = RANDOM.randElement(['wall_block']);
    const count: number = RANDOM.randInt(1, 10);
    for (let i = 0; i < count; i++) {
        const x = RANDOM.randInt(0, 13);
        const y = RANDOM.randInt(0, 4);
        planTile(room, tileMatrix, sceneryKey, x, y, false, true, true, false, true);
    }
    return isConnected(tileMatrix, doorways);
}

const FULL_SYM_GEN: RoomSceneryGenerator = (room: GRoom, _area: GStrongholdArea, doorways: GDoorways, tileMatrix: boolean[][]): boolean => {
    GFF.genLog('Creating room with FULL_SYM_GEN generator...');
    const sceneryKey: string = RANDOM.randElement(['wall_block']);
    const count: number = RANDOM.randInt(1, 3);
    for (let i = 0; i < count; i++) {
        const x = RANDOM.randInt(0, 6);
        const y = RANDOM.randInt(0, 4);
        planTile(room, tileMatrix, sceneryKey, x, y, false, true, true, true, true);
    }
    return isConnected(tileMatrix, doorways);
}

const BRIDGE_GEN: RoomSceneryGenerator = (room: GRoom, _area: GStrongholdArea, doorways: GDoorways, tileMatrix: boolean[][]): boolean => {
    GFF.genLog('Creating room with BRIDGE_GEN generator...');

    const chasmSet = RANDOM.randElement([
        {chasm: 'lava', bridge: 'grated_lava'},
        {chasm: 'abyss', bridge: 'grated_abyss'},
    ]) as {chasm: string, bridge: string};

    // Which bridges we create depends on which doorways exist:
    if (doorways[Dir9.N]) {
        createRect(room, tileMatrix, chasmSet.bridge, 6, 0, 7, 4, false, true, false);
    }
    if (doorways[Dir9.S]) {
        createRect(room, tileMatrix, chasmSet.bridge, 6, 4, 7, 8, false, true, false);
    }
    if (doorways[Dir9.W]) {
        createRect(room, tileMatrix, chasmSet.bridge, 0, 4, 7, 4, false, true, false);
    }
    if (doorways[Dir9.E]) {
        createRect(room, tileMatrix, chasmSet.bridge, 6, 4, 13, 4, false, true, false);
    }
    // Fill in the rest with lava:
    for (let x = 0; x < ROOM_TILE_W; x++) {
        for (let y = 0; y < ROOM_TILE_H; y++) {
            planTile(room, tileMatrix, chasmSet.chasm, x, y, false, true, false);
        }
    }

    // Bridges are marked as obstacles in the tile matrix so we can fill around them.
    // We don't care about checking connections, because there is no randomness.
    return true;
}

const MAZE_GEN: RoomSceneryGenerator = (_room: GRoom, _area: GStrongholdArea, doorways: GDoorways, tileMatrix: boolean[][]): boolean => {
    GFF.genLog('Creating room with MAZE_GEN generator...');
    return isConnected(tileMatrix, doorways);
}

const ROOM_SCENERY_GENERATORS: RoomSceneryGenerator[] = [
    RANDOM_GEN,
    HORZ_SYM_GEN,
    // VERT_SYM_GEN, // Vertical symmetry just doesn't look good
    FULL_SYM_GEN,
    BRIDGE_GEN,
    // MAZE_GEN,
];


export abstract class GStrongholdRegion extends GInsideRegion {

    private static roomPatternContext: CanvasRenderingContext2D;

    constructor(){
        super(
            'Stronghold',
            'stronghold_bg',
            'stronghold_enc_bg',
            'map_floor'
        );

        // Initialize the room pattern canvas context if not already done; we'll reuse it for each room pattern:
        if (!GStrongholdRegion.roomPatternContext) {
            GStrongholdRegion.roomPatternContext = (GFF.GAME.textures.createCanvas('roomPatternCanvas', ROOM_TILE_W, ROOM_TILE_H) as Phaser.Textures.CanvasTexture).getContext();
        }
    }

    public getWallPiece(key: GInteriorWallPiece): GSceneryDef|undefined {
        const defKey: string|undefined = WALLS[key as keyof GInteriorWallSet];
        return defKey ? SCENERY.def(defKey) : undefined;
    }

    public getTemperature(): number {
        return 15; // Strongholds are generally cool.
    }

    protected _furnishRoom(room: GRoom) {
        const portalRoom = room.getPortalRoom();

        // Some rooms are already furnished, so skip them
        if (
            room.hasPremiumChest()
            || room.isProphetChamber()
            || room.getPrisoner() !== undefined
        ) {
            return;
        }

        // Furnish entrance room specially
        if (room === (room.getArea() as GStrongholdArea).getEntranceRoom()) {
            this.furnishEntranceRoom(room);
            return;
        }

        // Determine whether this room has a staircase (portal within same area)
        if (portalRoom && room.getArea() === portalRoom.getArea()) {
            if (room.getFloor() < portalRoom.getFloor()) {
                // Stairs up:
                this.furnishStairsRoom(room, 'stairs_up');
            } else {
                // Stairs down:
                this.furnishStairsRoom(room, 'stairs_down');
            }
            return;
        }

        // Test chasm room pattern:
        // this.furnishFromPatternFile(room, 'rpt_0', GStrongholdRegion.roomPatternContext); return;

        /**
         * We want multiple options for furnishing stronghold rooms:
         * - generated using a variety of algorithms (randomness makes each room unique)
         * - patterns loaded from files (allows handcrafted, more complex designs)
         */

        // 50% chance to furnish from a random pattern file:
        if (RANDOM.flipCoin()) {
            this.furnishFromRandomPatternFile(room);
        } else {
            // Otherwise, pick a random scenery generator:
            const doorways = room.getDoorways();
            let successful: boolean = false;

            while (!successful) {
                const generator = RANDOM.randElement(ROOM_SCENERY_GENERATORS) as RoomSceneryGenerator;
                const tileMatrix = GStrongholdRegion.createTileMatrix();
                successful = generator(room, room.getArea() as GStrongholdArea, doorways, tileMatrix);
                if (!successful) {
                    // Clear any planned scenery and try again
                    GFF.genLog('Stronghold room scenery generation failed; retrying...', true);
                    room.clearSceneryPlans();
                }
            }
        }


    }

    protected furnishFromRandomPatternFile(room: GRoom) {
        const patternKeys: String[] = GFF.GAME.textures.getTextureKeys().filter(entry => entry.startsWith('rpt_'));
        const patternKey: string = RANDOM.randElement(patternKeys) as string;
        this.furnishFromPatternFile(room, patternKey, GStrongholdRegion.roomPatternContext);
    }

    /**
     * Reads a room pattern from a file and furnishes the room accordingly.
     * We'll still track a tile matrix so we can use planTile() to avoid
     * doorways and check for neighboring obstacles.
     */
    protected furnishFromPatternFile(room: GRoom, roomPatternKey: string, ctx: CanvasRenderingContext2D) {
        const tileMatrix = GStrongholdRegion.createTileMatrix();
        const img = GFF.GAME.textures.get(roomPatternKey).getSourceImage() as HTMLImageElement;
        ctx.clearRect(0, 0, ROOM_TILE_W, ROOM_TILE_H);
        ctx.drawImage(img, 0, 0);

        // Before planning a tile for each pixel, we need to know which scenery to use for each type:
        const wallKey = this.getAllowedWallKey();
        const ornamentKey = this.getAllowedOrnamentKey();
        const chasmKey = this.getAllowedChasmKey();
        const bridgeKey = this.getAllowedBridgeKey();

        for (let y = 0; y < ROOM_TILE_H; y++) {
                for (let x = 0; x < ROOM_TILE_W; x++) {
                const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
                const key = `${r > 100 ? 1 : 0},${g > 100 ? 1 : 0},${b > 100 ? 1 : 0}`;
                // console.log(`Pixel at (${x},${y},${floorIndex}): ${key}`);
                switch (key) {
                    case NONE_C:
                        break;
                    case WALL_C:
                        planTile(room, tileMatrix, wallKey, x, y, false, true, true);
                        break;
                    case CHASM_C:
                        planTile(room, tileMatrix, chasmKey, x, y, false, true, true);
                        break;
                    case ORNAMENT_C:
                        planTile(room, tileMatrix, ornamentKey, x, y, true, true, true);
                        break;
                    case TRAP_C:
                        planTile(room, tileMatrix, 'hidden_trap', x, y, false, false, false);
                        break;
                    case BRIDGE_C:
                        planTile(room, tileMatrix, bridgeKey, x, y, false, false, false);
                        break;
                    case BONES_C:
                        planTile(room, tileMatrix, 'bone_pile', x, y, true, true, true);
                        break;
                    case WEB_C:
                        // For cobwebs, determine if there's an obstacle to the left or right:
                        const leftObstacle = (x > 0) ? tileMatrix[y][x - 1] : true;
                        const rightObstacle = (x < ROOM_TILE_W - 1) ? tileMatrix[y][x + 1] : true;
                        if (rightObstacle && !leftObstacle) {
                            planTile(room, tileMatrix, 'cobweb_e', x, y, false, false, false);
                        } else {
                            planTile(room, tileMatrix, 'cobweb_w', x, y, false, false, false);
                        }
                        break;
                }
            }
        }
    }

    /**
     * These functions can be overridden by subclasses to allow different
     * scenery sets for each class (wall, ornamental, etc.) by stronghold.
     */
    protected getAllowedWallKey(): string {
        return 'wall_block';
    }
    protected getAllowedOrnamentKey(): string {
        return RANDOM.randElement(['obelisk', 'torch_base', 'devil_statue']) as string;
    }
    protected getAllowedChasmKey(): string {
        return RANDOM.randElement(['lava', 'abyss']) as string;
    }
    protected getAllowedBridgeKey(): string {
        return 'grated_lava';
    }

    protected furnishEntranceRoom(room: GRoom): void {
        // Place an entrance mat in the center of the room:
        room.planPositionedScenery(SCENERY.def('entrance_mat'), 512, 608, .5, 1);
        // Place torches on either side of the entrance mat:
        room.planTileScenery('torch_base', 5, 8, true);
        room.planTileScenery('torch_base', 10, 8, true);
    }

    /**
     * Strongholds can override this to furnish stair rooms differently.
     * (This is especially useful for the Tower stronghold, which contains
     * "false" up staircases that actually go down.)
     */
    protected furnishStairsRoom(room: GRoom, stairsKey: string): void {
        room.planPositionedScenery(SCENERY.def(stairsKey), 512, 352, .5, .5);
    }

    private static createTileMatrix(): boolean[][] {
        const matrix: boolean[][] = Array.from({ length: 9 }, () =>
            Array.from({ length: 14 }, () => false)
        );
        return matrix;
    }

}
