import 'phaser';
import { GPersonSprite } from './GPersonSprite';
import { Dir9, GPerson, GPoint2D } from '../../types';
import { GGoal } from '../../goals/GGoal';
import { GRestGoal } from '../../goals/GRestGoal';
import { RANDOM } from '../../random';
import { GConversation } from '../../GConversation';
import { GPrayForAdamGoal } from '../../goals/GPrayForAdamGoal';
import { PLAYER } from '../../player';
import { GFacePlayerGoal } from '../../goals/GFacePlayerGoal';
import { DIRECTION } from '../../direction';

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
        specialGift: null,
        homeTown: null, // The same prophet will appear in every stronghold
        bio1: null,
        bio2: null,
        favoriteBook: 'Revelation',
        conversations: 0
    };

    private praying: boolean = true;
    private useStaff: boolean = false;

    constructor(x: number, y: number, useStaff: boolean) {
        super(
            GProphetSprite.PERSON,
            x,
            y
        );
        this.useStaff = useStaff;

        this.createDirectionalAnimations('staff_idle');
        this.createSingleAnimation('kneel_se');
        this.createSingleAnimation('pull_se');
    }

    public faceDirection(direction: Dir9, setIdle: boolean = false) {
        // Only set the facing direction if it is not NONE;
        // a character cannot face no direction.
        if (direction !== Dir9.NONE) {
            this.direction = direction;
            if (setIdle) {
                this.playDirectionalAnimation(this.useStaff ? 'staff_idle' : 'idle');
            }
        }
    }

    /**
     * I wish there was a better way to override this without duplicating
     * so much of the logic in GCharSprite.walkDirection, but there doesn't seem
     * to be an easy way to select the right idle animation based on useStaff.
     *
     * Ironically enough, the prophet never actually walks anywhere in the game,
     * so at least we can use a somewhat simplified version of super.walkDirection
     * that doesn't actually move him.
     */
    public walkDirection(direction: Dir9, time?: number, delta?: number, target?: GPoint2D): void {
        // Face the direction I am walking:
        this.faceDirection(direction);

        // Get horz/vert increments by direction
        let horzInc: number = DIRECTION.getXInc(direction);
        let vertInc: number = DIRECTION.getYInc(direction);

        this.setVelocityX(0);
        this.setVelocityY(0);

        // Recalculate direction from increments, since they may have changed:
        const finalDirection: Dir9 = DIRECTION.getDirectionForIncs(horzInc, vertInc);

        // Play the appropriate animation based on direction
        if (finalDirection !== Dir9.NONE) {
            this.playDirectionalAnimation('walk', finalDirection, false);
        } else {
            // Since the assigned direction is NONE, use the facing direction instead:
            this.playDirectionalAnimation(this.useStaff ? 'staff_idle' : 'idle', this.direction, false);
        }
    }

    public pullRopeSE() {
        this.playSingleAnimation('pull_se');
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

    public static getProphetPerson(): GPerson {
        return GProphetSprite.PERSON;
    }
}