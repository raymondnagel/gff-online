import 'phaser';
import { GCharSprite } from './GCharSprite';
import { GFF } from '../../main';
import { GDirection } from '../../GDirection';
import { GAdventureContent } from '../../scenes/GAdventureContent';
import { Dir9, GGender, GRect } from '../../types';
import { PLAYER } from '../../player';
import { GGoal } from '../../goals/GGoal';

const INTERACTION_RANGE: number = 50;
const INTERACTION_AREA_SIDE: number = 100;

export class GPlayerSprite extends GCharSprite {

    constructor(scene: GAdventureContent, x:number, y: number) {
        super(scene, 'adam', 'Adam', 'Cesar', x, y);
        this.setData('permanent', true);
        PLAYER.setSprite(this);
        this.setControlled(true);

        // Add additional, player-specific animations:
        this.createDirectionalAnimations('run');

        // Starts the player with an "idle_s" animation:
        this.walkDirection(Dir9.NONE);

        // Allow collision events for the player:
        if (this.body !== null) {
            this.body.onCollide = true;
            this.setCollideWorldBounds(true, 0, 0, true);
        }
    }

    public runDirection(direction: Dir9) {
        // Face the direction I am running:
        this.faceDirection(direction);

        // Calculate and assign x/y velocities
        let horzInc: number = GDirection.getHorzInc(direction);
        let vertInc: number = GDirection.getVertInc(direction);
        let speed: number = this.getSpeed() * 2;
        let dirSpeed = speed * GDirection.getDistanceFactor(direction);
        this.setVelocityX(horzInc * dirSpeed);
        this.setVelocityY(vertInc * dirSpeed);

        // Play the appropriate animation based on direction
        if (direction !== Dir9.NONE) {
            let dirText = GDirection.dir9Texts()[direction];
            this.play(`adam_run_${dirText}`, true);
        } else {
            // Since the assigned direction is NONE, use the facing direction instead:
            let dirText = GDirection.dir9Texts()[this.getDirection()];
            this.play(`adam_idle_${dirText}`, true);
        }
    }

    protected getSpeed(): number {
        return parseFloat(GFF.GAME.registry.get('walkSpeed'));
    }

    public getGender(): GGender {
        return 'm';
    }

    public getVoiceKey(): string {
        return 'adam_voice';
    }

    protected createNametag(): Phaser.GameObjects.Text {
        return super.createNametag().setData('permanent', true);
    }

    public getInteractionArea(): GRect {
        let faceDir: Dir9 = this.getDirection();
        let bodyCtr: Phaser.Math.Vector2 = this.body?.center as Phaser.Math.Vector2;
        let distance: number = GDirection.getDistanceFactor(faceDir) * INTERACTION_RANGE;
        let intCtrX: number = bodyCtr.x + (GDirection.getHorzInc(faceDir) * distance);
        let intCtrY: number = bodyCtr.y + (GDirection.getVertInc(faceDir) * distance);
        return {
            x: intCtrX - (INTERACTION_AREA_SIDE / 2),
            y: intCtrY - (INTERACTION_AREA_SIDE / 2),
            width: INTERACTION_AREA_SIDE,
            height: INTERACTION_AREA_SIDE
        };
    }

    // No implementation; the player will do his own thinking.
    // preUpdate() will still process any active goal, though,
    // so it is still possible to manually assign goals to the
    // player for automatic execution, like an NPC.
    protected thinkOfNextGoal(): GGoal|null { return null; }

}