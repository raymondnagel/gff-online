import { GDirection } from "./GDirection";
import { GCharSprite } from "./objects/chars/GCharSprite";

const DIAGONAL_THRESHOLD: number = 1.5;
const MIN_TIME_PER_DIR: number = 500;
const CORRECTION_TOLERANCE: number = 5;

export abstract class GGoal {

    private name: string;
    private startTime: number;
    private timeOut: number|undefined;

    private lastStepTime: number = 0;
    private directionTime: number = 0;

    protected char: GCharSprite;

    constructor(name: string, char: GCharSprite, timeOut?: number) {
        this.name = name;
        this.char = char;
        this.timeOut = timeOut;
        this.startTime = Date.now();
        this.lastStepTime = this.startTime;
    }

    public getName() {
        return this.name;
    }

    public getChar(): GCharSprite {
        return this.char;
    }

    public getStartTime() {
        return this.startTime;
    }

    public isTimedOut(): boolean {
        if (this.timeOut === undefined) {
            return false;
        }
        return Date.now() > this.startTime + this.timeOut;
    }

    protected walkToward(tX: number, tY: number) {
        let xInc: number = 0;
        let yInc: number = 0;
        let myCtr = this.char.getBottomCenter();
        let dx: number = tX - myCtr.x;
        let dy: number = tY - myCtr.y;

        if (myCtr.x < tX - CORRECTION_TOLERANCE) {
            xInc = 1;
        } else if (myCtr.x > tX + CORRECTION_TOLERANCE) {
            xInc = -1;
        }
        if (myCtr.y < tY - CORRECTION_TOLERANCE) {
            yInc = 1;
        } else if (myCtr.y > tY + CORRECTION_TOLERANCE) {
            yInc = -1;
        }

        let direction: GDirection.Dir9 = GDirection.getDirectionForIncs(xInc, yInc);
        this.char.walkDirection(direction);
    }

    protected walkTowardExperimental(tX: number, tY: number) {
        let xInc: number = 0;
        let yInc: number = 0;
        let myCtr = this.char.getBottomCenter();
        let dx: number = tX - myCtr.x;
        let dy: number = tY - myCtr.y;

        // Determine which axis has the greater distance
        let absDx: number = Math.abs(dx);
        let absDy: number = Math.abs(dy);

        let absDiff: number = Math.abs(absDx - absDy);

        if (absDx > absDy * DIAGONAL_THRESHOLD) {
            // Prioritize horizontal movement
            if (dx > 0) {
                xInc = 1; // Move right
            } else {
                xInc = -1; // Move left
            }
            yInc = 0; // Don't move vertically
        } else if (absDy > absDx * DIAGONAL_THRESHOLD) {
            // Prioritize vertical movement
            if (dy > 0) {
                yInc = 1; // Move down
            } else {
                yInc = -1; // Move up
            }
            xInc = 0; // Don't move horizontally
        } else {
            // Distances are close or nearly equal, move diagonally
            if (dx > 0) {
                xInc = 1; // Move right
            } else {
                xInc = -1; // Move left
            }
            if (dy > 0) {
                yInc = 1; // Move down
            } else {
                yInc = -1; // Move up
            }
        }

        let direction: GDirection.Dir9 = GDirection.getDirectionForIncs(xInc, yInc);
        this.char.walkDirection(direction);
    }

    // This algorithm is good for preventing flickering between
    // two adjacent direction animations (e.g. NE & E) when
    // chasing a moving target.
    protected walkTowardForTime(tX: number, tY: number) {
        let xInc: number = 0;
        let yInc: number = 0;
        let myCtr = this.char.getBottomCenter();
        let dx: number = tX - myCtr.x;
        let dy: number = tY - myCtr.y;

        // Get the direction I'm currently moving/facing
        let charDir = this.char.getDirection();

        // Determine which axis has the greater distance
        let absDx: number = Math.abs(dx);
        let absDy: number = Math.abs(dy);

        let timeDelta = Date.now() - this.lastStepTime;

        // If we're moving, but there is still time remaining to move
        // in this direction, continue on:
        if (charDir !== GDirection.Dir9.NONE && this.directionTime > 0) {
            this.directionTime -= timeDelta;
        } else {
            // We've moved enough in the current direction;
            // reset the counter and re-choose the best direction
            this.directionTime = MIN_TIME_PER_DIR;

            if (absDx > absDy * DIAGONAL_THRESHOLD) {
                // Prioritize horizontal movement
                if (dx > 0) {
                    xInc = 1;
                } else {
                    xInc = -1;
                }
                yInc = 0; // Don't move vertically
            } else if (absDy > absDx * DIAGONAL_THRESHOLD) {
                // Prioritize vertical movement
                if (dy > 0) {
                    yInc = 1;
                } else {
                    yInc = -1;
                }
                xInc = 0;
            } else {
                // Distances are close or nearly equal, move diagonally
                if (dx > 0) {
                    xInc = 1;
                } else {
                    xInc = -1;
                }
                if (dy > 0) {
                    yInc = 1;
                } else {
                    yInc = -1;
                }
            }

            this.char.walkDirection(GDirection.getDirectionForIncs(xInc, yInc));
            this.lastStepTime = Date.now();
        }

    }

    public abstract doStep(): void;

    public abstract isAchieved(): boolean;
}