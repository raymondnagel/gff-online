/**
 * Collection of functions that make it easier
 * to work with strings.
 */
export namespace STRING {

    export function capitalize(str: string): string {
        if (str.length === 0) return str;
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    export function toTitleCase(str: string): string {
        return str.replace(/\w\S*/g, (txt) => {
            return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
        });
    }
}