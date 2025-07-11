import { GFF } from "./main";

/**
 * The REGISTRY namespace provides a simple interface to the game's registry.
 * REGISTRY.set() is more convenient than GFF.GAME.registry.set()
 */
export namespace REGISTRY {

    /**
     * Initializes the registry with some default values.
     * Don't put anything in here that will be set by new game options.
     */
    export function init(): void {
        REGISTRY.set('skipIntro', 0);
    }

    export function get(key: string): any {
        return GFF.GAME.registry.get(key);
    }

    export function getOrDefault(key: string, defaultValue: any): any {
        if (GFF.GAME.registry.has(key)) {
            return GFF.GAME.registry.get(key);
        } else {
            GFF.GAME.registry.set(key, defaultValue);
            return defaultValue;
        }
    }

    export function getString(key: string): string {
        return GFF.GAME.registry.get(key) as string;
    }

    export function getNumber(key: string): number {
        return GFF.GAME.registry.get(key) as number;
    }

    export function getBoolean(key: string): boolean {
        return GFF.GAME.registry.get(key) ?? false as boolean;
    }

    export function has(key: string): boolean {
        return GFF.GAME.registry.has(key);
    }

    export function set(key: string, value: any): void {
        GFF.GAME.registry.set(key, value);
    }

    export function remove(key: string): void {
        GFF.GAME.registry.remove(key);
    }

}