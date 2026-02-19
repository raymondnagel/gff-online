import 'phaser';
import { DIRECTION } from '../../direction';
import { GFF } from '../../main';
import { Dir9, GGender, GPerson, GPoint2D } from '../../types';
import { GGoal } from '../../goals/GGoal';
import { PHYSICS } from '../../physics';
import { DEPTH } from '../../depths';
import { REGISTRY } from '../../registry';

const NAMETAG_SPACE: number = 10;
const FLOAT_TEXT_SPACE: number = 10;

export abstract class GCharSprite extends Phaser.Physics.Arcade.Sprite {

    private spriteKeyPrefix: string; // Used to determine sprites for appearance
    private goal: GGoal|null = null; // Current goal which the character will try to achieve
    private direction: Dir9 = Dir9.S; // Current facing direction
    private immobile: boolean = false; // Prevents or allows the character to think and act
    private controlled: boolean = false; // Prevents automatic movement; char will be controlled externally
    private busyTalking: boolean = false; // Prevents movement and thinking, but allows speaking
    private nametag: Phaser.GameObjects.Text; // Shown above character if global flag is on
    private floatText: Phaser.GameObjects.Text; // Shown above character if active

    constructor(spriteKeyPrefix: string, x: number, y: number) {
        super(GFF.AdventureContent, x, y, `${spriteKeyPrefix}_idle_s`);
        this.spriteKeyPrefix = spriteKeyPrefix;
        this.setOrigin(0, 0);

        // Add to scene:
        GFF.AdventureContent.add.existing(this);

        // Configure physical properites:
        GFF.AdventureContent.physics.add.existing(this);
        if (this.body !== null) {
            this.body.setSize(GFF.CHAR_BODY_W, GFF.CHAR_BODY_H);
            this.body.setOffset(GFF.CHAR_BODY_X_OFF, GFF.CHAR_BODY_Y_OFF);
            this.body.updateFromGameObject();
            this.body.pushable = false;
            this.setDepth(this.body.bottom);
        }
        this.setCollideWorldBounds(true);

        // Only create animations that are used for ALL characters!
        this.createSingleAnimation('carryidle_s');
        this.createSingleAnimation('kneel_ne');
        this.createSingleAnimation('rejoice_s');
        this.createSingleAnimation('sit_n');
        this.createDirectionalAnimations('idle');
        this.createDirectionalAnimations('walk');
    }

    public abstract getName(): string;

    public abstract getFirstName(): string;

    public abstract getLastName(): string;

    public abstract getPerson(): GPerson;

    public getSpriteKeyPrefix() {
        return this.spriteKeyPrefix;
    }

    protected abstract getSpeed(): number;

    public abstract getGender(): GGender;

    public abstract getVoiceKey(): string;

    public pronounceWord() {
        const voiceKey: string = this.getVoiceKey();
        GFF.AdventureContent.getSound().playSpeech(voiceKey);
    }

    public getBody(): Phaser.Physics.Arcade.Body {
        return this.body as Phaser.Physics.Arcade.Body;
    }

    public getDirection() {
        return this.direction;
    }

    public canInterrupt(): boolean {
        return this.goal === null || this.goal.isInterruptable();
    }

    /**
     * "Automated" is a status that applies to a character that:
     * - isn't controlled (either by user input or a cutscene)
     * - isn't immobilized (for example, during a transition)
     * - isn't busy talking
     * If isAutomated() returns true, the character should be
     * allowed to think of new goals and execute them autonomously.
     *
     * Player is always controlled, so will never be automated.
     * Other chars can have their automation turned off by talking,
     * or by being immobilized, or by being controlled in a cutscene.
     */
    public isAutomated(): boolean {
        return !this.isBusyTalking() &&
        !this.isImmobile() &&
        !this.isControlled();
    }

    public setImmobile(immobile: boolean) {
        this.immobile = immobile;
        if (this.immobile) {
            this.stop();
            this.setVelocity(0, 0);
            this.setGoal(null);
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
            // Stop a walking or running char, but no other animations
            if (this.isDoing('walk') || this.isDoing('run')) {
                this.walkDirection(Dir9.NONE);
            }
        } else {
            this.setImmovable(false);
        }
    }

    public isBusyTalking() {
        return this.busyTalking;
    }

