import { GGoal } from "./GGoal";
import { GCharSprite } from "../objects/chars/GCharSprite";
import { Dir9 } from "../types";
import { DIRECTION } from "../direction";

export class GWalkDirGoal extends GGoal {

    private targetX: number;
    private targetY: number;
    private range: number;

    constructor(char: GCharSprite, direction: Dir9, distance: number, range: number = 0, timeOut?: number) {
        super('walk-dir', char, timeOut);
        this.targetX = char.getBottomCenter().x + (DIRECTION.getHorzInc(direction) * distance);
        this.targetY = char.getBottomCenter().y + (DIRECTION.getVertInc(direction) * distance);
        console.log(`Walking to target: ${this.targetX},${this.targetY}`);
        this.range = range;
    }

    public doStep(): void {
        this.walkToward(this.targetX, this.targetY);
    }

    public isAchieved(): boolean {
        const distance = Phaser.Math.Distance.Between(
            this.char.x,
            this.char.y,
            this.targetX,
            this.targetY
        );
        return distance <= this.range;
    }
}