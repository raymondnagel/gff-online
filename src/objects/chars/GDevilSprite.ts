import 'phaser';
import { RANDOM } from '../../random';
import { Dir9, GSpirit } from '../../types';
import { GSearchForPlayerGoal } from '../../goals/GSearchForPlayerGoal';
import { GGoal } from '../../goals/GGoal';
import { GEnemySprite } from './GEnemySprite';
import { GRestGoal } from '../../goals/GRestGoal';

export class GDevilSprite extends GEnemySprite {

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
        let x: number = RANDOM.randInt(100, 924);
        let y: number = RANDOM.randInt(100, 668);
        return new GSearchForPlayerGoal(x, y, 10, 5000);
    }

    public getPortraitKey(): string {
        return 'devil_circle';
    }

    public getAvatarKey(): string {
        return 'battle_devil';
    }
}