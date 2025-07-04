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

    export const SKY_BLUE       = c(0xbbccff);


    function c(hexColor: number): GColor {
        return new GColor(hexColor);
    }
}