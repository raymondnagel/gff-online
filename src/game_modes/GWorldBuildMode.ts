import { GWorldBuildContent } from "../scenes/GWorldBuildContent";
import { GBaseGameMode } from "./GBaseGameMode";

export class GWorldBuildMode extends GBaseGameMode{

    constructor() {
        super('World Build Mode', 'WorldBuildContent');
    }
}