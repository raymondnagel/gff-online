import { TEN } from "./types";

/**
 * Collection of functions that make it easier
 * to work with numbers.
 */
export namespace NUMBER {

    export function toString(num: TEN|0, zeroText: string = 'zero'): string {
        switch (num) {
            case 0: return zeroText;
            case 1: return 'one';
            case 2: return 'two';
            case 3: return 'three';
            case 4: return 'four';
            case 5: return 'five';
            case 6: return 'six';
            case 7: return 'seven';
            case 8: return 'eight';
            case 9: return 'nine';
            case 10: return 'ten';
        }
    }
}