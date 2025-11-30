import { EFFECTS } from "../../effects";
import { GFF } from "../../main";
import { PLAYER } from "../../player";
import { SCENERY } from "../../scenery";
import { GTouchable } from "./GTouchable";

export class GHiddenTrap extends GTouchable {
    private triggered: boolean = false;

    constructor(x: number, y: number, stoneTint: number|undefined) {
        super(SCENERY.def('hidden_trap'), x, y);
        this.setOrigin(0, 0);
        this.setTint(stoneTint);
    }

    public canTouch(): boolean {
        return this.triggered === false;
    }

    public doTouch() {
        this.triggered = true;
        this.setVisible(false);
        PLAYER.getSprite().setTrapped(true);
        const sprite = EFFECTS.doEffect('trap_shut', GFF.AdventureContent, this.x + this.width / 2, this.y + this.height / 2, 0.5, 0.5).setDepth(this.getBottomCenter().y);

        // Drain some faith from the player over 1 second:
        const faithWrapper: {value: number} = {value: PLAYER.getFaith()};
        const drainAmount: number = Math.floor(PLAYER.getMaxFaith() * GFF.getDifficulty().trapStrengthPct);
        const newFaith: number = Math.max(0, Math.floor(PLAYER.getFaith() - drainAmount));
        GFF.AdventureContent.tweens.add({
            targets: [faithWrapper],
            duration: 500,
            value: newFaith,
            onUpdate: () => {
                PLAYER.setFaith(Math.floor(faithWrapper.value));
            }
        });

        // After faith is drained, free the player from the trap and remove the trap object:
        GFF.AdventureContent.time.delayedCall(2000, () => {
            GFF.AdventureContent.setVisualsByFaith();
            GFF.AdventureContent.tweens.add({
                targets: sprite,
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    sprite.destroy();
                    this.destroy();
                    PLAYER.getSprite().setTrapped(false);
                    if (PLAYER.getFaith() <= 0) {
                        GFF.AdventureContent.startFaithlessMode();
                    }
                }
            });
        });
    }

}