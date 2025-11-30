import 'phaser';
import { GCharSprite } from './GCharSprite';
import { RANDOM } from '../../random';
import { GFF } from '../../main';
import { GGender, GPerson, GSpirit } from '../../types';
import { GSearchForPlayerGoal } from '../../goals/GSearchForPlayerGoal';
import { GSpawnImpGoal } from '../../goals/GSpawnImpGoal';
import { ENEMY } from '../../enemy';
import { GGoal } from '../../goals/GGoal';
import { REGISTRY } from '../../registry';

/**
 * Enemies use GSpirit rather than GPerson, but we'll have to create a fake GPerson
 * for them so they can extend GCharSprite, and use that as the base class for
 * all characters: enemies, persons, and the player.
 */
const person: GPerson = {
    firstName: '',
    lastName: '',
    preferredName: null,
    spriteKeyPrefix: '',
    gender: 'm',
    voice: 2,
    faith: 0,
    familiarity: 0,
    nameLevel: 0,
    reprobate: true, // Might as well make the devils reprobate :-p
    convert: false,
    captive: false,
    homeTown: null,
    bio1: null,
    bio2: null,
    favoriteBook: 'Genesis',
    conversations: 0
};

export abstract class GEnemySprite extends GCharSprite {

    private spirit: GSpirit;
    private chasing: boolean = false;

    constructor(spriteKeyPrefix: string,spirit: GSpirit, x: number, y: number) {
        super(
            spriteKeyPrefix,
            x,
            y
        );
        this.spirit = spirit;
    }

    public getName(): string {
        return this.spirit.name;
    }
    public getFirstName(): string {
        return this.spirit.name;
    }
    public getLastName(): string {
        return '';
    }
    // getPerson() should never actually be called, but we need to implement it
    public getPerson(): GPerson {
        return person;
    }

    public getSpirit(): GSpirit {
        return this.spirit;
    }

    public abstract getPortraitKey(): string;

    public abstract getAvatarKey(): string;

    public getGender(): GGender {
        return 'm';
    }

    public setChasing(chasing: boolean) {
        this.chasing = chasing;
    }

    protected getSpeed(): number {
        let baseSpeed: number = REGISTRY.getNumber('walkSpeed') * GFF.getDifficulty().enemySpeed;
        if (this.chasing) {
            baseSpeed = 1.5 * baseSpeed;
        }
        return baseSpeed;
    }

    public getVoiceKey(): string {
        // Enemies don't talk to us, so this won't actually be used:
        return 'imp_growl';
    }

    protected abstract thinkOfNextGoal(): GGoal|null;

    protected getNametagText(): string {
        return this.spirit.introduced ? `${super.getNametagText()}: Lv ${this.spirit.level}` : '???';
    }

    protected createNametag(): Phaser.GameObjects.Text {
        return super.createNametag().setColor('#ff8888');
    }

    public static createAllSpirits() {
        let names: string[] = GFF.GAME.cache.json.get('enemy_names');
        for (let i = 0; i < 20; i++) {
            // Get the next available name:
            let spiritName: string = names.pop() as string;

            // Add new spirit to the enemy registry:
            ENEMY.addSpirit({
                type: 'minion',
                name: spiritName,
                level: 0,
                introduced: false
            });
        }
    }
}