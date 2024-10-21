import 'phaser';
import { GCharSprite } from './GCharSprite';
import { GRandom } from '../../GRandom';
import { GFF } from '../../main';
import { GGender, GPerson } from '../../types';
import { GGoal } from '../../GGoal';
import { GWalkToPointGoal } from '../../goals/GWalkToPointGoal';
import { GRestGoal } from '../../goals/GRestGoal';
import { GAdventureContent } from '../../scenes/GAdventureContent';

const GENDER     = ['m', 'f'] as const;
const SKIN_COLOR = ['w', 'y', 't', 'b'] as const;
const ARCH_TYPE  = [
    'athlete',
    'gent',
    'hood',
    'bum',
    'peasant',
    'student',
    'cop',
    'soldier',
    'elder',
    'thug'
];

const ETHNICITY_BY_COLOR = {
    'w': ['common', 'european'],
    'y': ['common', 'asian', 'latino', 'arabian', 'european'],
    't': ['common', 'latino', 'arabian', 'indian', 'african'],
    'b': ['common', 'indian', 'african']
};

export class GPersonSprite extends GCharSprite {

    private person: GPerson;

    constructor(scene: GAdventureContent, person: GPerson, x: number, y: number) {
        super(
            scene,
            person.spriteKeyPrefix,
            person.firstName,
            person.lastName,
            x,
            y
        );
        this.person = person;
    }

    public getPerson(): GPerson {
        return this.person;
    }

    public getGender(): GGender {
        return this.person.gender;
    }

    protected getSpeed(): number {
        return parseFloat(GFF.GAME.registry.get('walkSpeed'));
    }

    public getVoiceKey(): string {
        return `${this.person.gender}_voice_${this.person.voice}`;
    }

    protected thinkOfNextGoal(): GGoal|null {
        if (GRandom.flipCoin()) {
            return new GRestGoal(this, GRandom.randInt(1000, 20000));
        } else {
            let x: number = GRandom.randInt(100, 924);
            let y: number = GRandom.randInt(100, 668);
            return new GWalkToPointGoal(this, x, y, 10, 5000);
        }
    }

    protected getNametagText(): string {
        return this.person.introduced ? super.getNametagText() : '???';
    }

    public static createAllPeople() {
        let spriteKeyPrefix: string;

        // Create someone for every combination of
        // gender, skin color, arch-type, and sub-type:
        GENDER.forEach(g => {
            SKIN_COLOR.forEach(c => {
                ARCH_TYPE.forEach(t => {
                    let subTypes = 3;
                    // Make arch-type modifications:
                    switch (t) {
                        case 'gent':
                            t = (g === 'm') ? t : 'lady';
                            break;
                        case 'bum':
                            t = (g === 'm') ? t : 'belle';
                            break;
                        case 'cop':
                        case 'soldier':
                            subTypes = 1;
                            break;
                        case 'thug':
                            subTypes = 2;
                            break;
                    }

                    for (let s = 1; s <= subTypes; s++) {
                        // Put all components together to form sprite key prefix:
                        spriteKeyPrefix = `${g}_${c}_${t}_${s}`;

                        // Pick an ethnicity to be used for name generation:
                        const ethnicity = GRandom.randElement(ETHNICITY_BY_COLOR[c]) as string

                        // Create a random person and add him/her to the registry:
                        this.createRandomPerson(spriteKeyPrefix, ethnicity, g);
                    }
                });
            });
        });
    }

    private static createRandomPerson(spriteKeyPrefix: string, ethnicity: string, gender: GGender) {
        // 33% chance to choose an ethnic first name, otherwise common:
        let useEthnic: boolean = GRandom.randInt(0, 2) === 1;
        let nameProfile: string = `${gender}_${useEthnic ? ethnicity : 'common'}_names`;
        let firstName: string = GRandom.randElement(GFF.GAME.cache.json.get(nameProfile));

        // If the first is ethnic, have a higher chance to pick an ethnic last name as well:
        useEthnic = GRandom.randInt(0, 1 + (useEthnic ? 0 : 1)) === 1;
        nameProfile = `s_${useEthnic ? ethnicity : 'common'}_names`;
        let lastName: string = GRandom.randElement(GFF.GAME.cache.json.get(nameProfile));

        // 50% chance for the person to be "reprobate" (-1), and never be converted.
        // 50% chance to begin with a random amount of faith (progress toward conversion).
        let startingFaith = GRandom.flipCoin() ? -1 : GRandom.randInt(0, 99);

        // Add new person to the people registry:
        (GFF.GAME.registry.get('people') as GPerson[]).push({
            firstName: firstName,
            lastName: lastName,
            spriteKeyPrefix: spriteKeyPrefix,
            gender: gender,
            voice: (GRandom.randInt(1, 5) as 1|2|3|4|5),
            faith: startingFaith,
            introduced: false,
            knowsPlayer: false
        });
    }
}