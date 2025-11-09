import { BIBLE } from "./bible";
import { RANDOM } from "./random";

const allKeyVerses: string[] = [
    "Matthew 5:16",
    "Matthew 6:33",
    "Matthew 11:28",
    "Matthew 16:26",
    "Mark 10:45",
    "John 1:1",
    "John 1:12",
    "John 1:14",
    "John 3:16",
    "John 5:24",
    "John 11:25",
    "John 13:35",
    "John 14:6",
    "Acts 4:12",
    "Acts 16:31",
    "Romans 1:20",
    "Romans 3:23",
    "Romans 5:8",
    "Romans 6:23",
    "Romans 8:28",
    "Romans 10:9",
    "Romans 10:10",
    "1 Corinthians 13:13",
    "2 Corinthians 5:17",
    "Galatians 2:16",
    "Galatians 2:20",
    "Galatians 3:11",
    "Galatians 5:16",
    "Ephesians 1:13",
    "Ephesians 2:8",
    "Ephesians 2:10",
    "Philippians 4:8",
    "Philippians 4:13",
    "Colossians 3:2",
    "1 Thessalonians 5:18",
    "1 Thessalonians 5:23",
    "1 Timothy 1:15",
    "1 Timothy 2:5",
    "2 Timothy 1:7",
    "2 Timothy 2:15",
    "2 Timothy 3:16",
    "Titus 3:5",
    "Hebrews 2:3",
    "Hebrews 4:12",
    "Hebrews 11:6",
    "James 1:22",
    "1 Peter 1:23",
    "1 Peter 3:15",
    "1 Peter 5:7",
    "2 Peter 3:9",
    "1 John 1:9",
    "1 John 4:7",
    "2 John 1:6",
    "Revelation 21:4",
];

export namespace KEYS {

    export function initKeys() {
        RANDOM.shuffle(allKeyVerses);
    }

    /**
     * There will be at least 100 key verses.
     * Each of the 5 strongholds might have 5-10 keys/locks;
     * so we will never run out of keys.
     */
    export function getNextKeyVerse(): string {
        const key: string = allKeyVerses.pop() as string;
        console.log(`Got key verse: ${key}, remaining: ${allKeyVerses.length}`);
        return key;
    }
}