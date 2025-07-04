import { GGoal } from "./GGoal";
import { GPlayerSprite } from "../objects/chars/GPlayerSprite";

/**
 * Not much of a goal, but this lets us play the interact animation
 * and then stop when the animation is done.
 */
export class GInteractGoal extends GGoal {

    constructor() {
        super('interact');
    }

    public start(): void {
        (this.char as GPlayerSprite).handAction();
    }

    public doStep(_time: number, _delta: number): void {
        // We don't take steps when we're interacting!
    }

    public isAchieved(): boolean {
        // Achieved when the player is done with the interact animation:
        return this.char.anims.isPlaying === false;
    }
}