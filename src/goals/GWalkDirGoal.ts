import { GGoal } from "./GGoal";
import { Dir9 } from "../types";
import { DIRECTION } from "../direction";

export class GWalkDirGoal extends GGoal {

    private direction: Dir9;
    private distance: number;
    private targetX: number;
    private targetY: number;
    private range: number;

    constructor(direction: Dir9, distance: number, range: number = 0, timeOut?: number) {
        super('walk-dir', timeOut);
        this.direction = direction;
        this.distance = distance;
        this.range = range;
    }

    public start(): void {
        const xDist: number = (DIRECTION.getHorzInc(this.direction) * this.distance);
        const yDist: number = (DIRECTION.getVertInc(this.direction) * this.distance);
        this.targetX = this.char.getBottomCenter().x + xDist;
        this.targetY = this.char.getBottomCenter().y + yDist;
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