import { GGoal } from "./GGoal";
import { PLAYER } from "../player";

export class GFacePlayerGoal extends GGoal {

    constructor(timeOut?: number) {
        super('facePlayer', timeOut);
    }

    public start(): void {
        this.char.faceChar(PLAYER.getSprite(), true);
    }

    public doStep(_time: number, _delta: number): void {
        // No steps to be taken; this is one and done in start()
    }

    // Once this goal is active, the prophet will always face the player
    public isAchieved(): boolean {
        return true;
    }
}