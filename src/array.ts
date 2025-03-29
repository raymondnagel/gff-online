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
}