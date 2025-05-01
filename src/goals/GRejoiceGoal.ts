import { GGoal } from "./GGoal";
import { Dir9 } from "../types";

export class GRejoiceGoal extends GGoal {

    constructor(timeOut?: number) {
        super('rejoice', timeOut);
    }

    public start(): void {
        this.char.faceDirection(Dir9.S);
        this.char.rejoice();
    }

    public doStep(_time: number, _delta: number): void {
        // We don't take steps when we're rejoicing!
    }

    public isAchieved(): boolean {
        // Rather than try to achieve something, we just let the Rejoice
        // run until it times out.
        return false;
    }
}