import { BOOKS } from "./books";
import { GBookEntry } from "./types";

export type IntegerStatName =
| 'RoomsExplored'
| 'FlightsTaken'
| 'ServicesAttended'
| 'SongsPlayed'
| 'PeopleMet'
| 'CaptivesRescued'
| 'SoulsConverted'
| 'SeedsPlanted'
| 'SermonsPreached'
| 'StandardsRaised'
| 'KeyVersesUsed'
| 'ChestsOpened'
| 'Battles'
| 'Hits'
| 'CriticalHits'
| 'Misses'
| 'HighestScore'
| 'Victories'
| 'Defeats'
| 'TimeStarted'
| 'Hit_Gen'
| 'Hit_Ex'
| 'Hit_Lev'
| 'Hit_Num'
| 'Hit_Deu'
| 'Hit_Jos'
| 'Hit_Jdg'
| 'Hit_Rth'
| 'Hit_1Sa'
| 'Hit_2Sa'
| 'Hit_1Ki'
| 'Hit_2Ki'
| 'Hit_1Ch'
| 'Hit_2Ch'
| 'Hit_Ezr'
| 'Hit_Neh'
| 'Hit_Est'
| 'Hit_Job'
| 'Hit_Psa'
| 'Hit_Prv'
| 'Hit_Ecc'
| 'Hit_Sos'
| 'Hit_Isa'
| 'Hit_Jer'
| 'Hit_Lam'
| 'Hit_Eze'
| 'Hit_Dan'
| 'Hit_Hos'
| 'Hit_Joe'
| 'Hit_Amo'
| 'Hit_Obd'
| 'Hit_Jon'
| 'Hit_Mic'
| 'Hit_Nah'
| 'Hit_Hab'
| 'Hit_Zep'
| 'Hit_Hag'
| 'Hit_Zec'
| 'Hit_Mal'
| 'Hit_Mat'
| 'Hit_Mrk'
| 'Hit_Luk'
| 'Hit_Jn'
| 'Hit_Act'
| 'Hit_Rom'
| 'Hit_1Co'
| 'Hit_2Co'
| 'Hit_Gal'
| 'Hit_Eph'
| 'Hit_Php'
| 'Hit_Col'
| 'Hit_1Th'
| 'Hit_2Th'
| 'Hit_1Ti'
| 'Hit_2Ti'
| 'Hit_Tit'
| 'Hit_Phm'
| 'Hit_Heb'
| 'Hit_Jam'
| 'Hit_1Pe'
| 'Hit_2Pe'
| 'Hit_1Jn'
| 'Hit_2Jn'
| 'Hit_3Jn'
| 'Hit_Jud'
| 'Hit_Rev'
| 'Miss_Gen'
| 'Miss_Ex'
| 'Miss_Lev'
| 'Miss_Num'
| 'Miss_Deu'
| 'Miss_Jos'
| 'Miss_Jdg'
| 'Miss_Rth'
| 'Miss_1Sa'
| 'Miss_2Sa'
| 'Miss_1Ki'
| 'Miss_2Ki'
| 'Miss_1Ch'
| 'Miss_2Ch'
| 'Miss_Ezr'
| 'Miss_Neh'
| 'Miss_Est'
| 'Miss_Job'
| 'Miss_Psa'
| 'Miss_Prv'
| 'Miss_Ecc'
| 'Miss_Sos'
| 'Miss_Isa'
| 'Miss_Jer'
| 'Miss_Lam'
| 'Miss_Eze'
| 'Miss_Dan'
| 'Miss_Hos'
| 'Miss_Joe'
| 'Miss_Amo'
| 'Miss_Obd'
| 'Miss_Jon'
| 'Miss_Mic'
| 'Miss_Nah'
| 'Miss_Hab'
| 'Miss_Zep'
| 'Miss_Hag'
| 'Miss_Zec'
| 'Miss_Mal'
| 'Miss_Mat'
| 'Miss_Mrk'
| 'Miss_Luk'
| 'Miss_Jn'
| 'Miss_Act'
| 'Miss_Rom'
| 'Miss_1Co'
| 'Miss_2Co'
| 'Miss_Gal'
| 'Miss_Eph'
| 'Miss_Php'
| 'Miss_Col'
| 'Miss_1Th'
| 'Miss_2Th'
| 'Miss_1Ti'
| 'Miss_2Ti'
| 'Miss_Tit'
| 'Miss_Phm'
| 'Miss_Heb'
| 'Miss_Jam'
| 'Miss_1Pe'
| 'Miss_2Pe'
| 'Miss_1Jn'
| 'Miss_2Jn'
| 'Miss_3Jn'
| 'Miss_Jud'
| 'Miss_Rev'
;

type IntegerStats = Record<IntegerStatName, number>;

