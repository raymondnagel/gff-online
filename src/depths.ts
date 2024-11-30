export namespace DEPTH {

    export const TRANSITION = 99999;

    export const CONV_BUBBLE = 9999;

    export const FLOAT_TEXT = 9999;

    export const VISION = 8000;

    export const NAME_TAG = 7000;

    export const WALL_S_CORNER = 1002;

    export const WALL_SOUTH = 1001;

    // Bottom-sorted scenery should never be > 1000


    // Ensure that north and side walls always appear behind bottom-sorted scenery
    export const WALL_N_CORNER = -1001;
    export const WALL_SIDE = -1002;
    export const WALL_NORTH = -1003;


    // Background should always be behind everything else
    export const BG_DECOR = -99997;
    export const FADE_IMAGE = -99998;
    export const BACKGROUND = -99999;
}