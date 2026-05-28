/**
 * Collection of functions that simplify logical operations.
 */
export namespace LOGIC {

    export function triValue(value: number, comp: number, less: number, equal: number, greater: number): number {
        if (value < comp) {
            return less;
        } else if (value === comp) {
            return equal;
        } else {
            return greater;
        }
    }

}