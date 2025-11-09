import 'phaser';
import { RANDOM } from '../../random';
import { Dir9, GPoint2D, GSpirit } from '../../types';
import { GSearchForPlayerGoal } from '../../goals/GSearchForPlayerGoal';
import { GGoal } from '../../goals/GGoal';
import { GEnemySprite } from './GEnemySprite';
import { GRestGoal } from '../../goals/GRestGoal';
import { PLAYER } from '../../player';
import { GChasePlayerGoal } from '../../goals/GChasePlayerGoal';
import { GWalkToPointGoal } from '../../goals/GWalkToPointGoal';
import { GFF } from '../../main';

const GUARD_RANGE: number = 160;

export class GDevilSprite extends GEnemySprite {

    private stationPoint: GPoint2D|null = null;

    constructor(spirit: GSpirit, x: number, y: number) {
        super(
            'devil',
            spirit,
            x,
            y
        );

        // Devils pause for 1 second before they can move:
        this.setGoal(new GRestGoal(1000, Dir9.S));
    }

    protected thinkOfNextGoal(): GGoal|null {
        if (this.stationPoint === null) {
            return this.defaultThinking();
        } else {
            return this.guardThinking();
        }
    }

    private defaultThinking(): GGoal|null {
        let x: number = RANDOM.randInt(100, 924);
        let y: number = RANDOM.randInt(100, 668);
        return new GSearchForPlayerGoal(x, y, 10, 5000);
    }

    private guardThinking(): GGoal|null {
        const playerCtr: GPoint2D = PLAYER.getSprite().getPhysicalCenter();
        const myCtr: GPoint2D = this.getPhysicalCenter();
        const distance = Phaser.Math.Distance.Between(playerCtr.x, playerCtr.y, this.stationPoint!.x, this.stationPoint!.y);
        if (distance <= GUARD_RANGE && !GFF.AdventureContent.isConversationOrCutsceneActive()) {
            return new GChasePlayerGoal(2000);
        } else if ( Math.abs(myCtr.x - this.stationPoint!.x) < 2 && Math.abs(myCtr.y - this.stationPoint!.y) < 2) {
            return new GRestGoal(
                RANDOM.randInt(1000, 3000),
                RANDOM.randElement([Dir9.W, Dir9.SW, Dir9.S, Dir9.SE, Dir9.E])
            );
        } else {
            if (RANDOM.randInt(1, 4) === 4) {
                // This allows the devil to occassionally wander to other locations
                // after it has left its station point. This may help it to return
                // to its station point in case it got stuck somewhere.
                return this.defaultThinking();
            } else {
                return new GWalkToPointGoal(this.stationPoint!.x, this.stationPoint!.y, 1);
            }
        }
    }

    public guard(stationPoint: GPoint2D): void {
        this.stationPoint = stationPoint;
    }

    public getPortraitKey(): string {
        return 'devil_circle';
    }

    public getAvatarKey(): string {
        return 'battle_devil';
    }
}