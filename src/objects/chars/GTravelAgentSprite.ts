import 'phaser';
import { GPersonSprite } from './GPersonSprite';
import { Dir9, GPerson } from '../../types';
import { GGoal } from '../../goals/GGoal';
import { GRestGoal } from '../../goals/GRestGoal';
import { RANDOM } from '../../random';
import { GConversation } from '../../GConversation';

export class GTravelAgentSprite extends GPersonSprite {

    static PERSON: GPerson = {
        firstName: 'Travel',
        lastName: 'Agent',
        preferredName: 'Travel Agent',
        spriteKeyPrefix: 'travel_agent',
        gender: 'm',
        voice: 4,
        faith: 100,
        familiarity: 0,
        nameLevel: 1,
        reprobate: false,
        homeTown: null, // The same agent will appear in every town
        bio1: null,
        bio2: null,
        favoriteBook: 'Job'
    };

    constructor(x: number, y: number) {
        super(
            GTravelAgentSprite.PERSON,
            x,
            y
        );
    }

    /**
     * The Travel Agent just stands in one spot and never moves.
     * His only goal in life is to stand still and be talked to.
     * At least by giving him rest goals, he'll be able to look
     * around once in awhile.
     */
    protected thinkOfNextGoal(): GGoal | null {
        return new GRestGoal(RANDOM.randInt(3000, 10000), RANDOM.randElement([Dir9.SW, Dir9.S, Dir9.SE]));
    }

    public interact(): void {
        GConversation.fromFile('talk_to_agent_conv', [
            { label: 'other', char: this }
        ]);
    }
}