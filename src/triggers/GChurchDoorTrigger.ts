import { EFFECTS } from "../effects";
import { GFF } from "../main";
import { PHYSICS } from "../physics";
import { PLAYER } from "../player";
import { GPoint, GRect } from "../types";
import { GEventTrigger } from "./GEventTrigger";

export class GChurchDoorTrigger extends GEventTrigger {

    private triggerArea: GRect;
    private doorOpenLocation: GPoint;
    private doorSpriteDepth: number;

    constructor(triggerArea: GRect, doorOpenLocation: GPoint, doorSpriteDepth: number) {
        super('church door opening', 1);
        this.triggerArea = triggerArea;
        this.doorOpenLocation = doorOpenLocation;
        this.doorSpriteDepth = doorSpriteDepth;
    }

    protected condition(): boolean {
        return PHYSICS.isCenterWithin(PLAYER.getSprite(), this.triggerArea);
    }

    protected action(): void {
        const sprite: Phaser.Physics.Arcade.Sprite = EFFECTS.doEffect('church_door', GFF.AdventureContent, this.doorOpenLocation.x, this.doorOpenLocation.y);
        sprite.setDepth(this.doorSpriteDepth);
        sprite.once('animationcomplete', () => {
            PLAYER.getSprite().setVisible(true);
        });
    }

}