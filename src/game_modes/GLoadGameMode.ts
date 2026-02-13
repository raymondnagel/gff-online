import { GLoadGameContent } from "../scenes/GLoadGameContent";
import { GBaseGameMode } from "./GBaseGameMode";

export class GLoadGameMode extends GBaseGameMode{

    constructor() {
        super('Load Game Mode', 'LoadGameContent');
    }
}