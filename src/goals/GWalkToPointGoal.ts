import { GGoal } from "./GGoal";
import { GCharSprite } from "../objects/chars/GCharSprite";

export class GWalkToPointGoal extends GGoal {

    private targetX: number;
    private targetY: number;
    private range: number;

    constructor(x: number, y: number, range: number, timeOut?: number) {
        super('walk-to-point', timeOut);
        this.targetX = x;
        this.targetY = y;
        this.range = range;
    }

    public doStep(): void {
        this.walkToward(this.targetX, this.targetY);
    }

    public isAchieved(): boolean {
        const distance = Phaser.Math.Distance.Between(
            this.char.getBottomCenter().x,
            this.char.getBottomCenter().y,
            this.targetX,
            this.targetY
        );
        return distance <= this.range;
    }
}