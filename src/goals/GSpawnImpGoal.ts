import { GDirection } from "../GDirection";
import { GGoal } from "../GGoal";
import { GFF } from "../main";
import { GCharSprite } from "../objects/chars/GCharSprite";
import { GImpSprite } from "../objects/chars/GImpSprite";
import { GPlayerSprite } from "../objects/chars/GPlayerSprite";
import { GBaseScene } from "../scenes/GBaseScene";


export class GSpawnImpGoal extends GGoal {

    constructor(char: GImpSprite, timeOut: number) {
        super('spawn-imp', char, timeOut);

        char.anims.create({
            key: 'imp_puff',
            frames: char.anims.generateFrameNumbers(
                'imp_puff',
                { start: 0, end: 9 }
            ),
            frameRate: 10
        });

        // Cause the imp to appear in a puff of smoke!
        char.play('imp_puff');
        (char.scene as GBaseScene).getSound().playSound('imp_poof');
    }

    public doStep(): void {
        // No steps are necessary.
        // There is no goal to achieve. The spawn will just timeout.
    }

    public isAchieved(): boolean {
        // We'll just let this timeout, which will allow us to set a grace
        // period that can continue even after the animation has finished.

        // However, isAchieved() will always be checked before isTimedOut(),
        // so we can take this opportunity to set the imp's alpha once the
        // animation stops.
        if (!this.char.anims.isPlaying) {
            this.char.alpha = 0.35;
            this.char.walkDirection(GDirection.Dir9.NONE);
        }
        return false;
    }
}