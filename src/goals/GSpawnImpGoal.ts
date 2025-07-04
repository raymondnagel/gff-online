import { GGoal } from "./GGoal";
import { GImpSprite } from "../objects/chars/GImpSprite";
import { GBaseScene } from "../scenes/GBaseScene";
import { Dir9 } from "../types";
import { GFF } from "../main";


export class GSpawnImpGoal extends GGoal {

    constructor(timeOut: number) {
        super('spawn-imp', timeOut);
    }

    public start(): void {
        const char: GImpSprite = this.char as GImpSprite;
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

    public doStep(_time: number, _delta: number): void {
        // No steps are necessary.
        // There is no goal to achieve. The spawn will just timeout.
    }

    public isAchieved(): boolean {
        // We'll just let this timeout, which will allow us to set a grace
        // period that can continue even after the animation has finished.

        // However, isAchieved() will always be checked before isTimedOut(),
        // so we can take this opportunity to set the imp's alpha once the
        // animation stops.
        // Also check that the imp is still allowed to spawn! If there is now
        // a standard present, banish the imp immediately!
        if (!this.char.anims.isPlaying) {
            if (GFF.AdventureContent.canSpawnImp()) {
                this.char.alpha = 0.35;
                this.char.walkDirection(Dir9.NONE);
            } else {
                GFF.AdventureContent.banishImp(this.char as GImpSprite);
            }
        }
        return false;
    }
}