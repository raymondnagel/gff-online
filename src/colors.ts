import { GColor } from "./types";

export namespace COLOR {

    export const BLACK          = c(0x000000);
    export const GREY_1         = c(0x222222);
    export const GREY_2         = c(0x444444);
    export const GREY_3         = c(0x666666);
    export const GREY_4         = c(0x888888);
    export const GREY_5         = c(0xaaaaaa);
    export const WHITE          = c(0xffffff);

    export const RED            = c(0xff0000);
    export const GREEN          = c(0x00ff00);
    export const BLUE           = c(0x0000ff);
    export const YELLOW         = c(0xffff00);

    export const SKY_BLUE       = c(0xbbccff);

    export const GOLD_1         = c(0xb87b3d);
    export const GOLD_2         = c(0xd7b375);
    export const GOLD_3         = c(0xd7c97f);


    function c(hexColor: number): GColor {
        return new GColor(hexColor);
    }

    export function getSerialColors(length: number) {
        // Initial high-contrast, recognizable colors (visually distinct and named)
        const baseHexes = [
            0xff0000, // red
            0x00ff00, // green
            0x0000ff, // blue
            0xffff00, // yellow
            0xff00ff, // magenta
            0x00ffff, // cyan
            0xff8000, // orange
            0x8000ff, // purple
            0x00ff80, // mint
            0x808000, // olive
        ];

        const colors: ReturnType<typeof c>[] = [];

        // If we only need a few, return the early ones (they're the most distinct)
        if (length <= baseHexes.length) {
            for (let i = 0; i < length; i++) colors.push(c(baseHexes[i]));
            return colors;
        }

        // Add all base colors first
        for (const hex of baseHexes) colors.push(c(hex));

        const extraNeeded = length - baseHexes.length;
        const goldenRatio = 0.61803398875;
        let hue = 0.27; // fixed start hue for stability across runs

        for (let i = 0; i < extraNeeded; i++) {
            hue += goldenRatio;
            hue %= 1;

            // Alternate saturation and value slightly to improve contrast
            const saturation = 0.75 + 0.2 * ((i % 2 === 0) ? 1 : -1);
            const value = 0.85 + 0.1 * ((i % 3) / 2); // vary brightness subtly

            const rgb = hsvToRgb(hue * 360, saturation, value);
            const hex = (rgb.r << 16) | (rgb.g << 8) | rgb.b;
            colors.push(c(hex));
        }

        return colors.slice(0, length);
    }

    // HSV → RGB converter
    function hsvToRgb(h: number, s: number, v: number) {
        const c = v * s;
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        const m = v - c;
        let r = 0, g = 0, b = 0;

        if (h < 60)      { r = c; g = x; b = 0; }
        else if (h < 120){ r = x; g = c; b = 0; }
        else if (h < 180){ r = 0; g = c; b = x; }
        else if (h < 240){ r = 0; g = x; b = c; }
        else if (h < 300){ r = x; g = 0; b = c; }
        else             { r = c; g = 0; b = x; }

        return {
            r: Math.round((r + m) * 255),
            g: Math.round((g + m) * 255),
            b: Math.round((b + m) * 255),
        };
    }
}