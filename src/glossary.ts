import { GFF } from "./main";
import { GGlossaryEntry } from "./types";

export namespace GLOSSARY {

    let entries: GGlossaryEntry[];

    function loadEntries() {
        entries = GFF.GAME.cache.json.get('glossary_info');
        entries = entries.sort((a, b) => a.index.localeCompare(b.index, 'en', {
            sensitivity: 'base',
            numeric: true
        }));
    }

    export function lookupEntry(name: string): GGlossaryEntry|undefined {
        if (entries === undefined) {
            loadEntries();
        }
        return entries.find(entry => entry.name === name);
    }

    export function getAllEntries(): GGlossaryEntry[] {
        if (entries === undefined) {
            loadEntries();
        }
        return entries;
    }
}