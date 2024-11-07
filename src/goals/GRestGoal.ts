import { GDirection } from "../GDirection";
import { GGoal } from "./GGoal";
import { GRandom } from "../GRandom";
import { GCharSprite } from "../objects/chars/GCharSprite";
import { Dir9 } from "../types";

export class GRestGoal extends GGoal {

    constructor(char: GCharSprite, timeOut: number) {
        super('rest', char, timeOut);

        // Facing a random direction gives us an opportunity to see characters
        // from different angles, showcasing the beautiful artwork:
        this.char.faceDirection(GRandom.randElement(GDirection.dir8Values()));

        // Walk NONE stops the character and sets the "idle" animation, but
        // keeps the character facing the direction we set previously.
        this.char.walkDirection(Dir9.NONE);
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