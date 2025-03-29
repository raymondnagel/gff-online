import { GFF } from "../../main";
import { SCENERY } from "../../scenery";
import { GInteractable } from "../../types";
import { GObstacleStatic } from "../obstacles/GObstacleStatic";

export class GPiano extends GObstacleStatic implements GInteractable {

    constructor(x: number, y: number) {
        super(SCENERY.def('church_piano'), x, y);
        this.setOrigin(0, 0);
    }

    public interact(): void {
        GFF.AdventureContent.playerPlayPiano(this);
    }

}