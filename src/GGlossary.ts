import { GFF } from "./main";
import { GGlossaryEntry } from "./types";

export class GGlossary {

    private static entries: GGlossaryEntry[];

    public static lookupEntry(name: string): GGlossaryEntry|undefined {
        if (this.entries === undefined) {
            this.entries = GFF.GAME.cache.json.get('glossary_text');
        }
        return this.entries.find(entry => entry.name === name);
    }
}