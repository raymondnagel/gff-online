/**
 * A collection of functions that
 * provide cardinal and diagonal directions.
 *
 * The enum type is Dir9, which includes NONE.
 * Be careful when using all 9 directions, because NONE
 * is an oddball for which some resources or behavior
 * may not necessarily exist! If you want only actual
 * directions, consider using dir8 functions.
 */

import { RANDOM } from "./random";
import { GFF } from "./main";
import { CardDir, CubeDir, Dir9, DirVert, GKeyList, GPoint2D, GPoint3D } from "./types";

export namespace DIRECTION {

    const DIR8_TEXTS = [
        'n',
        'ne',
        'e',
        'se',
        's',
        'sw',
        'w',
        'nw'
    ];

    const DIR8_FULLTEXTS = [
        'north',
        'northeast',
        'east',
        'southeast',
        'south',
        'southwest',
        'west',
        'northwest'
    ];

    const DIR8_VALUES = [
        Dir9.N,
        Dir9.NE,
        Dir9.E,
        Dir9.SE,
        Dir9.S,
        Dir9.SW,
        Dir9.W,
        Dir9.NW
    ];

    const DIR9_TEXTS = [
        '',
        'n',
        'ne',
        'e',
        'se',
        's',
        'sw',
        'w',
        'nw'
    ];

    const DIR9_FULLTEXTS = [
        'here',
        'north',
        'northeast',
        'east',
        'southeast',
        'south',
        'southwest',
        'west',
        'northwest'
    ];

    const DIR9_VALUES = [
        Dir9.NONE,
        Dir9.N,
        Dir9.NE,
        Dir9.E,
        Dir9.SE,
        Dir9.S,
        Dir9.SW,
        Dir9.W,
        Dir9.NW
    ];

    const directionData = [
        [ 0,  0,  0 ], // None
        [ 0, -1,  0 ], // N
        [ 1, -1,  0 ], // NE
        [ 1,  0,  0 ], // E
        [ 1,  1,  0 ], // SE
        [ 0,  1,  0 ], // S
        [-1,  1,  0 ], // SW
        [-1,  0,  0 ], // W
        [-1, -1,  0 ], // NW
        [ 0,  0, -1 ], // Up
        [ 0,  0,  1 ], // Down
    ];

    export const DIAGONAL_MODIFIER: number = .7;

    export function dir8Values() {
        return DIR8_VALUES;
    }

    export function dir8Texts() {
        return DIR8_TEXTS;
    }

    export function dir8FullTexts() {
        return DIR8_FULLTEXTS;
    }

    export function dir9Values() {
        return DIR9_VALUES;
    }

    export function dir9Texts() {
        return DIR9_TEXTS;
    }

    export function dir9FullTexts() {
        return DIR9_FULLTEXTS;
    }

    export function randomCardDir(): CardDir {
        return RANDOM.randElement([
            Dir9.N,
            Dir9.E,
            Dir9.S,
            Dir9.W
        ]);
    }

    export function fromDir8String(dir: 'n'|'ne'|'e'|'se'|'s'|'sw'|'w'|'nw'): Dir9 {
        return DIR8_VALUES[DIR8_TEXTS.indexOf(dir)];
    }

    export function cardDirFrom4(n: 0|1|2|3): CardDir {
        switch (n) {
            case 0:
                return Dir9.N;
            case 1:
                return Dir9.E;
            case 2:
                return Dir9.S;
            case 3:
                return Dir9.W;
        }
    }

    export function cubeDirFrom6(n: 0|1|2|3|4|5): CubeDir {
        switch (n) {
            case 0:
                return Dir9.N;
            case 1:
                return Dir9.E;
            case 2:
                return Dir9.S;
            case 3:
                return Dir9.W;
            case 4:
                return DirVert.UP;
            case 5:
                return DirVert.DOWN;
        }
    }

