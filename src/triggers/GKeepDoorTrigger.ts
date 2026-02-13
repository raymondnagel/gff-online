import { EFFECTS } from "../effects";
import { GFF } from "../main";
import { PLAYER } from "../player";
import { GPoint2D } from "../types";
import { GEventTrigger } from "./GEventTrigger";

export class GKeepDoorTrigger extends GEventTrigger {

    private triggerPoint: GPoint2D;
    private doorOpenLocation: GPoint2D;
    private doorSpriteDepth: number;

    constructor(doorOpenLocation: GPoint2D, doorSpriteDepth: number) {
        super('keep door opening', 1);
        this.doorOpenLocation = doorOpenLocation;
        this.doorSpriteDepth = doorSpriteDepth;
        // Set the trigger point to be at the center-bottom of the door
        this.triggerPoint = {x: doorOpenLocation.x + 90, y: doorOpenLocation.y + 166};
    }

    protected condition(): boolean {
        return PLAYER.getFaith() > 0 && Phaser.Math.Distance.BetweenPoints(this.triggerPoint, PLAYER.getSprite().getPhysicalCenter()) < 100;
    }

    protected action(): void {
        const sprite: Phaser.Physics.Arcade.Sprite = EFFECTS.doEffect('keep_door', GFF.AdventureContent, this.doorOpenLocation.x, this.doorOpenLocation.y);
        sprite.setDepth(this.doorSpriteDepth);
        sprite.once('animationcomplete', () => {
            PLAYER.getSprite().setVisible(true);
        });
    }

}