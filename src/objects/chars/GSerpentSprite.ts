import { GFF } from "../../main";
import { GPoint2D } from "../../types";

const SERPENT_SLITHER_ANIM: string = 'serpent_slither';
const SERPENT_SPLAT_ANIM: string = 'serpent_splat';
const SERPENT_SLITHER_FRAME_RATE: number = 16;
const SERPENT_SLITHER_FRAME_COUNT: number = 16;
const SERPENT_SPLAT_FRAME_RATE: number = 15;
const SERPENT_SLITHER_CYCLE_MS: number = 1000;
const SERPENT_SLITHER_DISTANCE: number = 56;
const SERPENT_SLITHER_PAUSE_MS: number = 500;
const SERPENT_TURN_RADIANS_PER_CYCLE: number = Math.PI / 2;
const WAYPOINT_REACHED_DISTANCE: number = 12;

/**
 * The serpent is not a normal character sprite. It has only one south-facing
 * slither animation, and turns by rotating that animation toward its movement.
 */
export class GSerpentSprite extends Phaser.GameObjects.Sprite {

    private slithering: boolean = false;

    constructor(x: number, y: number) {
        super(GFF.AdventureContent, x, y, SERPENT_SLITHER_ANIM, 0);
        this.setOrigin(0.5, 0.5);
        GFF.AdventureContent.add.existing(this);
        this.createAnimations();
    }

    public slitherTo(point: GPoint2D, onComplete?: Function): void {
        this.slithering = true;
        this.slitherCycle(point, onComplete);
    }

    public slitherThrough(points: GPoint2D[], onComplete?: Function): void {
        if (points.length === 0) {
            onComplete?.call(this);
            return;
        }

        this.slithering = true;
        this.slitherPathCycle(points, 0, onComplete);
    }

    public stopSlithering(): void {
        this.slithering = false;
        this.stop();
        this.setFrame(0);
    }

    public splat(): void {
        this.stopSlithering();
        GFF.AdventureContent.getSound().playSound('splat');
        this.play(SERPENT_SPLAT_ANIM);
    }

    private slitherCycle(destination: GPoint2D, onComplete?: Function): void {
        if (!this.slithering) {
            return;
        }

        const distance = Phaser.Math.Distance.Between(this.x, this.y, destination.x, destination.y);
        if (distance <= SERPENT_SLITHER_DISTANCE) {
            this.playSlitherCycle(destination, () => {
                this.setPosition(destination.x, destination.y);
                this.stopSlithering();
                onComplete?.call(this);
            });
            return;
        }

        this.playSlitherCycle(destination, () => {
            this.stop();
            this.setFrame(0);
            GFF.AdventureContent.time.delayedCall(SERPENT_SLITHER_PAUSE_MS, () => {
                this.slitherCycle(destination, onComplete);
            });
        });
    }

    private playSlitherCycle(destination: GPoint2D, onComplete: Function): void {
        const progress: { value: number } = { value: 0 };
        let lastProgress: number = 0;
        let reachedDestination: boolean = false;

        this.play(SERPENT_SLITHER_ANIM);
        GFF.AdventureContent.time.delayedCall(SERPENT_SLITHER_CYCLE_MS / 2, () => {
            GFF.AdventureContent.getSound().playSound('hiss');
        });
        GFF.AdventureContent.tweens.add({
            targets: progress,
            value: SERPENT_SLITHER_DISTANCE,
            duration: SERPENT_SLITHER_CYCLE_MS,
            ease: 'Linear',
            onUpdate: () => {
                if (reachedDestination) {
                    return;
                }

                const stepDistance = progress.value - lastProgress;
                lastProgress = progress.value;

                const distanceToDestination = Phaser.Math.Distance.Between(this.x, this.y, destination.x, destination.y);
                if (distanceToDestination <= stepDistance) {
                    this.setPosition(destination.x, destination.y);
                    reachedDestination = true;
                    return;
                }

                const turnStep = (stepDistance / SERPENT_SLITHER_DISTANCE) * SERPENT_TURN_RADIANS_PER_CYCLE;
                const currentHeading = this.getHeadingRadians();
                const targetHeading = Phaser.Math.Angle.Between(this.x, this.y, destination.x, destination.y);
                const newHeading = Phaser.Math.Angle.RotateTo(currentHeading, targetHeading, turnStep);

                this.angle = Phaser.Math.RadToDeg(newHeading) - 90;
                this.x += Math.cos(newHeading) * stepDistance;
                this.y += Math.sin(newHeading) * stepDistance;
            },
            onComplete: () => {
                onComplete();
            }
        });
    }

