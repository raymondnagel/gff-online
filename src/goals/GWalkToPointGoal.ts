import { GGoal } from "./GGoal";
import { GPoint } from "../types";

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

    public doStep(time: number, delta: number): void {
        this.walkTo(this.targetX, this.targetY, time, delta);
    }

    public isAchieved(): boolean {
        const charCtr: GPoint = this.char.getPhysicalCenter();
        const distance = Phaser.Math.Distance.Between(
            charCtr.x,
            charCtr.y,
            this.targetX,
            this.targetY
        );
        return distance <= this.range;
    }
}