    export function getDirectionForIncs(xInc: number, yInc: number): Dir9 {
        switch(true) {
            case xInc === 0 && yInc < 0:
                return Dir9.N;
            case xInc > 0 && yInc < 0:
                return Dir9.NE;
            case xInc > 0 && yInc === 0:
                return Dir9.E;
            case xInc > 0 && yInc > 0:
                return Dir9.SE;
            case xInc === 0 && yInc > 0:
                return Dir9.S;
            case xInc < 0 && yInc > 0:
                return Dir9.SW;
            case xInc < 0 && yInc === 0:
                return Dir9.W;
            case xInc < 0 && yInc < 0:
                return Dir9.NW;
            default:
                return Dir9.NONE;
        }
    }

    export function getDirectionForKeys(polledKeys: GKeyList): Dir9 {
        let x = 0, y = 0;
        if (polledKeys['Up'].isDown) {
            y--;
        }
        if (polledKeys['Left'].isDown) {
            x--;
        }
        if (polledKeys['Right'].isDown) {
            x++;
        }
        if (polledKeys['Down'].isDown) {
            y++;
        }
        return getDirectionForIncs(x, y);
    }

    export function getOpposite(direction: Dir9): Dir9 {
        switch (direction) {
            case Dir9.N: return Dir9.S;
            case Dir9.NE: return Dir9.SW;
            case Dir9.E: return Dir9.W;
            case Dir9.SE: return Dir9.NW;
            case Dir9.S: return Dir9.N;
            case Dir9.SW: return Dir9.NE;
            case Dir9.W: return Dir9.E;
            case Dir9.NW: return Dir9.SE;
            default: return Dir9.NONE;
        }
    }

    export function getAdjacents(direction: Dir9): Dir9[] {
        switch (direction) {
            case Dir9.N: return [Dir9.NW, Dir9.NE];
            case Dir9.NE: return [Dir9.N, Dir9.E];
            case Dir9.E: return [Dir9.NE, Dir9.SE];
            case Dir9.SE: return [Dir9.E, Dir9.S];
            case Dir9.S: return [Dir9.SE, Dir9.SW];
            case Dir9.SW: return [Dir9.S, Dir9.W];
            case Dir9.W: return [Dir9.SW, Dir9.NW];
            case Dir9.NW: return [Dir9.W, Dir9.N];
            default: return [Dir9.NONE];
        }
    }

    export function getCardinalAdjacents(direction: CardDir): CardDir[] {
        switch (direction) {
            case Dir9.N: return [Dir9.W, Dir9.E];
            case Dir9.E: return [Dir9.N, Dir9.S];
            case Dir9.S: return [Dir9.E, Dir9.W];
            case Dir9.W: return [Dir9.S, Dir9.N];
        }
    }

    export function turnCw(direction: Dir9): Dir9 {
        switch (direction) {
            case Dir9.N: return Dir9.NE;
            case Dir9.NE: return Dir9.E;
            case Dir9.E: return Dir9.SE;
            case Dir9.SE: return Dir9.S;
            case Dir9.S: return Dir9.SW;
            case Dir9.SW: return Dir9.W;
            case Dir9.W: return Dir9.NW;
            case Dir9.NW: return Dir9.N;
            default: return Dir9.NONE;
        }
    }

    export function turnCcw(direction: Dir9): Dir9 {
        switch (direction) {
            case Dir9.N: return Dir9.NW;
            case Dir9.NW: return Dir9.W;
            case Dir9.W: return Dir9.SW;
            case Dir9.SW: return Dir9.S;
            case Dir9.S: return Dir9.SE;
            case Dir9.SE: return Dir9.E;
            case Dir9.E: return Dir9.NE;
            case Dir9.NE: return Dir9.N;
            default: return Dir9.NONE;
        }
    }

    export function turnCwCardinal(direction: CardDir): CardDir {
        switch (direction) {
            case Dir9.N: return Dir9.E;
            case Dir9.E: return Dir9.S;
            case Dir9.S: return Dir9.W;
            case Dir9.W: return Dir9.N;
        }
    }