    public showFloatingText(text: string, timeScope: 'info'|'word'|'phrase' = 'info') {
        let appearTime: number;
        switch (timeScope) {
            case 'info':
                appearTime = 300;
                break;
            case 'word':
                appearTime = 400;
                break;
            case 'phrase':
                appearTime = 1000;
                break;
        }

        const point: GPoint2D = this.getTopCenter();
        this.floatText = GFF.AdventureContent.add.text(point.x, point.y - FLOAT_TEXT_SPACE, text, {
            fontFamily: 'oxygen',
            fontSize: '16px',
            color: '#ffffff',
        })
        .setLetterSpacing(1)
        .setShadow(2, 2, '#333333', 2, false, true)
        .setOrigin(.5, 1)
        .setDepth(DEPTH.FLOAT_TEXT)
        .setScale(.2, .2)
        .setAlpha(.2);

        GFF.AdventureContent.tweens.chain({
            targets: this.floatText,
            tweens: [
                {
                    duration: appearTime,
                    scaleX: 1,
                    scaleY: 1,
                    alpha: 1,
                    onUpdate: () => {
                        const point: GPoint2D = this.getTopCenter();
                        this.floatText.setPosition(point.x, point.y - FLOAT_TEXT_SPACE);
                    }
                }, {
                    duration: 800,
                    scaleX: 2,
                    scaleY: 2,
                    alpha: 0,
                    onUpdate: () => {
                        const point: GPoint2D = this.getTopCenter();
                        this.floatText.setPosition(point.x, point.y - FLOAT_TEXT_SPACE);
                    },
                    onComplete: () => {
                        this.floatText.destroy();
                    }
                },
            ]
        });
    }

    public getPhysicalCenter(): GPoint2D {
        return PHYSICS.getPhysicalCenter(this) as GPoint2D;
    }

    public centerPhysically(point: GPoint2D) {
        PHYSICS.centerPhysically(this, point);
    }

    public getDistanceToChar(char: GCharSprite) {
        return PHYSICS.getDistanceBetween(this, char);
    }

    public faceChar(char: GCharSprite, setIdle: boolean = false) {
        const ctr1: Phaser.Math.Vector2 = this.body?.center as Phaser.Math.Vector2;
        const ctr2: Phaser.Math.Vector2 = char.body?.center as Phaser.Math.Vector2;
        const dir: Dir9 = DIRECTION.getDirectionOf(ctr1, ctr2);
        this.faceDirection(dir, setIdle);
    }

    public faceDirection(direction: Dir9, setIdle: boolean = false) {
        // Only set the facing direction if it is not NONE;
        // a character cannot face no direction.
        if (direction !== Dir9.NONE) {
            this.direction = direction;
            if (setIdle) {
                this.playDirectionalAnimation('idle');
            }
        }
    }

    /**
     * Tells the character to walk in a specified direction.
     * This doesn't assume that the character is idle or
     * already walking; it will work in either case.
     * Can be used in a goal step to continuously direct
     * the character's movement.
     *
     * If a target point is supplied, the distance to travel
     * will be calculated using the delta; if the actual distance
     * to the target is less than the projected travel distance,
     * the coordinates will be snapped to the target to prevent
     * overshooting it.
     */
    public walkDirection(direction: Dir9, time?: number, delta?: number, target?: GPoint2D) {

        // Face the direction I am walking:
        this.faceDirection(direction);

        // Get horz/vert increments by direction
        let horzInc: number = DIRECTION.getXInc(direction);
        let vertInc: number = DIRECTION.getYInc(direction);

        // Get the speed we should use for the direction;
        // this differs for diagonal vs ordinal directions
        let speed: number = this.getSpeed();
        let dirSpeed = speed * DIRECTION.getDistanceFactor(direction);

        // Calculate projected movement
        if (delta !== undefined && target !== undefined) {
            const myCtr: GPoint2D = this.getPhysicalCenter();
            const seconds: number = delta / 1000;
            const xMove: number = Math.abs(horzInc * dirSpeed * seconds);
            const yMove: number = Math.abs(vertInc * dirSpeed * seconds);
            const tDistX: number = Math.abs(target.x - myCtr.x);
            const tDistY: number = Math.abs(target.y - myCtr.y);

            // If double projected move for a direction is greater than the distance needed to
            // travel, we'll get there in less than 2 steps. Halve the increment for that
            // direction to decrease the velocity calculated later.
            if (xMove * 2 >= tDistX) {
                horzInc *= .5;
            }
            if (yMove * 2 >= tDistY) {
                vertInc *= .5;
            }

            // If the projected movements are greater than the distance to target,
            // for either X or Y, snap coordinate into place and clear velocity
            if (xMove >= tDistX) {
                myCtr.x = target.x;
                horzInc = 0;
            }
            if (yMove >= tDistY) {
                myCtr.y = target.y;
                vertInc = 0;
            }
            if (horzInc === 0 || vertInc === 0) {
                // Aww snap!
                this.centerPhysically(myCtr);
            }
        }

        this.setVelocityX(horzInc * dirSpeed);
        this.setVelocityY(vertInc * dirSpeed);

        // Recalculate direction from increments, since they may have changed:
        const finalDirection: Dir9 = DIRECTION.getDirectionForIncs(horzInc, vertInc);

        // Play the appropriate animation based on direction
        if (finalDirection !== Dir9.NONE) {
            this.playDirectionalAnimation('walk', finalDirection, false);
        } else {
            // Since the assigned direction is NONE, use the facing direction instead:
            this.playDirectionalAnimation('idle', this.direction, false);
        }
    }

