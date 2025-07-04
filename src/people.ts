import { GFF } from "./main";
import { PLAYER } from "./player";
import { RANDOM } from "./random";
import { GPerson, LeveledDynamicBlurb } from "./types";

export namespace PEOPLE {
    let people: GPerson[] = [];
    let capturedPeople: GPerson[] = [];

    export function addPerson(person: GPerson) {
        people.push(person);
    }

    export function getPersons() {
        return people;
    }

    export function addCapturedPerson(person: GPerson) {
        capturedPeople.push(person);
    }

    export function getCapturedPersons() {
        return capturedPeople;
    }

    export function getFormalName(person: GPerson): string {
        if (person.spriteKeyPrefix.includes('_cop_')) {
            return 'Officer ' + person.lastName;
        } else if (person.spriteKeyPrefix.includes('_soldier_')) {
            return RANDOM.randElement(['Private ', 'Corporal ', 'Sergeant ', 'Lieutenant ', 'Captain ', 'Major ']) + person.lastName;
        }
        return (
            person.gender === 'm'
            ? 'Mr. '
            : 'Ms. '
        ) + person.lastName
    }
    export function getSaintName(person: GPerson): string {
        return (
            person.gender === 'm'
            ? 'Brother '
            : 'Sister '
        ) + person.firstName;
    }
    export function getSexType(person: GPerson): string {
        return (
            person.gender === 'm'
            ? 'man'
            : 'woman'
        );
    }
    export function getSexFull(person: GPerson): string {
        return (
            person.gender === 'm'
            ? 'male'
            : 'female'
        );
    }
    export function getPoliteType(person: GPerson): string {
        return (
            person.gender === 'm'
            ? 'gentleman'
            : 'lady'
        );
    }
    export function getHonorific(person: GPerson): string {
        return (
            person.gender === 'm'
            ? 'sir'
            : 'madam'
        );
    }
    export function getSubject(person: GPerson): string {
        return (
            person.gender === 'm'
            ? 'he'
            : 'she'
        );
    }
    export function getObject(person: GPerson): string {
        return (
            person.gender === 'm'
            ? 'him'
            : 'her'
        );
    }
    export function getPossessive(person: GPerson): string {
        return (
            person.gender === 'm'
            ? 'his'
            : 'her'
        );
    }
    export function getPreferredName(person: GPerson): string {
            return person.preferredName ?? person.firstName + ' ' + person.lastName;
    }
    export function getNameForProfile(person: GPerson): string {
        return person.nameLevel > 0 && person.familiarity > 0
            ? `${person.lastName}, ${person.firstName}`
            : '???';
    }

    // Returns what "speaker" would say to "hearer" about "other"
    export function getInformText(speaker: GPerson, hearer: GPerson, other: GPerson): string {
        const faithLevel: number = Math.floor(other.faith / 25);
        const levelId: number = Math.min(faithLevel, 3);
        const informIntro: string = RANDOM.randElement(GFF.GAME.cache.json.get('saint_inform_intro'));
        const informClass: string = other.reprobate
            ? 'saint_inform_tares'
            : 'saint_inform_wheat';

        const dynamicsByLevel: LeveledDynamicBlurb[] = GFF.GAME.cache.json.get(informClass);
        const levelDynamics: LeveledDynamicBlurb = dynamicsByLevel.find(b => b.level === levelId) as LeveledDynamicBlurb;
        const informBlurb: string = RANDOM.randElement(levelDynamics.variants) as string;

        return PEOPLE.replaceLabels(
            informIntro + ' ' + informBlurb,
            speaker,
            hearer,
            other
        );
    }

    export function replaceLabels(text: string, speaker: GPerson, hearer?: GPerson, other?: GPerson): string {
        let newText = text
            .replaceAll('SPEAKER_FIRST', speaker.firstName)
            .replaceAll('SPEAKER_LAST', speaker.lastName)
            .replaceAll('SPEAKER_FULL', speaker.firstName + ' ' + speaker.lastName)
            .replaceAll('SPEAKER_FORMAL', getFormalName(speaker))
            .replaceAll('SPEAKER_SAINT', getSaintName(speaker))
            .replaceAll('SPEAKER_SEXTYPE', getSexType(speaker))
            .replaceAll('SPEAKER_POLITE', getPoliteType(speaker))
            .replaceAll('SPEAKER_HONOR', getHonorific(speaker))
            .replaceAll('SPEAKER_PREF', getPreferredName(speaker));
        if (hearer !== undefined) {
            newText = newText
                .replaceAll('HEARER_FIRST', hearer.firstName)
                .replaceAll('HEARER_LAST', hearer.lastName)
                .replaceAll('HEARER_FULL', hearer.firstName + ' ' + hearer.lastName)
                .replaceAll('HEARER_FORMAL', getFormalName(hearer))
                .replaceAll('HEARER_SAINT', getSaintName(hearer))
                .replaceAll('HEARER_SEXTYPE', getSexType(hearer))
                .replaceAll('HEARER_POLITE', getPoliteType(hearer))
                .replaceAll('HEARER_HONOR', getHonorific(hearer))
                .replaceAll('HEARER_PREF', getPreferredName(hearer));
        }
        if (other !== undefined) {
            newText = newText
                .replaceAll('OTHER_FIRST', other.firstName)
                .replaceAll('OTHER_LAST', other.lastName)
                .replaceAll('OTHER_FULL', other.firstName + ' ' + other.lastName)
                .replaceAll('OTHER_FORMAL', getFormalName(other))
                .replaceAll('OTHER_SAINT', getSaintName(other))
                .replaceAll('OTHER_SEXTYPE', getSexType(other))
                .replaceAll('OTHER_POLITE', getPoliteType(other))
                .replaceAll('OTHER_HONOR', getHonorific(other))
                .replaceAll('OTHER_PREF', getPreferredName(other))
                .replaceAll('OTHER_SUBJECT', getSubject(other))
                .replaceAll('OTHER_OBJECT', getObject(other))
                .replaceAll('OTHER_POSSESS', getPossessive(other));
        }
        if (speaker.homeTown !== null) {
            newText = newText.replaceAll('SPEAKER_TOWN', speaker.homeTown.getName());
        }
        return newText;
    }
}