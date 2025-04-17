import { DIRECTION } from "../direction";
import { GCharSprite } from "../objects/chars/GCharSprite";
import { PHYSICS } from "../physics";
import { Dir9, GPoint } from "../types";

const DIAGONAL_THRESHOLD: number = 1.5;
const MIN_TIME_PER_DIR: number = 500;
const CORRECTION_TOLERANCE: number = 5;

export abstract class GGoal {

    private name: string;
    private startTime: number;
    private timeOut: number|undefined;
    private aftermath: Function|undefined;

    private lastStepTime: number = 0;
    private directionTime: number = 0;

    protected char: GCharSprite;

    constructor(name: string, timeOut?: number) {
        this.name = name;
        this.timeOut = timeOut;
    }

    public getName() {
        return this.name;
    }

    /**
     * Setting the char (which should only be called
     * by char.setGoal) is when the goal actually
     * kicks off, begins the timeout timer, and
     * does any one-time starting code.
     */
    public setChar(char: GCharSprite) {
        this.char = char;
        this.startTime = Date.now();
        this.lastStepTime = this.startTime;
        this.start();
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

    public setAftermath(aftermath: Function) {
        this.aftermath = aftermath;
    }

    public getAftermath(): Function|undefined {
        return this.aftermath;
    }

    /**
     * Determines velocities based on the difference
     * between the target point and the current point,
     * and then directs the character to walk in the
     * direction best representing those velocities.
     */
    protected walkTo(tX: number, tY: number, time: number, delta: number) {
        let xInc: number = 0;
        let yInc: number = 0;
        let myCtr: GPoint = this.char.getPhysicalCenter();

        if (myCtr.x < tX) {
            xInc = 1;
        } else if (myCtr.x > tX) {
            xInc = -1;
        }

        if (myCtr.y < tY) {
            yInc = 1;
        } else if (myCtr.y > tY) {
            yInc = -1;
        }

        let direction: Dir9 = DIRECTION.getDirectionForIncs(xInc, yInc);
        this.char.walkDirection(direction, time, delta, {x: tX, y: tY});
    }

    // This algorithm is good for preventing flickering between
    // two adjacent direction animations (e.g. NE & E) when
    // chasing a moving target.
    protected walkTowardForTime(tX: number, tY: number) {
        let xInc: number = 0;
        let yInc: number = 0;
        let myCtr: GPoint = this.char.getPhysicalCenter();
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
        if (charDir !== Dir9.NONE && this.directionTime > 0) {
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

            this.char.walkDirection(DIRECTION.getDirectionForIncs(xInc, yInc));
            this.lastStepTime = Date.now();
        }

    }

    public abstract doStep(time: number, delta: number): void;

    public abstract isAchieved(): boolean;

    /**
     * If something should happen just once, at the
     * beginning of the goal, before doing a step-based
     * activity, put it in here.
     *
     * This allows us to both set the char and kick
     * off the goal anytime AFTER its creation, instead
     * of doing both in the constructor.
     */
    public start(): void {}

    /**
     * Once the goal is finished, whether achieved or
     * timed out, call this to cease and desist any
     * activity that was part of this goal.
     *
     * Since most goals are about character movement,
     * a good default "stop" behavior is to simply
     * stop the character from moving. For goals that
     * do other things, override this method with
     * any other needed stoppage.
     */
    public stop(): void {
        this.char.walkDirection(Dir9.NONE);
    }
}