import 'phaser';
import { GDirection } from '../../GDirection';
import { GGoal } from '../../GGoal';
import { GFF } from '../../main';
import { GAdventureContent } from '../../scenes/GAdventureContent';
import { GSpeechBubble } from '../GSpeechBubble';
import { GGender, GPoint, GRect } from '../../types';
import { GPlayerSprite } from './GPlayerSprite';

const NAMETAG_SPACE: number = 10;
const NAMETAG_DEPTH: number = 1000;

export abstract class GCharSprite extends Phaser.Physics.Arcade.Sprite {

    private firstName: string; // Character's first name
    private lastName: string; // Character's last name
    private spriteKeyPrefix: string; // Used to determine sprites for appearance
    private goal: GGoal|null = null; // Current goal which the character will try to achieve
    private direction: GDirection.Dir9 = GDirection.Dir9.S; // Current facing direction
    private immobile: boolean = false; // Prevents or allows the character to think and act
    private controlled: boolean = false; // Prevents automatic movement, but moves with player input
    private busyTalking: boolean = false; // Prevents movement and thinking, but allows speaking
    private nametag: Phaser.GameObjects.Text; // Shown above character if global flag is on

    constructor(scene: GAdventureContent, spriteKeyPrefix: string, firstName: string, lastName: string, x: number, y: number) {
        super(scene, x, y, `${spriteKeyPrefix}_idle_s`);
        this.firstName = firstName;
        this.lastName = lastName;
        this.spriteKeyPrefix = spriteKeyPrefix;
        this.setOrigin(0, 0);

        // Add to scene:
        scene.add.existing(this);

        // Configure physical properites:
        scene.physics.add.existing(this);
        if (this.body !== null) {
            this.body.setSize(GFF.CHAR_BODY_W, GFF.CHAR_BODY_H);
            this.body.setOffset(GFF.CHAR_BODY_X_OFF, GFF.CHAR_BODY_Y_OFF);
            this.body.updateFromGameObject();
            this.body.pushable = false;
            this.setDepth(this.body.bottom);
        }
        this.setCollideWorldBounds(true);

        this.createSingleAnimation('carryidle_s');
        this.createSingleAnimation('kneel_ne');
        this.createSingleAnimation('rejoice_s');
        this.createSingleAnimation('sit_n');
        this.createDirectionalAnimations('idle');
        this.createDirectionalAnimations('walk');
    }

    public getName() {
        return `${this.firstName} ${this.lastName}`;
    }

    public getFirstName() {
        return this.firstName;
    }

    public getLastName() {
        return this.lastName;
    }

    public getSpriteKeyPrefix() {
        return this.spriteKeyPrefix;
    }

    protected abstract getSpeed(): number;

    public abstract getGender(): GGender;

    public abstract getVoiceKey(): string;

    public pronounceWord() {
        const voiceKey: string = this.getVoiceKey();
        (this.scene as GAdventureContent).getSound().playSound(voiceKey);
    }

    public getDirection() {
        return this.direction;
    }

    public setImmobile(immobile: boolean) {
        this.immobile = immobile;
        if (this.immobile) {
            this.stop();
            this.setVelocity(0, 0);
        }
    }

    public isImmobile() {
        return this.immobile;
    }

    public setControlled(controlled: boolean) {
        this.controlled = controlled;
    }

    public isControlled() {
        return this.controlled;
    }

    public setBusyTalking(busyTalking: boolean) {
        this.busyTalking = busyTalking;
        if (this.busyTalking) {
            this.setGoal(null);
            this.setImmovable(true);
            this.walkDirection(GDirection.Dir9.NONE);
        } else {
            this.setImmovable(false);
        }
    }

    public isBusyTalking() {
        return this.busyTalking;
    }

    public getDistanceToChar(char: GCharSprite) {
        const ctr1: Phaser.Math.Vector2 = this.body?.center as Phaser.Math.Vector2;
        const ctr2: Phaser.Math.Vector2 = char.body?.center as Phaser.Math.Vector2;
        return Phaser.Math.Distance.BetweenPoints(ctr1, ctr2);
    }

    public faceChar(char: GCharSprite, setIdle: boolean = false) {
        const ctr1: Phaser.Math.Vector2 = this.body?.center as Phaser.Math.Vector2;
        const ctr2: Phaser.Math.Vector2 = char.body?.center as Phaser.Math.Vector2;
        const dir: GDirection.Dir9 = GDirection.getDirectionOf(ctr1, ctr2);
        this.faceDirection(dir, setIdle);
    }

    public isWithin(area: GRect) {
        const ctr: Phaser.Math.Vector2 = this.body?.center as Phaser.Math.Vector2;
        return ctr.x >= area.x
            && ctr.x < area.x + area.width
            && ctr.y >= area.y
            && ctr.y < area.y + area.height;
    }

    public faceDirection(direction: GDirection.Dir9, setIdle: boolean = false) {
        // Only set the facing direction if it is not NONE;
        // a character cannot face no direction.
        if (direction !== GDirection.Dir9.NONE) {
            this.direction = direction;
            if (setIdle) {
                this.playDirectionalAnimation('idle');
            }
        }
    }

