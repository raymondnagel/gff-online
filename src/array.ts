/**
 * Collection of functions that make it easier
 * to work with arrays.
 */
export namespace ARRAY {

    export function removeObject<T>(item: T, arr: T[]): T|undefined {
        const index = arr.indexOf(item);
        return removeAt(index, arr);
    }

    export function removeAt<T>(index: number, arr: T[]): T|undefined {
        if (index < 0 || index >= arr.length) return undefined;
        const lastIndex = arr.length - 1;
        if (index !== lastIndex) {
            [arr[index], arr[lastIndex]] = [arr[lastIndex], arr[index]];
        }
        return arr.pop();
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