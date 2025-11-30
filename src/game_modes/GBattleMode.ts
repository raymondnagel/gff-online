import { GPoint2D } from "../types";
import { GBaseGameMode } from "./GBaseGameMode";

export class GBattleMode extends GBaseGameMode{

    private bgImageName: string;
    private bgStoneTint: number|undefined;
    private encounterPoint: GPoint2D;

    constructor() {
        super('Battle Mode', 'BattleContent');
    }

    // Replace this later with initForArea(Area), and pull a background image from Area:
    public setBgImage(imageName: string): void {
        this.bgImageName = imageName;
    }

    public getBgImage(): string {
        return this.bgImageName;
    }

    public setBgStoneTint(tint: number|undefined): void {
        this.bgStoneTint = tint;
    }

    public getBgStoneTint(): number|undefined {
        return this.bgStoneTint;
    }
}