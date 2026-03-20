import 'phaser';
import { GCharSprite } from './GCharSprite';
import { GFF } from '../../main';
import { DIRECTION } from '../../direction';
import { Dir9, GGender, GPerson, GRect } from '../../types';
import { PLAYER } from '../../player';
import { GGoal } from '../../goals/GGoal';
import { BOOKS } from '../../books';
import { REGISTRY } from '../../registry';

const INTERACTION_RANGE: number = 50;
const INTERACTION_AREA_SIDE: number = 100;

const person: GPerson = {
    firstName: 'Adam',
    lastName: 'Cesar',
    preferredName: null,
    spriteKeyPrefix: '',
    gender: 'm',
    voice: 2,
    faith: 0,
    familiarity: 0,
    nameLevel: 0,
    reprobate: false,
    convert: false,
    captive: false,
    specialGift: null,
    homeTown: null,
    bio1: null,
    bio2: null,
    favoriteBook: 'Psalms',
    conversations: 0
};

export class GPlayerSprite extends GCharSprite {

    private trapped: boolean = false;

    constructor(x:number, y: number) {
        super('adam', x, y);
        this.setData('permanent', true);
        PLAYER.setSprite(this);
        this.setControlled(true);

        // Add additional, player-specific animations:
        this.createSingleAnimation('piano_ne');
        this.createSingleAnimation('bullhorn_sw', 0);
        this.createSingleAnimation('nobullhorn_sw', 0);
        this.createSingleAnimation('preach_sw');
        this.createDirectionalAnimations('interact', 0);
        this.createDirectionalAnimations('run');
         // Remove default "sit_n" with directional "sit":
        this.anims.remove('adam_sit_n');
        this.createDirectionalAnimations('sit');

        // We'll use a different set of animations when the player
        // is in a stronghold, so set those up now. First, we have
        // to change the prefix so that animations will be created
        // with the correct keys:
        this.setSpriteKeyPrefix('adam_soldier');
        this.createSingleAnimation('carryidle_s');
        this.createSingleAnimation('kneel_ne');
        this.createSingleAnimation('rejoice_s');
        this.createSingleAnimation('sit_n');
        this.createDirectionalAnimations('idle');
        this.createDirectionalAnimations('walk');
        this.createDirectionalAnimations('interact', 0);
        this.createDirectionalAnimations('run');
        this.createDirectionalAnimations('sit');
        // Change the prefix back:
        this.setSpriteKeyPrefix('adam');

        // Starts the player with an "idle_s" animation:
        this.walkDirection(Dir9.NONE);

        // Allow collision events for the player:
        if (this.body !== null) {
            this.body.onCollide = true;
            this.setCollideWorldBounds(true, 0, 0, true);
        }
    }

    public usePlainAnims() {
        this.setSpriteKeyPrefix('adam');
        if (this.anims.currentAnim !== null) {
            this.play(this.anims.currentAnim.key.replace('adam_soldier', 'adam'), true);
        }
    }

    public useSoldierAnims() {
        this.setSpriteKeyPrefix('adam_soldier');
        if (this.anims.currentAnim !== null) {
            this.play(this.anims.currentAnim.key.replace('adam', 'adam_soldier'), true);
        }
    }

    public getName(): string {
        return person.firstName + ' ' + person.lastName;
    }
    public getFirstName(): string {
        return person.firstName;
    }
    public getLastName(): string {
        return person.lastName;
    }
    public getPerson(): GPerson {
        return person;
    }

    public setTrapped(trapped: boolean) {
        this.trapped = trapped;
        if (trapped) {
            this.showFloatingText('TRAPPED!', 'word');
            this.walkDirection(Dir9.NONE);
        }
    }

    public isTrapped(): boolean {
        return this.trapped;
    }

    public runDirection(direction: Dir9) {
        // Face the direction I am running:
        this.faceDirection(direction);

        // Calculate and assign x/y velocities
        let horzInc: number = DIRECTION.getXInc(direction);
        let vertInc: number = DIRECTION.getYInc(direction);
        let speed: number = this.getSpeed() * 2;
        let dirSpeed = speed * DIRECTION.getDistanceFactor(direction);
        this.setVelocityX(horzInc * dirSpeed);
        this.setVelocityY(vertInc * dirSpeed);

        // Play the appropriate animation based on direction
        if (direction !== Dir9.NONE) {
            let dirText = DIRECTION.dir9Texts()[direction];
            this.play(`${this.getSpriteKeyPrefix()}_run_${dirText}`, true);
        } else {
            // Since the assigned direction is NONE, use the facing direction instead:
            let dirText = DIRECTION.dir9Texts()[this.getDirection()];
            this.play(`${this.getSpriteKeyPrefix()}_idle_${dirText}`, true);
        }
    }

    /**
     * This method must not be called 'interact' because it can cause the player
     * to be mistaken for a GInteractable.
     */
    public handAction() {
        this.playDirectionalAnimation('interact', undefined, true);
    }

    protected getSpeed(): number {
        return REGISTRY.getNumber('walkSpeed');
    }

    public getGender(): GGender {
        return 'm';
    }

    public getVoiceKey(): string {
        return 'vca';
    }

    protected createNametag(): Phaser.GameObjects.Text {
        return super.createNametag().setData('permanent', true);
    }

    public getInteractionArea(): GRect {
        let faceDir: Dir9 = this.getDirection();
        let bodyCtr: Phaser.Math.Vector2 = this.getPhysicalCenter() as Phaser.Math.Vector2;
        let distance: number = DIRECTION.getDistanceFactor(faceDir) * INTERACTION_RANGE;
        let intCtrX: number = bodyCtr.x + (DIRECTION.getXInc(faceDir) * distance);
        let intCtrY: number = bodyCtr.y + (DIRECTION.getYInc(faceDir) * distance);
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