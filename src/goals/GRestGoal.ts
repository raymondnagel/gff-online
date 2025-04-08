import { DIRECTION } from "../direction";
import { GGoal } from "./GGoal";
import { RANDOM } from "../random";
import { GCharSprite } from "../objects/chars/GCharSprite";
import { Dir9 } from "../types";

export class GRestGoal extends GGoal {

    constructor(char: GCharSprite, timeOut: number) {
        super('rest', timeOut);
    }

    public start(): void {
        // Facing a random direction gives us an opportunity to see characters
        // from different angles, showcasing the beautiful artwork:
        this.char.faceDirection(RANDOM.randElement(DIRECTION.dir8Values()));

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