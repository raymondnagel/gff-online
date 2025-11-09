import { GGoal } from "./GGoal";
import { Dir9 } from "../types";
import { GProphetSprite } from "../objects/chars/GProphetSprite";
import { RANDOM } from "../random";

export class GPrayForAdamGoal extends GGoal {

    /**
     * The prophet will utter a prayer for Adam for every 4 seconds,
     * at which time the goal will time out and restart.
     */
    constructor() {
        super('prayForAdam', 4000);
    }

    public start(): void {
        (this.char as GProphetSprite).prayForAdam();
        this.char.showFloatingText(RANDOM.randElement([
            'O Lord, bless thy servant Adam...',
            'Preserve his soul...',
            'Lead him not into temptation...',
            'Strengthen him with thy might...',
            'Lord, bow down thine ear...',
            'Guide him through this evil place...',
            'Establish his goings, Lord...',
            'Have mercy upon Brother Adam...'
        ]), 'phrase');
    }

    public doStep(_time: number, _delta: number): void {
    }

    // The prophet will continue praying until the player approaches him
    public isAchieved(): boolean {
        return false;
    }

    public stop(): void {
        // Do nothing when this stops
    }
}