import { GFF } from "../main";
import { GContentScene } from "./GContentScene";


export class GMainMenuContent extends GContentScene {


    constructor() {
        super("MainMenuContent");

        this.setContainingMode(GFF.MAINMENU_MODE);
    }

    public preload(): void {
    }

    public create(): void {
    }

    public update(_time: number, _delta: number): void {
    }
}