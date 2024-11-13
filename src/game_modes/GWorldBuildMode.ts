import { GWorldBuildContent } from "../scenes/GWorldBuildContent";
import { GBaseGameMode } from "./GBaseGameMode";

export class GWorldBuildMode extends GBaseGameMode{

    constructor() {
        super('World Build Mode', 'WorldBuildContent');
    }

    public setProgress(description: string, current: number, goal: number) {
        (this.getContentScene() as GWorldBuildContent).setProgress(description, current, goal);
    }
}