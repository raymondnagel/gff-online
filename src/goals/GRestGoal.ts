import { DIRECTION } from "../direction";
import { GGoal } from "./GGoal";
import { RANDOM } from "../random";
import { GCharSprite } from "../objects/chars/GCharSprite";
import { Dir9 } from "../types";

export class GRestGoal extends GGoal {

    private faceDir: Dir9;

    /**
     * You can specify which direction the character will face
     * while resting. If NONE (the default), a random direction
     * will be chosen.
     */
    constructor(timeOut: number, faceDir: Dir9 = Dir9.NONE) {
        super('rest', timeOut);
        this.faceDir = faceDir;
    }

    public start(): void {
        // Facing a random direction gives us an opportunity to see characters
        // from different angles, showcasing the beautiful artwork:
        const faceDir: Dir9 = this.faceDir !== Dir9.NONE ?
            this.faceDir :
            RANDOM.randElement(DIRECTION.dir8Values());

        this.char.faceDirection(faceDir);

        // Walk NONE stops the character and sets the "idle" animation, but
        // keeps the character facing the direction we set previously.
        this.char.walkDirection(Dir9.NONE);
    }

    public doStep(_time: number, _delta: number): void {
        // We don't take steps when we're resting!
    }

    public isAchieved(): boolean {
        // Rather than try to achieve something, we just let the Rest
        // run until it times out.
        return false;
    }
}