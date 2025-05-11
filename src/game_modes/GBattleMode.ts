import { GPoint2D } from "../types";
import { GBaseGameMode } from "./GBaseGameMode";

export class GBattleMode extends GBaseGameMode{

    private bgImageName: string;
    private encounterPoint: GPoint2D;

    constructor() {
        super('Battle Mode', 'BattleContent');
    }

    // Replace this later with initForArea(Area), and pull a background image from Area:
    public setBgImage(imageName: string) {
        this.bgImageName = imageName;
    }

    public getBgImage(): string {
        return this.bgImageName;
    }
}