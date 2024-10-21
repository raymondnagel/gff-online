import { GDirection } from "../GDirection";
import { GGoal } from "../GGoal";
import { GCharSprite } from "../objects/chars/GCharSprite";

export class GRejoiceGoal extends GGoal {

    constructor(char: GCharSprite, timeOut: number) {
        super('rejoice', char, timeOut);

        this.char.faceDirection(GDirection.Dir9.S);

        this.char.play('rejoice_s');
    }

    public doStep(): void {
        // We don't take steps when we're resting!
    }

    public isAchieved(): boolean {
        // Rather than try to achieve something, we just let the Rest
        // run until it times out.
        return false;
    }
}