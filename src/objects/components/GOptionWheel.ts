import { GFF } from "../../main";
import { GBaseScene } from "../../scenes/GBaseScene";
import { GTextEntryControl } from "./GTextEntryControl";

const DEFAULT_SCROLL_SPEED: number = 0.1;
const SLOW_SCROLL_SPEED: number = 0.1;
const MED_SCROLL_SPEED: number = 0.2;
const FAST_SCROLL_SPEED: number = 0.3;
const SLOW_SCROLL_THRESH: number = 1;
const MED_SCROLL_THRESH: number = 20;
const FAST_SCROLL_THRESH: number = 50;

export class GOptionWheel extends GTextEntryControl {
    private options: string[];
    private selectedIndex: number;
    private textObjects: Phaser.GameObjects.Text[];
    private maxVisibleOptions: number;
    private scrollProgress: number; // Track the scroll progress
    private scrollDirection: number; // Track scroll direction (-1 for up, 1 for down)
    private isScrolling: boolean; // Flag to indicate if the wheel is currently scrolling
    private scrollSpeed: number; // How fast the scroll should happen (e.g., 0.05 per frame)
    private wheelImage: Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene, x: number, y: number, options: string[]) {
        super(scene, x, y);
        this.options = options;
        this.selectedIndex = 0;
        this.maxVisibleOptions = 7;
        this.textObjects = [];
        this.scrollProgress = 0;
        this.scrollDirection = 0;
        this.isScrolling = false;
        this.scrollSpeed = DEFAULT_SCROLL_SPEED;

        this.wheelImage = scene.add.image(0, 0, 'option_wheel').setOrigin(.5, .5);
        this.add(this.wheelImage);
        this.createTextObjects(scene);
        this.updateDisplay();
        scene.add.existing(this);
    }

    private createTextObjects(scene: Phaser.Scene) {
        for (let i = 0; i < this.maxVisibleOptions; i++) {
            const text = scene.add.text(0, 0, "", {
                fontFamily: 'averia_serif',
                fontSize: '20px',
                color: '#000000'
           });
            text.setOrigin(0.5);
            this.add(text);
            this.textObjects.push(text);
        }
    }

    // Update the display based on current progress of the scroll
    private updateDisplay() {
        const scales = [0.30, 0.55, 0.80, 1.00, 0.80, 0.55, 0.30]; // scale values
        const usedOptions = new Set<number>(); // Track used options
        const centerIndex = 3; // The index in `scales` array where the center item is

        // Create an array to iterate starting from the center, then outward
        const displayOrder = [centerIndex, centerIndex - 1, centerIndex + 1, centerIndex - 2, centerIndex + 2, centerIndex - 3, centerIndex + 3];

        displayOrder.forEach((i) => {
            const optionIndex = this.normalizeIndex(this.selectedIndex - 3 + i);
            const text: Phaser.GameObjects.Text = this.textObjects[i];

            if (usedOptions.has(optionIndex)) {
                this.textObjects[i].setVisible(false); // Hide further duplicates
            } else {
                // Mark this option as used
                usedOptions.add(optionIndex);

                const baseY = (i - 3) * 20; // Starting position before scroll
                const baseScale = scales[i];

                if (optionIndex === this.selectedIndex && i === 3) {
                    text.setBackgroundColor('#a98358');
                } else {
                    text.setBackgroundColor('transparent');
                    if (optionIndex === this.selectedIndex && i !== 3) {
                        text.setVisible(false);
                    }
                }

                const incDir: number = -this.scrollDirection;

                // If scrolling, calculate intermediate position and scale

                const targetScale: number = i + incDir >= 0 && i + incDir < scales.length
                    ? scales[i + incDir]
                    : 0;

                const increment: number = targetScale - baseScale;

                const currentScale: number = baseScale + (increment * this.scrollProgress);

                const targetY: number = baseY - this.scrollDirection * 20 * this.scrollProgress;

                text.setText(this.options[optionIndex]);
                text.setPosition(0, targetY);
                text.setScale(1, currentScale);
                text.setVisible(true);
            }
        });
    }

    // Start scrolling in the given direction
    private startScroll(direction: number) {
        if (!this.isScrolling) {
            this.scrollDirection = direction;
            this.isScrolling = true;
            this.scrollProgress = 0;
        }
    }

    private setSpeedForRepeats(repeats: number) {
        if (repeats < SLOW_SCROLL_THRESH) {
            this.scrollSpeed = DEFAULT_SCROLL_SPEED;
        } else if (repeats < MED_SCROLL_THRESH) {
            this.scrollSpeed = SLOW_SCROLL_SPEED;
        } else if (repeats < FAST_SCROLL_THRESH) {
            this.scrollSpeed = MED_SCROLL_SPEED;
        } else {
            this.scrollSpeed = FAST_SCROLL_SPEED;
        }

        if (repeats < MED_SCROLL_THRESH) {
            (this.scene as GBaseScene).getSound().playSound('wheel_squeak');
        }
    }

    // Method to trigger scrolling up by one
    public scrollUp(repeats: number) {
        if (!this.isScrolling) {
            this.setSpeedForRepeats(repeats);
            this.startScroll(-1); // Scroll up
        }
    }

    // Method to trigger scrolling down by one
    public scrollDown(repeats: number) {
        if (!this.isScrolling) {
            this.setSpeedForRepeats(repeats);
            this.startScroll(1); // Scroll down
        }
    }

    public getEnteredText(): string {
        return this.textObjects[3].text;
    }

    // Called during the game’s preUpdate phase
    public preUpdate(time: number, delta: number) {
        if (this.isScrolling) {
            this.scrollProgress += this.scrollSpeed; // Increment the scroll progress

            if (this.scrollProgress >= 1) {
                // When scroll completes, finalize the state
                this.scrollProgress = 0;
                this.isScrolling = false;
                this.selectedIndex = this.normalizeIndex(this.selectedIndex + this.scrollDirection);
            }

            // Update the display based on the current progress
            this.updateDisplay();
        }
    }

    private normalizeIndex(index: number): number {
        return ((index % this.options.length) + this.options.length) % this.options.length;
    }
}