const integerStats: IntegerStats = {
    RoomsExplored: 0,
    FlightsTaken: 0,
    ServicesAttended: 0,
    SongsPlayed: 0,
    PeopleMet: 0,
    CaptivesRescued: 0,
    SoulsConverted: 0,
    SeedsPlanted: 0,
    SermonsPreached: 0,
    StandardsRaised: 0,
    KeyVersesUsed: 0,
    ChestsOpened: 0,
    Battles: 0,
    Hits: 0,
    CriticalHits: 0,
    Misses: 0,
    HighestScore: 0,
    Victories: 0,
    Defeats: 0,
    TimeStarted: 0,
    Hit_Gen: 0,
    Hit_Ex: 0,
    Hit_Lev: 0,
    Hit_Num: 0,
    Hit_Deu: 0,
    Hit_Jos: 0,
    Hit_Jdg: 0,
    Hit_Rth: 0,
    Hit_1Sa: 0,
    Hit_2Sa: 0,
    Hit_1Ki: 0,
    Hit_2Ki: 0,
    Hit_1Ch: 0,
    Hit_2Ch: 0,
    Hit_Ezr: 0,
    Hit_Neh: 0,
    Hit_Est: 0,
    Hit_Job: 0,
    Hit_Psa: 0,
    Hit_Prv: 0,
    Hit_Ecc: 0,
    Hit_Sos: 0,
    Hit_Isa: 0,
    Hit_Jer: 0,
    Hit_Lam: 0,
    Hit_Eze: 0,
    Hit_Dan: 0,
    Hit_Hos: 0,
    Hit_Joe: 0,
    Hit_Amo: 0,
    Hit_Obd: 0,
    Hit_Jon: 0,
    Hit_Mic: 0,
    Hit_Nah: 0,
    Hit_Hab: 0,
    Hit_Zep: 0,
    Hit_Hag: 0,
    Hit_Zec: 0,
    Hit_Mal: 0,
    Hit_Mat: 0,
    Hit_Mrk: 0,
    Hit_Luk: 0,
    Hit_Jn: 0,
    Hit_Act: 0,
    Hit_Rom: 0,
    Hit_1Co: 0,
    Hit_2Co: 0,
    Hit_Gal: 0,
    Hit_Eph: 0,
    Hit_Php: 0,
    Hit_Col: 0,
    Hit_1Th: 0,
    Hit_2Th: 0,
    Hit_1Ti: 0,
    Hit_2Ti: 0,
    Hit_Tit: 0,
    Hit_Phm: 0,
    Hit_Heb: 0,
    Hit_Jam: 0,
    Hit_1Pe: 0,
    Hit_2Pe: 0,
    Hit_1Jn: 0,
    Hit_2Jn: 0,
    Hit_3Jn: 0,
    Hit_Jud: 0,
    Hit_Rev: 0,
    Miss_Gen: 0,
    Miss_Ex: 0,
    Miss_Lev: 0,
    Miss_Num: 0,
    Miss_Deu: 0,
    Miss_Jos: 0,
    Miss_Jdg: 0,
    Miss_Rth: 0,
    Miss_1Sa: 0,
    Miss_2Sa: 0,
    Miss_1Ki: 0,
    Miss_2Ki: 0,
    Miss_1Ch: 0,
    Miss_2Ch: 0,
    Miss_Ezr: 0,
    Miss_Neh: 0,
    Miss_Est: 0,
    Miss_Job: 0,
    Miss_Psa: 0,
    Miss_Prv: 0,
    Miss_Ecc: 0,
    Miss_Sos: 0,
    Miss_Isa: 0,
    Miss_Jer: 0,
    Miss_Lam: 0,
    Miss_Eze: 0,
    Miss_Dan: 0,
    Miss_Hos: 0,
    Miss_Joe: 0,
    Miss_Amo: 0,
    Miss_Obd: 0,
    Miss_Jon: 0,
    Miss_Mic: 0,
    Miss_Nah: 0,
    Miss_Hab: 0,
    Miss_Zep: 0,
    Miss_Hag: 0,
    Miss_Zec: 0,
    Miss_Mal: 0,
    Miss_Mat: 0,
    Miss_Mrk: 0,
    Miss_Luk: 0,
    Miss_Jn: 0,
    Miss_Act: 0,
    Miss_Rom: 0,
    Miss_1Co: 0,
    Miss_2Co: 0,
    Miss_Gal: 0,
    Miss_Eph: 0,
    Miss_Php: 0,
    Miss_Col: 0,
    Miss_1Th: 0,
    Miss_2Th: 0,
    Miss_1Ti: 0,
    Miss_2Ti: 0,
    Miss_Tit: 0,
    Miss_Phm: 0,
    Miss_Heb: 0,
    Miss_Jam: 0,
    Miss_1Pe: 0,
    Miss_2Pe: 0,
    Miss_1Jn: 0,
    Miss_2Jn: 0,
    Miss_3Jn: 0,
    Miss_Jud: 0,
    Miss_Rev: 0,
}

