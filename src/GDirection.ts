/**
 * GDirection is an enum and collection of functions that
 * provide cardinal and diagonal directions for GCharSprites.
 *
 * The enum is Dir9, which includes NONE.
 * Be careful when using all 9 directions, because NONE
 * is an oddball for which some resources or behavior
 * may not necessarily exist! If you want only actual
 * directions, consider using dir8 functions.
 */

import { GRandom } from "./GRandom";
import { GFF } from "./main";
import { CardDir, GKeyList, GPoint } from "./types";

export namespace GDirection {

    export enum Dir9 {
        NONE = 0,
        N    = 1,
        NE   = 2,
        E    = 3,
        SE   = 4,
        S    = 5,
        SW   = 6,
        W    = 7,
        NW   = 8
    };

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
        [ 0,  0 ],
        [ 0, -1 ],
        [ 1, -1 ],
        [ 1,  0 ],
        [ 1,  1 ],
        [ 0,  1 ],
        [-1,  1 ],
        [-1,  0 ],
        [-1, -1 ]
    ];

    export const DIAGONAL_MODIFIER: number = .7;

    export function dir8Values() {
        return DIR8_VALUES;
    }

    export function dir8Texts() {
        return DIR8_TEXTS;
    }

    export function dir9Values() {
        return DIR9_VALUES;
    }

    export function dir9Texts() {
        return DIR9_TEXTS;
    }

    export function randomCardDir(): CardDir {
        return GRandom.randElement([
            Dir9.N,
            Dir9.E,
            Dir9.S,
            Dir9.W
        ]);
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

    export function getDirectionForIncs(xInc: number, yInc: number) {
        switch(true) {
            case xInc === 0 && yInc === -1:
                return Dir9.N;
            case xInc === 1 && yInc === -1:
                return Dir9.NE;
            case xInc === 1 && yInc === 0:
                return Dir9.E;
            case xInc === 1 && yInc === 1:
                return Dir9.SE;
            case xInc === 0 && yInc === 1:
                return Dir9.S;
            case xInc === -1 && yInc === 1:
                return Dir9.SW;
            case xInc === -1 && yInc === 0:
                return Dir9.W;
            case xInc === -1 && yInc === -1:
                return Dir9.NW;
            default:
                return Dir9.NONE;
        }
    }

    export function getDirectionForKeys(polledKeys: GKeyList): GDirection.Dir9 {
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

    export function getCharPosForEdge(direction: Dir9): number {
        switch (direction) {
            case Dir9.N: return GFF.TOP_BOUND + 1 - GFF.CHAR_BODY_Y_OFF;
            case Dir9.W: return GFF.LEFT_BOUND + 1 - GFF.CHAR_BODY_X_OFF;
            case Dir9.S: return GFF.BOTTOM_BOUND - 1 - GFF.CHAR_BODY_Y_OFF - GFF.CHAR_BODY_H;
            case Dir9.E: return GFF.RIGHT_BOUND - 1 - GFF.CHAR_W + GFF.CHAR_BODY_X_OFF;
            default: return 0;
        }
    }

    export function getHorzInc(direction: Dir9): number {
        return directionData[direction][0];
    }

    export function getVertInc(direction: Dir9): number {
        return directionData[direction][1];
    }

    export function getVelocity(direction: Dir9): GPoint {
        return {
            x: directionData[direction][0],
            y: directionData[direction][1]
        };
    }

    export function isDiagonal(direction: Dir9): boolean {
        return Math.abs(directionData[direction][0]) + Math.abs(directionData[direction][1]) > 1
    }

    export function getDistanceFactor(direction: Dir9): number {
        return isDiagonal(direction) ? DIAGONAL_MODIFIER : 1.0;
    }

    export function getDirectionOf(ptA: GPoint, ptB: GPoint): Dir9 {
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
}