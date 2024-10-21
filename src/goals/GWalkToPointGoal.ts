import { GDirection } from "../GDirection";
import { GGoal } from "../GGoal";
import { GCharSprite } from "../objects/chars/GCharSprite";

const CORRECTION_TOLERANCE = 5;

export class GWalkToPointGoal extends GGoal {

    private targetX: number;
    private targetY: number;
    private range: number;

    constructor(char: GCharSprite, x: number, y: number, range: number, timeOut: number) {
        super('walk-to-point', char, timeOut);
        this.targetX = x;
        this.targetY = y;
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