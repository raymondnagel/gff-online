import { GFF } from "./main";
import { GBaseScene } from "./scenes/GBaseScene";
import { SpriteEffect } from "./types";

export namespace EFFECTS {

    const SPRITE_EFFECTS: Map<string, SpriteEffect> = new Map<string, SpriteEffect>();

    export function initSpriteEffects() {
        [
            {
                spriteConfig: {
                    key: 'church_door',
                    frames: GFF.GAME.anims.generateFrameNumbers(
                        'church_door',
                        { start: 0, end: 6 }
                    ),
                    frameRate: 15,
                    repeat: 0
                },
                soundKey: 'open_chest',
                hideOnFinish: false
            },
            {
                spriteConfig: {
                    key: 'preach_sonic',
                    frames: GFF.GAME.anims.generateFrameNumbers(
                        'preach_sonic',
                        { start: 0, end: 9 }
                    ),
                    frameRate: 12,
                    repeat: 0
                },
                soundKey: 'gentle_ding',
                hideOnFinish: true
            },
            {
                spriteConfig: {
                    key: 'silent_flash',
                    frames: GFF.GAME.anims.generateFrameNumbers(
                        'flash',
                        { start: 0, end: 9 }
                    ),
                    frameRate: 12,
                    repeat: 0
                },
                soundKey: null, // No sound; since multiple flashes can occur at once, a single sound will be played independently
                hideOnFinish: true
            }

        ].forEach(s => {
            SPRITE_EFFECTS.set(s.spriteConfig.key, s as SpriteEffect);
        });
    }

    export function doEffect(effectName: string, scene: GBaseScene, x: number, y: number, originX: number = 0, originY: number = 0): Phaser.Physics.Arcade.Sprite {
        const effect: SpriteEffect = SPRITE_EFFECTS.get(effectName) as SpriteEffect;

        // Set up the sprite animation:
        const animation: Phaser.Animations.Animation = scene.anims.create(effect.spriteConfig) as Phaser.Animations.Animation;
        const sprite: Phaser.Physics.Arcade.Sprite = new Phaser.Physics.Arcade.Sprite(scene, x, y, animation.getFrameAt(0).frame.texture);
        sprite.setOrigin(originX, originY);
        scene.add.existing(sprite);
        sprite.setVisible(true);

        // If hideOnFinish, delete the sprite when it completes;
        // with hideOnFinish false, we can use effects to
        if (effect.hideOnFinish) {
            sprite.once('animationcomplete', () => {
                sprite.destroy();
            });
        }

        // Play the animation and the sound simultaneously:
        sprite.play(animation);
        if (effect.soundKey !== null) {
            scene.getSound().playSound(effect.soundKey);
        }

        // Return the sprite, in case we want to do something with it:
        return sprite;
    }
}