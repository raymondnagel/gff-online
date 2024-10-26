import 'phaser';
import { GFF } from '../main';
import { GContentScene } from './GContentScene';

export class GTitleContent extends GContentScene {

    constructor() {
        super("TitleContent");
        this.setContainingMode(GFF.TITLE_MODE);
    }

    public preload(): void {
    }

    public create(): void {
        const thisScene: GTitleContent = this;
        const centerX: number = this.cameras.main.width / 2;
        const centerY: number = this.cameras.main.height / 2;

        // Hide the mouse cursor, as it can't be used yet anyway;
        // It will be picked up again by the Adventure UI when moved.
        GFF.setMouseVisible(false);

        // Create the background image, set it invisible initially
        const background = this.add.image(0, 0, 'title_bg');
        background.setOrigin(0, 0);
        background.setVisible(false);

        // Create the title image, set it invisible initially
        const titleImage = this.add.image(centerX, centerY - 20, 'title_overlay');
        titleImage.setAlpha(0);

        // Create the prompt image, set it invisible initially
        const promptImage = this.add.image(centerX, this.cameras.main.height - 120, 'title_prompt');
        promptImage.setAlpha(0);

        // Play the intro sound
        const introSound = this.getSound().playSound('intro_w_drumroll');

        // Fade in the background while the intro music is playing
        this.fadeIn((introSound.duration * 1000) + 500, undefined, () => {
            background.setVisible(true);
        });

        // Once the intro sound finishes, fade in the title and play the theme music
        introSound.once('complete', () => {
            thisScene.time.delayedCall(835, () => {
                // Fade in the title
                thisScene.tweens.add({
                    targets: titleImage,
                    alpha: 1,
                    duration: 1000, // Fade in over a half second
                    ease: 'Linear',
                    onComplete: () => {
                        // Start blinking the "Press Enter" prompt after title image is fully faded in
                        this.tweens.add({
                            targets: promptImage,
                            alpha: { from: 0, to: 1 }, // Fade in and back out
                            duration: 700,             // Total duration for one blink (1 second)
                            yoyo: true,                // Yoyo makes it fade back out after fading in
                            repeat: -1,                // Repeat forever
                            ease: 'Linear'
                        });
                    }
                });

                // Play the looping theme music
                this.getSound().playMusic('battlecry');

                // Add event listener for pressing Enter to start the game
                thisScene.input.keyboard?.once('keydown-ENTER', () => {
                    this.getSound().fadeOutMusic(1000);
                    this.fadeOut(1000, undefined, () => {
                        GFF.ADVENTURE_MODE.switchTo(GFF.TITLE_MODE);
                    });
                });
            });
        });
    }

    public update(): void {
    }
}