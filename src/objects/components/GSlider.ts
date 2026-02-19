import { COLOR } from "../../colors";
import { PHYSICS } from "../../physics";
import { GRect } from "../../types";

export type SliderLabel = string|{ t: number; text: string };

export type SliderSnapMode = 'none'|'labels';

interface GSliderOptions {
    trackHeight?: number;
    trackColor?: number;
    fillColor?: number;
    thumbColor?: number;
    thumbOutlineColor?: number;
    thumbWidth?: number;
    thumbHeight?: number;
    labelFontKey?: string;
    labelStyle?: Phaser.Types.GameObjects.Text.TextStyle;
    showTicks?: boolean;
    tickHeight?: number;
    labelYOffset?: number;
    snapMode?: SliderSnapMode;
    snapOnDrag?: boolean;
    snapThresholdT?: number;
    interactiveTrack?: boolean;
}

export class GSlider extends Phaser.GameObjects.Container {
    private viewport: GRect;

    private track: Phaser.GameObjects.Rectangle;
    private fill: Phaser.GameObjects.Rectangle;

    private thumb: Phaser.GameObjects.Graphics;
    private thumbDragOffsetX = 0;

    private t: number = 0;

    private labels: { t: number; text: string }[] = [];
    private labelTexts: Phaser.GameObjects.Text[] = [];
    private labelTicks: Phaser.GameObjects.Rectangle[] = [];

    private opts: Required<GSliderOptions>;

