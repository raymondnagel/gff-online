import { GGoal } from "./GGoal";
import { Dir9 } from "../types";
import { GProphetSprite } from "../objects/chars/GProphetSprite";
import { GFF } from "../main";

const HEAVE_DURATION: number = 1000; // How long to pull the rope between breaks
const BREAK_DURATION: number = 500; // How long the break between pulls should last
const TOTAL_PULLS: number = 5; // How many times the player needs to pull the rope
const VEL_X: number = 25; // How fast the player should move east while pulling the rope
const VEL_Y: number = 10; // How fast the player should move south while pulling the rope

/**
 * This goal is used by the Prophet to pull toward the SE;
 * it is the counterpart to GPullRopeSwGoal, which has the player
 * pulling toward the SW. They are almost identical, except that the
 * player version also plays sound effects. (Since they both happen at
 * the same time, we don't want to play the sounds twice, so we just
 * let the player version handle that.)
 */
export class GPullRopeSeGoal extends GGoal {

    private pullsCompleted: number = 0;
    private wiggleOffsetX: number = 0;
    private baseX: number = 0;
    private updateRopeFunc: Function;

    constructor(updateRopeFunc: Function) {
        super('pull-rope-se');
        this.updateRopeFunc = updateRopeFunc;
    }

    public start(): void {
        // Begin playing the animation
        (this.char as GProphetSprite).pullRopeSE();
        this.doWiggle();
    }

    public doStep(_time: number, _delta: number): void {
        const totalTime: number = Date.now() - this.getStartTime();
        const cycleTime: number = HEAVE_DURATION + BREAK_DURATION;
        const currentCycle: number = Math.floor(totalTime / cycleTime);
        const timeInCurrentCycle: number = totalTime % cycleTime;
        const isHeaving: boolean = timeInCurrentCycle < HEAVE_DURATION;
        this.baseX = this.char.x;

        // Determine which part of the cycle we're in
        if (isHeaving) {
            // At the beginning of each heave:
            if (currentCycle < TOTAL_PULLS && !this.char.isDoing('pull')) {
                this.doWiggle();
            }
            (this.char as GProphetSprite).pullRopeSE();
            this.char.setVelocity(VEL_X, VEL_Y);
        } else {
            // He's walking backwards while pulling, so idle in the opposite direction:
            this.char.faceDirection(Dir9.NW, true);
            this.char.setVelocity(0, 0);
        }

        // If we've just completed a pull, increment the count:
        if (currentCycle > this.pullsCompleted) {
            this.pullsCompleted = currentCycle;
        }

        // Update character's position based on wiggle:
        this.char.setX(this.baseX + this.wiggleOffsetX);

        // Update the rope so the loose end follows the player's center:
        this.updateRopeFunc();
    }

    /**
     * As each pull begins, the character will wiggle side-to-side
     * a bit to show the effort of pulling the rope.
     */
    private doWiggle(): void {
        const scene = GFF.AdventureContent;

        // kill any existing wiggle so they don’t stack
        scene.tweens.killTweensOf(this);

        this.wiggleOffsetX = 0;

        scene.tweens.add({
            targets: this,
            wiggleOffsetX: { from: -1, to: 1 },
            duration: 50,
            yoyo: true,
            repeat: 1, // total ~100ms
            ease: 'Sine.easeInOut',
            onComplete: () => {
                this.wiggleOffsetX = 0;
                this.char.sweat('right');
            }
        });
    }

    public isAchieved(): boolean {
        return this.pullsCompleted >= TOTAL_PULLS;
    }
}