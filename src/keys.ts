import { RANDOM } from "./random";

const allKeyVerses: string[] = [
    "John 1:1",
    "John 1:14",
    "John 3:16",
    "John 13:35",
    "Acts 4:12",
    "Matthew 5:16",
    "Matthew 6:33",
    "Mark 10:45",
    "Acts 16:31",
    "Romans 6:23",
    "Romans 8:28",
    "Romans 10:9",
    "2 Corinthians 5:17",
    "1 Corinthians 13:13",
    "Ephesians 2:8",
    "Philippians 4:13",
    "Colossians 3:2",
    "2 Timothy 1:7",
    "Hebrews 4:12",
    "Hebrews 11:6",
    "James 1:22",
    "1 Peter 5:7",
    "2 Peter 3:9",
    "1 John 1:9",
    "1 John 4:7",
    "2 John 1:6",
    "Revelation 21:4",
];

export namespace KEYS {

    const playerKeys: string[] = [];

    export function initKeys() {
        RANDOM.shuffle(allKeyVerses);
    }

    export function getObtainedCount(): number {
        return playerKeys.length;
    }

    export function obtainKey(ref: string) {
        playerKeys.push(ref);
    }

    export function hasKey(ref: string): boolean {
        return playerKeys.includes(ref);
    }

    export function useKey(ref: string) {
        playerKeys.splice(playerKeys.indexOf(ref), 1);
    }

    /**
     * There will be at least 100 key verses.
     * Each of the 5 strongholds might have 5-10 keys/locks;
     * so we will never run out of keys.
     */
    export function getNextKeyToFind(): string {
        const key: string = allKeyVerses.pop() as string;
        return key;
    }
}