    private slitherPathCycle(points: GPoint2D[], waypointIndex: number, onComplete?: Function): void {
        if (!this.slithering) {
            return;
        }

        const progress: { value: number } = { value: 0 };
        let lastProgress: number = 0;
        let currentWaypointIndex = waypointIndex;
        let reachedFinalPoint = false;

        this.play(SERPENT_SLITHER_ANIM);
        GFF.AdventureContent.time.delayedCall(SERPENT_SLITHER_CYCLE_MS / 2, () => {
            GFF.AdventureContent.getSound().playSound('hiss');
        });
        GFF.AdventureContent.tweens.add({
            targets: progress,
            value: SERPENT_SLITHER_DISTANCE,
            duration: SERPENT_SLITHER_CYCLE_MS,
            ease: 'Linear',
            onUpdate: () => {
                if (reachedFinalPoint) {
                    return;
                }

                const stepDistance = progress.value - lastProgress;
                lastProgress = progress.value;
                reachedFinalPoint = this.moveAlongPath(points, currentWaypointIndex, stepDistance);

                while (
                    currentWaypointIndex < points.length - 1 &&
                    Phaser.Math.Distance.Between(
                        this.x,
                        this.y,
                        points[currentWaypointIndex].x,
                        points[currentWaypointIndex].y
                    ) <= WAYPOINT_REACHED_DISTANCE
                ) {
                    currentWaypointIndex++;
                }
            },
            onComplete: () => {
                if (reachedFinalPoint) {
                    this.stopSlithering();
                    onComplete?.call(this);
                    return;
                }

                this.stop();
                this.setFrame(0);
                GFF.AdventureContent.time.delayedCall(SERPENT_SLITHER_PAUSE_MS, () => {
                    this.slitherPathCycle(points, currentWaypointIndex, onComplete);
                });
            }
        });
    }

    private moveAlongPath(points: GPoint2D[], waypointIndex: number, stepDistance: number): boolean {
        const targetPoint = points[waypointIndex];
        const isFinalPoint = waypointIndex === points.length - 1;
        const distanceToTarget = Phaser.Math.Distance.Between(this.x, this.y, targetPoint.x, targetPoint.y);

        if (isFinalPoint && distanceToTarget <= stepDistance) {
            this.setPosition(targetPoint.x, targetPoint.y);
            return true;
        }

        const turnStep = (stepDistance / SERPENT_SLITHER_DISTANCE) * SERPENT_TURN_RADIANS_PER_CYCLE;
        const currentHeading = this.getHeadingRadians();
        const targetHeading = Phaser.Math.Angle.Between(this.x, this.y, targetPoint.x, targetPoint.y);
        const newHeading = Phaser.Math.Angle.RotateTo(currentHeading, targetHeading, turnStep);

        this.angle = Phaser.Math.RadToDeg(newHeading) - 90;
        this.x += Math.cos(newHeading) * stepDistance;
        this.y += Math.sin(newHeading) * stepDistance;

        return false;
    }

    private getHeadingRadians(): number {
        return Phaser.Math.DegToRad(this.angle + 90);
    }

    private createAnimations(): void {
        const scene = GFF.AdventureContent;
        if (!scene.anims.exists(SERPENT_SLITHER_ANIM)) {
            scene.anims.create({
                key: SERPENT_SLITHER_ANIM,
                frames: scene.anims.generateFrameNumbers(SERPENT_SLITHER_ANIM, {
                    start: 0,
                    end: SERPENT_SLITHER_FRAME_COUNT - 1
                }),
                frameRate: SERPENT_SLITHER_FRAME_RATE,
                repeat: 0
            });
        }

        if (!scene.anims.exists(SERPENT_SPLAT_ANIM)) {
            scene.anims.create({
                key: SERPENT_SPLAT_ANIM,
                frames: scene.anims.generateFrameNumbers(SERPENT_SPLAT_ANIM),
                frameRate: SERPENT_SPLAT_FRAME_RATE,
                repeat: 0
            });
        }
    }
}
