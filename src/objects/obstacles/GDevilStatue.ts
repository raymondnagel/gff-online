import { DEPTH } from "../../depths";
import { EFFECTS } from "../../effects";
import { GFF } from "../../main";
import { SCENERY } from "../../scenery";
import { GDevilStatueTrigger } from "../../triggers/GDevilStatueTrigger";
import { GObstacleStatic } from "./GObstacleStatic";

export class GDevilStatue extends GObstacleStatic {

    constructor(x: number, y: number) {
        const def = SCENERY.def('devil_statue');
        super(def, x, y);
        this.setOrigin(0, 0);
    }

    public addTrigger() {
        // This is called when the statue is added to the scene,
        // which means the room is already loaded. We can add the trigger now.
        const trigger = new GDevilStatueTrigger(
            this,
            this.body!.x + (this.body!.width / 2),
            this.body!.y + (this.body!.height / 2)
        );
        GFF.AdventureContent.getCurrentRoom()!.addTemporaryEventTrigger(trigger);
    }

    public burst() {
        const effectSprite: Phaser.Physics.Arcade.Sprite = EFFECTS.doEffect('statue_burst', GFF.AdventureContent, this.x - 30, this.y - 13);
        effectSprite.setDepth(DEPTH.SPECIAL_EFFECT);
        this.destroy();
    }
}