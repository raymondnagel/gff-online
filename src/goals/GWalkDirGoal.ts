import { GGoal } from "./GGoal";
import { Dir9, GPoint } from "../types";
import { DIRECTION } from "../direction";

/**
 * This goal works the same way as the GWalkToPointGoal, but calculates the
 * target point based on the direction and distance.
 */
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
        const charCtr: GPoint = this.char.getPhysicalCenter();
        this.targetX = charCtr.x + xDist;
        this.targetY = charCtr.y + yDist;
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