import { GAdventureContent } from "../scenes/GAdventureContent";
import { GAdventureUI } from "../scenes/GAdventureUI";
import { GBaseScene } from "../scenes/GBaseScene";
import { GTitleContent } from "../scenes/GTitleContent";
import { GBaseGameMode } from "./GBaseGameMode";

export class GAdventureMode extends GBaseGameMode{

    constructor() {
        super(
            'Adventure Mode',
            'AdventureContent',
            'AdventureUI'
        );
    }

}