    public walkDirection(direction: GDirection.Dir9) {
        // Face the direction I am walking:
        this.faceDirection(direction);

        // Calculate and assign x/y velocities
        let horzInc: number = GDirection.getHorzInc(direction);
        let vertInc: number = GDirection.getVertInc(direction);
        let speed: number = this.getSpeed();
        let dirSpeed = speed * GDirection.getDistanceFactor(direction);
        this.setVelocityX(horzInc * dirSpeed);
        this.setVelocityY(vertInc * dirSpeed);

        // Play the appropriate animation based on direction
        if (direction !== GDirection.Dir9.NONE) {
            this.playDirectionalAnimation('walk', direction, false);
        } else {
            // Since the assigned direction is NONE, use the facing direction instead:
            this.playDirectionalAnimation('idle', this.direction, false);
        }
    }

    protected playDirectionalAnimation(animName: string, dir?: GDirection.Dir9, force: boolean = false) {
        let dirText = GDirection.dir9Texts()[dir ?? this.direction];
        this.play(`${this.spriteKeyPrefix}_${animName}_${dirText}`, !force);
    }

    protected createSingleAnimation(animName: string) {
        this.anims.create({
            key: `${this.spriteKeyPrefix}_${animName}`,
            frames: this.anims.generateFrameNumbers(
                `${this.spriteKeyPrefix}_${animName}`,
                { start: 0, end: 6 }
            ),
            frameRate: 10,
            repeat: -1 // Infinite loop
        });
    }

    protected createDirectionalAnimations(animName: string) {
        GDirection.dir8Texts().forEach(direction => {
            this.anims.create({
                key: `${this.spriteKeyPrefix}_${animName}_${direction}`,
                frames: this.anims.generateFrameNumbers(
                    `${this.spriteKeyPrefix}_${animName}_${direction}`,
                    { start: 0, end: 6 }
                ),
                frameRate: 10,
                repeat: -1 // Infinite loop
            });
        });
    }

    public setGoal(goal: GGoal|null) {
        this.goal = goal;
    }

    public getGoal(): GGoal|null {
        return this.goal;
    }

    protected thinkOfNextGoal(): GGoal|null { return null };

    protected controlWithInput(): void {};

    private processGoal() {
        // Choose a new goal if I don't currently have one, and I'm not busy talking:
        if (this.goal === null && !this.isBusyTalking()) {
            this.setGoal(this.thinkOfNextGoal());
        }

        // Check goal because null may have been set during thinking:
        if (this.goal !== null) {
            // Perform a step toward the current goal
            this.goal.doStep();
        }

        // Check goal again because it may have been set during the step:
        if (this.goal !== null) {
            // If the goal has been achieved or timed out,
            // clear it and choose another one on the next pre-update.
            if (this.goal.isAchieved() || this.goal.isTimedOut()) {
                this.goal = null;
            }
        }
    }

    public say(speechText: string, hearer?: GCharSprite) {
        this.setBusyTalking(true)
        if (hearer !== undefined) {
            this.faceChar(hearer);
            hearer.faceChar(this);
            hearer.setBusyTalking(true);
        }
    }

    protected preUpdate(time: number, delta: number): void {
        // Update depth ordering:
        if (this.body !== null) {
            this.setDepth(this.body?.bottom);
        }

        // Default pre-update logic
        super.preUpdate(time, delta);

        // Process current goal, or potentially choose a new one,
        // if this character is able to think on its own
        // (neither immobilized nor controlled by player input) OR
        // if the character is busy talking:
        if (this.isBusyTalking() || (!this.isImmobile() && !this.isControlled())) {
            this.processGoal();
        }

        this.updateNametag();
    }

    private updateNametag() {
        if (GFF.showNametags) {
            const topCenter: GPoint = this.getTopCenter();
            if (this.nametag === undefined) {
                this.nametag = this.createNametag();
            }
            this.nametag.setPosition(topCenter.x, topCenter.y - NAMETAG_SPACE);
            this.nametag.text = this.getNametagText();
        }
        this.nametag?.setVisible(GFF.showNametags);
    }

    protected createNametag(): Phaser.GameObjects.Text {
        return this.scene.add.text(0, 0, this.getNametagText(), {
            fontSize: '12px',
            color: '#ffffff',
            fontFamily: 'vanilla'
        })
        .setLetterSpacing(1)
        .setShadow(2, 2, '#333333', 2, false, true)
        .setOrigin(.5, 0)
        .setDepth(NAMETAG_DEPTH);
    }

    protected getNametagText(): string {
        return this.getName();
    }

    public destroy(fromScene?: boolean): void {
        super.destroy(fromScene);
        this.nametag?.destroy();
    }

    public update(...args: any[]): void {
        if (this.isControlled()) {
            this.controlWithInput();
        }
    }

    public toString() {
        return this.getName();
    }
}