import { GPoint2D } from "./types";

/**
 * Collection of utility functions for working with animations.
 */
export namespace ANIM {

    export function wiggle(
        scene: Phaser.Scene,
        targets: Phaser.GameObjects.GameObject[],
        nextStep: Function
    ): void {

        const points: GPoint2D[] = [
            { x: 0,  y: -5 },
            { x: 3,  y: 10 },
            { x: -8, y: -6 },
            { x: 10, y: 0 },
            { x: -8, y: 6 },
            { x: 3,  y: -5 }
        ];

        scene.tweens.chain({
            targets,
            tweens: points.map((p) => ({
                x: `+=${p.x}`,
                y: `+=${p.y}`,
                duration: 60,
                ease: 'Linear'
            })),
            onComplete: () => {
                nextStep();
            }
        });
    }
}