import 'phaser';
import { GCharSprite } from './GCharSprite';
import { RANDOM } from '../../random';
import { GFF } from '../../main';
import { GGender, GSpirit } from '../../types';
import { GAdventureContent } from '../../scenes/GAdventureContent';
import { GSearchForPlayerGoal } from '../../goals/GSearchForPlayerGoal';
import { GSpawnImpGoal } from '../../goals/GSpawnImpGoal';
import { ENEMY } from '../../enemy';
import { GGoal } from '../../goals/GGoal';

export class GImpSprite extends GCharSprite {

    private spirit: GSpirit;
    private chasing: boolean = false;

    constructor(scene: GAdventureContent, spirit: GSpirit, x: number, y: number) {
        super(
            scene,
            'imp',
            spirit.name,
            '',
            x,
            y
        );
        this.spirit = spirit;

        // Imps spawn before they can move:
        this.setGoal(new GSpawnImpGoal(2000));
    }

    public getSpirit(): GSpirit {
        return this.spirit;
    }

    public getGender(): GGender {
        return 'm';
    }

    public setChasing(chasing: boolean) {
        this.chasing = chasing;
    }

    protected getSpeed(): number {
        let baseSpeed: number = parseFloat(GFF.GAME.registry.get('walkSpeed')) * GFF.Difficulty.enemySpeed;
        if (this.chasing) {
            baseSpeed = 1.5 * baseSpeed;
        }
        return baseSpeed;
    }

    public getVoiceKey(): string {
        // Imps don't talk to us, so this won't actually be used:
        return 'imp_growl';
    }

    protected thinkOfNextGoal(): GGoal|null {
        // Set alpha here, just to make sure the spawn didn't mess up and keep it at 1.0:
        this.alpha = 0.35;
        let x: number = RANDOM.randInt(100, 924);
        let y: number = RANDOM.randInt(100, 668);
        return new GSearchForPlayerGoal(x, y, 10, 5000);
    }

    protected getNametagText(): string {
        return this.spirit.introduced ? `${super.getNametagText()}: Lv ${this.spirit.level}` : '???';
    }

    protected createNametag(): Phaser.GameObjects.Text {
        return super.createNametag().setColor('#ff8888');
    }

    public static createAllImps() {
        let impNames: string[] = GFF.GAME.cache.json.get('enemy_names');
        for (let i = 0; i < 20; i++) {
            // Get the next available name:
            let impName: string = impNames.pop() as string;

            // Add new spirit to the imps registry:
            ENEMY.addImp({
                type: 'imp',
                name: impName,
                level: 0,
                introduced: false
            });
        }
    }
}