import { GFF } from "../../main";
import { SCENERY } from "../../scenery";
import { GTouchable } from "./GTouchable";

export class GIllusionaryBlock extends GTouchable {
    private illusionActive: boolean = true;

    constructor(x: number, y: number) {
        super(SCENERY.def('wall_block'), x, y);
        this.setOrigin(0, 0);
    }

    public canTouch(): boolean {
        return this.illusionActive;
    }

    public setIllusionActive(illusionActive: boolean) {
        this.body!.enable = illusionActive;
        this.setVisible(illusionActive);
    }

    public doTouch() {
        this.body!.enable = false;
        GFF.AdventureContent.getSound().playSound('dispel');
        GFF.AdventureContent.tweens.add({
            targets: this,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                this.destroy();
            }
        });
    }

}