import { GFF } from "../main";
import { GBaseScene } from "../scenes/GBaseScene";
import { GTitleContent } from "../scenes/GTitleContent";
import { GBaseGameMode } from "./GBaseGameMode";

export class GTitleMode extends GBaseGameMode{

    constructor() {
        super('Title Mode', 'TitleContent');
    }

}