/**
 * Collection of functions that make it easier
 * to work with arrays.
 */
export namespace ARRAY {

    export function removeIfExistsIn(object: any, array: any[]): any|undefined {
        const index: number = array.indexOf(object);
        if (index !== -1) {
            return array.splice(index, 1);
        }
        return undefined;
    }

    export function copy<T>(array: T[]): T[] {
        return array.slice();
    }

    export function swap<T>(array: T[], indexA: number, indexB: number): void {
        const temp: T = array[indexA];
        array[indexA] = array[indexB];
        array[indexB] = temp;
    }
}