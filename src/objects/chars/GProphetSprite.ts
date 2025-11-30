import 'phaser';
import { GPersonSprite } from './GPersonSprite';
import { Dir9, GPerson } from '../../types';
import { GGoal } from '../../goals/GGoal';
import { GRestGoal } from '../../goals/GRestGoal';
import { RANDOM } from '../../random';
import { GConversation } from '../../GConversation';
import { GPrayForAdamGoal } from '../../goals/GPrayForAdamGoal';
import { PLAYER } from '../../player';
import { GFacePlayerGoal } from '../../goals/GFacePlayerGoal';

const PROPHET_NAME = RANDOM.randElement([
    'Abraham',
    'Agabus',
    'Amos',
    'Daniel',
    'Elijah',
    'Elisha',
    'Enoch',
    'Ezekiel',
    'Ezra',
    'Gad',
    'Habakkuk',
    'Haggai',
    'Hosea',
    'Iddo',
    'Isaiah',
    'Jeremiah',
    'Joel',
    'Jonah',
    'Malachi',
    'Micah',
    'Moses',
    'Nahum',
    'Nathan',
    'Nehemiah',
    'Noah',
    'Obadiah',
    'Samuel',
    'Zechariah',
    'Zephaniah',
]);

export class GProphetSprite extends GPersonSprite {

    static PERSON: GPerson = {
        firstName: PROPHET_NAME,
        lastName: 'the Prophet',
        preferredName: PROPHET_NAME,
        spriteKeyPrefix: 'prophet',
        gender: 'm',
        voice: 1,
        faith: 100,
        familiarity: 0,
        nameLevel: 1,
        reprobate: false,
        convert: false,
        captive: false,
        homeTown: null, // The same prophet will appear in every stronghold
        bio1: null,
        bio2: null,
        favoriteBook: 'Revelation',
        conversations: 0
    };

    private praying: boolean = true;

    constructor(x: number, y: number) {
        super(
            GProphetSprite.PERSON,
            x,
            y
        );

        this.createSingleAnimation('kneel_se');
    }

    /**
     * The Prophet is initially praying when you enter his chamber.
     * When you approach him, he will stand up and pick up his staff.
     */
    protected thinkOfNextGoal(): GGoal|null {
        if (this.praying) {
            return new GPrayForAdamGoal();
        } else {
            return new GFacePlayerGoal();
        }
    }

    public interact(): void {
        GConversation.fromFile('talk_to_prophet_conv', [
            { label: 'other', char: this }
        ]);
    }

    public prayForAdam() {
        this.playSingleAnimation('kneel_se', true);
    }

    public isPraying(): boolean {
        return this.praying;
    }

    public standUp(): void {
        this.praying = false;
        this.setGoal(null);
    }
}