    private onChange?: (t: number) => void;
    private onCommit?: (t: number) => void;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        width: number,
        options: GSliderOptions = {}
    ) {
        super(scene, x, y);

        this.opts = {
            trackHeight: options.trackHeight ?? 4,
            trackColor: options.trackColor ?? 0x444444,
            fillColor: options.fillColor ?? COLOR.GREY_2.num(),
            thumbColor: options.thumbColor ?? COLOR.GREY_3.num(),
            thumbOutlineColor: options.thumbOutlineColor ?? COLOR.GREY_1.num(),
            thumbWidth: options.thumbWidth ?? 16,
            thumbHeight: options.thumbHeight ?? 18,
            labelFontKey: options.labelFontKey ?? '',
            labelStyle: options.labelStyle ?? {
                fontFamily: 'Arial',
                fontStyle: 'bold',
                fontSize: '12px',
                color: COLOR.GREY_1.str()
            },
            showTicks: options.showTicks ?? true,
            tickHeight: options.tickHeight ?? 14,
            labelYOffset: options.labelYOffset ?? 10,
            snapMode: options.snapMode ?? 'none',
            snapOnDrag: options.snapOnDrag ?? false,
            snapThresholdT: options.snapThresholdT ?? 1,
            interactiveTrack: options.interactiveTrack ?? true,
        };

        this.viewport = { x, y, width, height: Math.max(24, this.opts.thumbHeight + 20) };

        // Track + fill (origin left/midline)
        const trackY = 0;
        this.track = scene.add.rectangle(0, trackY, width, this.opts.trackHeight, this.opts.trackColor).setOrigin(0, 0.5);
        this.fill = scene.add.rectangle(0, trackY, 0, this.opts.trackHeight, this.opts.fillColor).setOrigin(0, 0.5);

        this.add(this.track);
        this.add(this.fill);

        // Thumb (house shape)
        this.thumb = scene.add.graphics();
        this.redrawThumb();
        this.add(this.thumb);

        // Interactions
        this.thumb.setInteractive(
            new Phaser.Geom.Rectangle(0, 0, this.opts.thumbWidth, this.opts.thumbHeight),
            Phaser.Geom.Rectangle.Contains
        );
        this.scene.input.setDraggable(this.thumb);

        this.thumb.on('dragstart', (pointer: Phaser.Input.Pointer) => {
            // pointer is in world coords; thumb position is local to container
            const localPointerX = pointer.x - this.x;
            this.thumbDragOffsetX = localPointerX - this.thumb.x;
        });

        this.thumb.on('drag', (pointer: Phaser.Input.Pointer) => {
            const localPointerX = pointer.x - this.x;
            const desiredX = localPointerX - this.thumbDragOffsetX;
            this.setThumbX(desiredX, true);
        });

        this.thumb.on('dragend', () => {
            this.maybeSnap(true);
            this.onCommit?.(this.t);
        });

        if (this.opts.interactiveTrack) {
            this.track.setInteractive();
            this.track.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
                // jump to click
                const localX = pointer.x - this.x;
                this.setThumbX(localX - this.opts.thumbWidth / 2, true);
                this.maybeSnap(true);
                this.onCommit?.(this.t);
            });
        }

        // Initial layout
        this.setT(0, false);

        this.setSize(width, this.viewport.height);
        scene.add.existing(this);
    }

    public getT(): number {
        return this.t;
    }

    public setT(t: number, emit: boolean = true): void {
        this.t = Phaser.Math.Clamp(t, 0, 1);
        const x = this.tToThumbX(this.t);
        this.thumb.setPosition(x, -this.opts.thumbHeight / 2);
        this.updateFill();
        if (emit) {
            this.onChange?.(this.t);
        }
    }

    public simEvent(event: 'change' | 'commit'): void {
        if (event === 'change') {
            this.onChange?.(this.t);
        } else if (event === 'commit') {
            this.onCommit?.(this.t);
        }
    }

    public setLabels(labels: SliderLabel[], snapMode?: SliderSnapMode): void {
        this.labels = this.normalizeLabels(labels);
        if (snapMode) this.opts.snapMode = snapMode;
        this.rebuildLabels();
        // if snapping is active, ensure current value is aligned if desired
        if (this.opts.snapMode === 'labels') {
            this.maybeSnap(true);
        }
    }

    public setSnapMode(mode: SliderSnapMode): void {
        this.opts.snapMode = mode;
    }

    public setOnChange(callback: (t: number) => void): void {
        this.onChange = callback;
    }

    public setOnCommit(callback: (t: number) => void): void {
        this.onCommit = callback;
    }

    public setVisible(visible: boolean): this {
        super.setVisible(visible);
        this.track.setVisible(visible);
        this.fill.setVisible(visible);
        this.thumb.setVisible(visible);
        for (const obj of this.labelTexts) obj.setVisible(visible);
        for (const obj of this.labelTicks) obj.setVisible(visible);
        return this;
    }

    // --- Internal helpers ---

    private tToThumbX(t: number): number {
        const minX = 0;
        const maxX = this.viewport.width - this.opts.thumbWidth;
        return minX + t * (maxX - minX);
    }

    private thumbXToT(thumbX: number): number {
        const minX = 0;
        const maxX = this.viewport.width - this.opts.thumbWidth;
        const clamped = Phaser.Math.Clamp(thumbX, minX, maxX);
        return (clamped - minX) / Math.max(1, (maxX - minX));
    }

    private setThumbX(thumbX: number, emit: boolean): void {
        const minX = 0;
        const maxX = this.viewport.width - this.opts.thumbWidth;
        const clampedX = Phaser.Math.Clamp(thumbX, minX, maxX);

        this.thumb.x = clampedX;
        this.t = this.thumbXToT(clampedX);
        this.updateFill();

        if (this.opts.snapOnDrag) {
            this.maybeSnap(false);
        }

        if (emit) this.onChange?.(this.t);
    }

    private updateFill(): void {
        // Fill to the *tip* of the house (center-ish). Adjust if you prefer exact alignment to the tip.
        const tipX = this.thumb.x + this.opts.thumbWidth / 2;
        this.fill.width = Phaser.Math.Clamp(tipX, 0, this.viewport.width);
    }

    private redrawThumb(): void {
        const w = this.opts.thumbWidth;
        const h = this.opts.thumbHeight;

        const flatTopY = 0;
        const baseBottomY = h * 0.65;
        const tipY = h;

        this.thumb.clear();

        this.thumb.beginPath();
        this.thumb.moveTo(0, flatTopY);              // top-left
        this.thumb.lineTo(w, flatTopY);              // top-right
        this.thumb.lineTo(w, baseBottomY);           // bottom-right (before tip)
        this.thumb.lineTo(w / 2, tipY);              // tip (center bottom)
        this.thumb.lineTo(0, baseBottomY);           // bottom-left (before tip)
        this.thumb.closePath();

        this.thumb.fillStyle(this.opts.thumbColor, 1);
        this.thumb.fillPath();

        if (this.opts.thumbOutlineColor !== 0) {
            this.thumb.lineStyle(1, this.opts.thumbOutlineColor, 1);
            this.thumb.strokePath();
        }
    }

    private normalizeLabels(labels: SliderLabel[]): { t: number; text: string }[] {
        if (!labels || labels.length === 0) return [];

        // If it's string[] => distribute evenly
        const allStrings = labels.every(l => typeof l === 'string');
        if (allStrings) {
            const texts = labels as string[];
            if (texts.length === 1) {
                return [{ t: 0.5, text: texts[0] }];
            }
            return texts.map((text, i) => ({
                t: i / (texts.length - 1),
                text
            }));
        }

        // Mixed or explicit objects => filter + clamp
        const objs = labels
            .filter(l => typeof l !== 'string')
            .map(l => l as { t: number; text: string })
            .map(l => ({ t: Phaser.Math.Clamp(l.t, 0, 1), text: l.text }));

        // Sort by position for stable snapping
        objs.sort((a, b) => a.t - b.t);
        return objs;
    }

    private rebuildLabels(): void {
        // destroy old
        for (const obj of this.labelTexts) obj.destroy();
        for (const obj of this.labelTicks) obj.destroy();
        this.labelTexts = [];
        this.labelTicks = [];

        if (this.labels.length === 0) return;

        const yBase = this.opts.trackHeight / 2;

        for (const lab of this.labels) {
            const x = this.tToThumbX(lab.t) + this.opts.thumbWidth / 2;

            if (this.opts.showTicks) {
                const tick = this.scene.add.rectangle(x, yBase + this.opts.labelYOffset, 1, this.opts.tickHeight, COLOR.GREY_1.num())
                    .setOrigin(0.5, 1);
                this.add(tick);
                this.labelTicks.push(tick);
            }

            // Text label
            const txt = this.scene.add.text(x, yBase + this.opts.labelYOffset, lab.text, this.opts.labelStyle)
                .setOrigin(0.5, 0);
            this.add(txt);
            this.labelTexts.push(txt);
        }

        this.bringToTop(this.thumb);
    }

    private maybeSnap(isRelease: boolean): void {
        if (this.opts.snapMode !== 'labels') return;
        if (!this.labels || this.labels.length === 0) return;
        if (!isRelease && !this.opts.snapOnDrag) return;

        // Find nearest label
        let best = this.labels[0];
        let bestDist = Math.abs(this.t - best.t);
        for (let i = 1; i < this.labels.length; i++) {
            const d = Math.abs(this.t - this.labels[i].t);
            if (d < bestDist) {
                bestDist = d;
                best = this.labels[i];
            }
        }

        // Threshold (if snapThresholdT < 1, only snap when close enough)
        if (this.opts.snapThresholdT < 1 && bestDist > this.opts.snapThresholdT) return;

        this.setT(best.t);
    }
}
