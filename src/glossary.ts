import { GFF } from "./main";
import { GGlossaryEntry } from "./types";

export namespace GLOSSARY {

    let entries: GGlossaryEntry[];

    export function lookupEntry(name: string): GGlossaryEntry|undefined {
        if (entries === undefined) {
            entries = GFF.GAME.cache.json.get('glossary_info');
        }
        return entries.find(entry => entry.name === name);
    }
}