export namespace STATS {

    function calcAccuracy(hits: number, misses: number): number {
        const accuracy: number = (hits / (hits + misses)) * 100;
        return isNaN(accuracy) ? 0 : accuracy;
    }

    function getBookAccuracy(bookName: string): number {
        const bookEntry: GBookEntry = BOOKS.lookupEntry(bookName) as GBookEntry;
        const abbreviation: string = bookEntry.abbreviation;
        const hitKey: IntegerStatName = `Hit_${abbreviation}` as IntegerStatName;
        const missKey: IntegerStatName = `Miss_${abbreviation}` as IntegerStatName;
        return calcAccuracy(integerStats[hitKey], integerStats[missKey]);
    }

    function getShortEnoughName(bookEntry: GBookEntry): string {
        return bookEntry.name.length <= 9 ? bookEntry.name : bookEntry.short;
    }

    export function checkNewHighScore(score: number) {
        if (score > integerStats['HighestScore']) {
            integerStats['HighestScore'] = score;
        }
    }

    export function recordBookResult(bookName: string, hit: boolean) {
        const bookEntry: GBookEntry = BOOKS.lookupEntry(bookName) as GBookEntry;
        const abbreviation: string = bookEntry.abbreviation;
        const statKey: IntegerStatName = (hit ? `Hit_${abbreviation}` : `Miss_${abbreviation}`) as IntegerStatName;
        integerStats[statKey] += 1;
    }

    /**
     * Returns the most used book (highest total of hits + misses)
     * Get abbreviation instead of full name for long books.
     */
    export function getFavoriteBook(): string {
        // Every book will total to at least 0, so this will make sure it gets set.
        let maxTotal: number = -1;
        let favoriteBook: GBookEntry|null = null;

        for (const bookEntry of BOOKS.getAllBookEntries()) {
            const abbreviation: string = bookEntry.abbreviation;
            const hitKey: IntegerStatName = `Hit_${abbreviation}` as IntegerStatName;
            const missKey: IntegerStatName = `Miss_${abbreviation}` as IntegerStatName;
            const total: number = integerStats[hitKey] + integerStats[missKey];

            if (BOOKS.isBookObtained(bookEntry.name) && total > maxTotal) {
                maxTotal = total;
                favoriteBook = bookEntry;
            }
        }

        return getShortEnoughName((favoriteBook as GBookEntry));
    }

    /**
     * Returns the most accurate book.
     * Get abbreviation instead of full name for long books.
     */
    export function getBestBook(): string {
        // At least one book will have at least 0% accuracy, so this will make sure it gets set.
        let bestAccuracy: number = -1;
        let bestBook: GBookEntry|null = null;

        for (const bookEntry of BOOKS.getAllBookEntries()) {
            const accuracy: number = getBookAccuracy(bookEntry.name);
            if (BOOKS.isBookObtained(bookEntry.name) && accuracy > bestAccuracy) {
                bestAccuracy = accuracy;
                bestBook = bookEntry;
            }
        }

        return getShortEnoughName((bestBook as GBookEntry));
    }

    /**
     * Returns the least accurate book.
     * Get abbreviation instead of full name for long books.
     */
    export function getWorstBook(): string {
        // 101% accuracy is impossible, so this will make sure it gets set.
        let worstAccuracy: number = 101;
        let worstBook: GBookEntry|null = null;

        for (const bookEntry of BOOKS.getAllBookEntries()) {
            const accuracy: number = getBookAccuracy(bookEntry.name);

            if (BOOKS.isBookObtained(bookEntry.name) && accuracy < worstAccuracy) {
                worstAccuracy = accuracy;
                worstBook = bookEntry;
            }
        }

        return getShortEnoughName((worstBook as GBookEntry));
    }

    export function getIntegerStat(statName: IntegerStatName): number {
        return integerStats[statName];
    }

    export function getAccuracyPct(): string {
        return `${Math.floor(calcAccuracy(integerStats['Hits'], integerStats['Misses']))}%`;
    }

    export function changeInt(statName: IntegerStatName, change: number) {
        integerStats[statName] += change;
    }

    export function startTime() {
        integerStats['TimeStarted'] = Date.now();
    }

    /**
     *  Returns a string representing the time elapsed since the game started.
     *  Format: 00:00:00 (HH:MM:SS)
     */
    export function getTimeElapsed(): string {
        const elapsed: number = Date.now() - integerStats['TimeStarted'];
        const seconds: number = Math.floor(elapsed / 1000);
        const minutes: number = Math.floor(seconds / 60);
        const hours: number = Math.floor(minutes / 60);

        const sec: number = seconds % 60;
        const min: number = minutes % 60;

        const formattedTime: string = `${hours.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
        return formattedTime;
    }
}