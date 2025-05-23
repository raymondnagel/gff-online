import { GGoal } from "./GGoal";
import { Dir9 } from "../types";
import { GPlayerSprite } from "../objects/chars/GPlayerSprite";

/**
 * Not much of a goal, but this lets us play the bullhorn animation
 * and then stop when the animation is done. In the street preaching
 * cutscene, this is immediately followed by the preach animation,
 * in which the bullhorn is already raised.
 */
export class GBullhornGoal extends GGoal {

    constructor() {
        super('bullhorn');
    }

    public start(): void {
        this.char.faceDirection(Dir9.S);
        (this.char as GPlayerSprite).play('adam_bullhorn_sw', false);
    }

    public doStep(_time: number, _delta: number): void {
        // We don't take steps when we're pulling out the bullhorn!
    }

    public isAchieved(): boolean {
        // Achieved when the player is done with the bullhorn animation:
        return this.char.anims.isPlaying === false;
    }
}