    public rejoice() {
        this.playSingleAnimation('rejoice_s', true);
    }

    public kneel() {
        this.playSingleAnimation('kneel_ne', true);
    }

    public raiseHands() {
        this.playSingleAnimation('carryidle_s', true);
    }

    protected playSingleAnimation(animName: string, force: boolean = false) {
        this.play(`${this.spriteKeyPrefix}_${animName}`, !force);
    }

    protected playDirectionalAnimation(animName: string, dir?: Dir9, force: boolean = false) {
        let dirText = DIRECTION.dir9Texts()[dir ?? this.direction];
        this.play(`${this.spriteKeyPrefix}_${animName}_${dirText}`, !force);
    }

    protected createSingleAnimation(animName: string, repeats: number = -1) {
        this.anims.create({
            key: `${this.spriteKeyPrefix}_${animName}`,
            frames: this.anims.generateFrameNumbers(
                `${this.spriteKeyPrefix}_${animName}`,
                { start: 0, end: 6 }
            ),
            frameRate: 10,
            repeat: repeats
        });
    }

    protected createDirectionalAnimations(animName: string, repeats: number = -1) {
        DIRECTION.dir8Texts().forEach(direction => {
            this.anims.create({
                key: `${this.spriteKeyPrefix}_${animName}_${direction}`,
                frames: this.anims.generateFrameNumbers(
                    `${this.spriteKeyPrefix}_${animName}_${direction}`,
                    { start: 0, end: 6 }
                ),
                frameRate: 10,
                repeat: repeats
            });
        });
    }

    // Returns true if this character is executing the given
    // animation name.
    public isDoing(animName: string): boolean {
        return this.anims.currentAnim === null ?
            false :
            this.anims.currentAnim.key.includes(`_${animName}_`);
    }

    public setGoal(goal: GGoal|null) {
        if (this.goal !== null && !this.goal.isInterruptable()) {
            return;
        }
        this.goal = goal;
        this.goal?.setChar(this);
    }

    public getGoal(): GGoal|null {
        return this.goal;
    }

    protected thinkOfNextGoal(): GGoal|null { return null };

    private processGoal(time: number, delta: number) {
        // Choose a new goal if I don't currently have one, but I'm automated:
        if (this.goal === null && this.isAutomated()) {
            this.setGoal(this.thinkOfNextGoal());
        }

        // Even if not automated, the character may have a manually-set
        // (commanded) goal at this point, and it should be processed.

        // Check goal because null may have been set during thinking:
        if (this.goal !== null) {
            // Perform a step toward the current goal
            this.goal.doStep(time, delta);
        }

        // Check goal again because it may have been set during the step:
        if (this.goal !== null) {
            // If the goal has been achieved or timed out,
            // clear it and choose another one on the next pre-update.
            if (this.goal.isAchieved() || this.goal.isTimedOut()) {
                // Stop the goal:
                this.goal.stop();
                // Get the finish event for this goal:
                const aftermath: Function|undefined = this.goal.getAftermath();
                // Reset the goal to null:
                this.goal = null;
                // Call the finish event function, if it's defined:
                aftermath?.call(this);
            }
        }
    }

    protected preUpdate(time: number, delta: number): void {
        // Update depth ordering:
        if (this.body !== null) {
            this.setDepth(this.body?.bottom);
        }

        // Default pre-update logic
        super.preUpdate(time, delta);

        // Process current goal, if applicable:
        this.processGoal(time, delta);

        this.updateNametag();
    }

    private updateNametag() {
        const showNametags: boolean = REGISTRY.get('isNametags');
        if (showNametags) {
            const topCenter: GPoint2D = this.getTopCenter();
            if (this.nametag === undefined) {
                this.nametag = this.createNametag();
            }
            this.nametag.setPosition(topCenter.x, topCenter.y - NAMETAG_SPACE);
            this.nametag.text = this.getNametagText();
        }
        this.nametag?.setVisible(showNametags);
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
        .setDepth(DEPTH.NAME_TAG);
    }

    protected getNametagText(): string {
        return this.getName();
    }

    public destroy(fromScene?: boolean): void {
        super.destroy(fromScene);
        this.nametag?.destroy();
    }

    public toString() {
        return this.getName();
    }

}