    export function turnCcwCardinal(direction: CardDir): CardDir {
        switch (direction) {
            case Dir9.N: return Dir9.W;
            case Dir9.W: return Dir9.S;
            case Dir9.S: return Dir9.E;
            case Dir9.E: return Dir9.N;
        }
    }

    export function getCharPosForEdge(direction: Dir9): number {
        switch (direction) {
            case Dir9.N: return GFF.TOP_BOUND + 1 - GFF.CHAR_BODY_Y_OFF;
            case Dir9.W: return GFF.LEFT_BOUND + 1 - GFF.CHAR_BODY_X_OFF;
            case Dir9.S: return GFF.BOTTOM_BOUND - 1 - GFF.CHAR_BODY_Y_OFF - GFF.CHAR_BODY_H;
            case Dir9.E: return GFF.RIGHT_BOUND - 1 - GFF.CHAR_W + GFF.CHAR_BODY_X_OFF;
            default: return 0;
        }
    }

    export function getXInc(direction: Dir9): number {
        return directionData[direction][0];
    }

    export function getYInc(direction: Dir9): number {
        return directionData[direction][1];
    }

    export function getZInc(direction: Dir9|DirVert): number {
        return directionData[direction][2];
    }

    export function getVelocity(direction: Dir9): GPoint2D {
        return {
            x: directionData[direction][0],
            y: directionData[direction][1]
        };
    }

    export function getVelocity3d(direction: CubeDir): GPoint3D {
        return {
            x: directionData[direction][0],
            y: directionData[direction][1],
            z: directionData[direction][2]
        };
    }

    export function isDiagonal(direction: Dir9): boolean {
        return Math.abs(directionData[direction][0]) + Math.abs(directionData[direction][1]) > 1
    }

    export function getDistanceFactor(direction: Dir9): number {
        return isDiagonal(direction) ? DIAGONAL_MODIFIER : 1.0;
    }

    export function getDirectionOf(ptA: GPoint2D, ptB: GPoint2D): Dir9 {
        const deltaX: number = ptB.x - ptA.x;
        const deltaY: number = ptB.y - ptA.y;

        // Calculate the angle in radians
        const angle: number = Math.atan2(deltaY, deltaX);

        // Convert the angle to degrees
        const degrees: number = angle * (180 / Math.PI);

        // Normalize degrees to a range of 0-360
        const normalizedDegrees: number = (degrees + 360) % 360;

        // Map degrees to Dir9
        if (normalizedDegrees >= 337.5 || normalizedDegrees < 22.5) return Dir9.E;  // East
        if (normalizedDegrees >= 22.5 && normalizedDegrees < 67.5) return Dir9.SE; // Northeast
        if (normalizedDegrees >= 67.5 && normalizedDegrees < 112.5) return Dir9.S;  // North
        if (normalizedDegrees >= 112.5 && normalizedDegrees < 157.5) return Dir9.SW; // Northwest
        if (normalizedDegrees >= 157.5 && normalizedDegrees < 202.5) return Dir9.W;  // West
        if (normalizedDegrees >= 202.5 && normalizedDegrees < 247.5) return Dir9.NW; // Southwest
        if (normalizedDegrees >= 247.5 && normalizedDegrees < 292.5) return Dir9.N;  // South
        if (normalizedDegrees >= 292.5 && normalizedDegrees < 337.5) return Dir9.NE; // Southeast

        return Dir9.NONE; // Default case, shouldn't normally hit here
    }

    export function getPointDistanceFrom(origin: GPoint2D, dir: Dir9, distance: number): GPoint2D {
        const xInc: number = getXInc(dir) * distance;
        const yInc: number = getYInc(dir) * distance;
        return {
            x: origin.x + xInc,
            y: origin.y + yInc
        };
    }
}