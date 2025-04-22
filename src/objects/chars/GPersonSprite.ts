import 'phaser';
import { GCharSprite } from './GCharSprite';
import { RANDOM } from '../../random';
import { GFF } from '../../main';
import { GGender, GInteractable, GPerson } from '../../types';
import { GWalkToPointGoal } from '../../goals/GWalkToPointGoal';
import { GRestGoal } from '../../goals/GRestGoal';
import { PEOPLE } from '../../people';
import { GGoal } from '../../goals/GGoal';
import { GConversation } from '../../GConversation';

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

export class GPersonSprite extends GCharSprite implements GInteractable {

    private person: GPerson;
    private readyToTalk: boolean = true;

    constructor(person: GPerson, x: number, y: number) {
        super(
            person.spriteKeyPrefix,
            person.firstName,
            person.lastName,
            x,
            y
        );
        this.person = person;

        // Allow collision events:
        if (this.body !== null) {
            this.body.onCollide = true;
            this.setCollideWorldBounds(true, 0, 0, true);
        }
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
        if (RANDOM.flipCoin()) {
            return new GRestGoal(RANDOM.randInt(1000, 20000));
        } else {
            let x: number = RANDOM.randInt(100, 924);
            let y: number = RANDOM.randInt(100, 668);
            return new GWalkToPointGoal(x, y, 10, 5000);
        }
    }

    protected getNametagText(): string {
        return this.person.nameLevel > 0 && this.person.familiarity > 0
            ? super.getNametagText()
            : '???';
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
                        const ethnicity = RANDOM.randElement(ETHNICITY_BY_COLOR[c]) as string

                        // Create a random person and add him/her to the registry:
                        this.createRandomPerson(spriteKeyPrefix, ethnicity, g);
                    }
                });
            });
        });
    }

    private static createRandomPerson(spriteKeyPrefix: string, ethnicity: string, gender: GGender) {
        // 33% chance to choose an ethnic first name, otherwise common:
        let useEthnic: boolean = RANDOM.randInt(0, 2) === 1;
        let nameProfile: string = `${gender}_${useEthnic ? ethnicity : 'common'}_names`;
        let firstName: string = RANDOM.randElement(GFF.GAME.cache.json.get(nameProfile));

        // If the first is ethnic, have a higher chance to pick an ethnic last name as well:
        useEthnic = RANDOM.randInt(0, 1 + (useEthnic ? 0 : 1)) === 1;
        nameProfile = `s_${useEthnic ? ethnicity : 'common'}_names`;
        let lastName: string = RANDOM.randElement(GFF.GAME.cache.json.get(nameProfile));

        // Add new person to the people registry:
        PEOPLE.addPerson({
            firstName: firstName,
            lastName: lastName,
            preferredName: null,
            spriteKeyPrefix: spriteKeyPrefix,
            gender: gender,
            voice: RANDOM.randInt(1, 5) as 1|2|3|4|5,
            faith: RANDOM.randInt(0, 99),
            familiarity: 0,
            nameLevel: 0,
            reprobate: RANDOM.flipCoin(),
            homeTown: null
        });
    }

    public interact(): void {
        console.log('Interacting with ' + this.person.firstName + ' ' + this.person.lastName);
        console.dir(this.person);

        if (this.person.faith >= 100) {
            // This person is a saint!
            if (this.person.preferredName === null) {
                this.person.preferredName = this.getSaintName();
            }
            GConversation.fromFile('talk_to_saint_conv', [
                { label: 'other', char: this }
            ]);
        } else {
            // This person is a sinner!
            if (this.person.preferredName === null) {
                this.person.preferredName = this.getFormalName();
            }
            if (this.readyToTalk) {
                this.readyToTalk = false;
                GConversation.fromFile('talk_to_sinner_conv', [
                    { label: 'other', char: this }
                ]);
            } else {
                GConversation.fromFile('notalk_to_sinner_conv', [
                    { label: 'other', char: this }
                ]);
            }
        }
    }
}