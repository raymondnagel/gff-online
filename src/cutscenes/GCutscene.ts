import { DIRECTION } from "../direction";
import { GGoal } from "../goals/GGoal";
import { GRejoiceGoal } from "../goals/GRejoiceGoal";
import { GWalkDirGoal } from "../goals/GWalkDirGoal";
import { GWalkToPointGoal } from "../goals/GWalkToPointGoal";
import { GFF } from "../main";
import { GCharSprite } from "../objects/chars/GCharSprite";
import { GImpSprite } from "../objects/chars/GImpSprite";
import { GPersonSprite } from "../objects/chars/GPersonSprite";
import { PHYSICS } from "../physics";
import { PLAYER } from "../player";
import { CLabeledChar, Dir9, GActorEvent, GConditionEvent, GCutsceneEvent, GGeneralEvent, GPerson, GSpirit } from "../types";

export abstract class GCutscene {

    private name: string;
    private sceneEvents: GCutsceneEvent[] = [];
    private activeConditionEvents: GConditionEvent[] = [];
    private finishedEvents: string[] = [];
    private actors: CLabeledChar[] = [];
    private genericActorsCount: number = 0;

    // Use the registry to store any arbitrary data that needs to be accessed by the cutscene:
    protected registry: Map<string, any> = new Map<string, any>();

    constructor(name: string) {
        this.name = name;

        // Add the player as a default actor, since we already have his sprite;
        // others can be added via addActor(), which will also create their sprites.
        this.actors.push({ label: 'player', char: PLAYER.getSprite() });
        // Hide the player sprite; we'll spawn him where we want him in the cutscene implementation.
        PLAYER.getSprite().setVisible(false);
        PLAYER.getSprite().setImmobile(true);
        PLAYER.getSprite().getBody().setEnable(false);
    }

    public getName(): string {
        return this.name;
    }

    /**
     * Call from AdventureContent to start the cutscene.
     */
    public play(): void {
        // Initialize the cutscene
        this.initialize();

        this.logCast();

        // Start the cutscene by finishing the 'start' event
        this.start();
    }

    /**
     * Call from the final event of the cutscene.
     */
    public end(): void {
        this.stop();
    }



    private logCast() {
        console.log(`Starring...`);
        this.actors.forEach(a => {
            console.log(`${a.char.getName()} as ${a.label}`);
        });
    }

    public setActorLabel(actorSprite: GCharSprite, newLabel: string) {
        const actor: CLabeledChar|undefined = this.actors.find(a => a.char === actorSprite);
        if (actor !== undefined) {
            actor.label = newLabel;
        }
    }

    /**
     * Creates a sprite to be used in the cutscene for the given actor.
     * If a label is supplied, the sprite is registered with that label;
     * otherwise, it is generically labeled with 'actor_#'.
     * Sprites are invisible and not placed in a particular location yet.
     */
    public addActor(actor: GPerson|GSpirit, label?: string): void {
        let sprite: GCharSprite;
        if ('faith' in actor) {
            sprite = new GPersonSprite(GFF.AdventureContent, actor, 0, 0);
            GFF.AdventureContent.addPerson(sprite as GPersonSprite);
        } else {
            sprite = new GImpSprite(GFF.AdventureContent, actor, 0, 0);
            GFF.AdventureContent.addImp(sprite as GImpSprite);
        }
        sprite.setVisible(false);
        sprite.setControlled(true);
        sprite.setImmobile(true);
        sprite.getBody().setEnable(false);

        if (label === undefined) {
            this.actors.push({ label: `actor_${++this.genericActorsCount}`, char: sprite });
        } else {
            this.actors.push({ label, char: sprite });
        }
    }

    public getLabelForActor(actorSprite: GCharSprite): string|undefined {
        return this.actors.find(
            labeledChar => labeledChar.char === actorSprite
        )?.label;
    }

    public getAllActors(): GCharSprite[] {
        return this.actors.map(
            labeledChar => labeledChar.char
        );
    }

    public getSpecificActor(label: string): GCharSprite|undefined {
        return this.actors.find(
            labeledChar => labeledChar.label === label
        )?.char;
    }

    public getGenericActors(): GCharSprite[] {
        return this.actors.filter(
            char => char.label.startsWith('actor_')
        ).map(
            char => char.char
        );
    }

    protected addCutsceneEvent(cutsceneEvent: GCutsceneEvent) {
        this.sceneEvents.push(cutsceneEvent);
    }

    public checkConditions() {
        this.activeConditionEvents.forEach(e => {
            // Once the condition is met, just finish the event;
            // this will allow dependent events to be triggered.
            if (
                (!this.finishedEvents.includes(e.eventId)) &&
                e.condition()
            ) {
                this.finishEvent(e.eventId);
            }
        });
    }

    private beginNext(afterEventId: string) {
        // Filter to get a list of the "next" events to run:
        this.sceneEvents.filter(
            e => e.after === afterEventId
        ).forEach(e => {
            if ('actor' in e) {
                // Processing an actor event will execute it:
                this.processActorEvent(e as GActorEvent);
            } else if ('eventCode' in e) {
                // Processing a general event execute it:
                this.processGeneralEvent(e as GGeneralEvent);
            } else if ('condition' in e) {
                // Processing a condition event will activate it for polling:
                this.processConditionEvent(e as GConditionEvent);
            }
        });
    }

    private processActorEvent(actorEvent: GActorEvent): void {
        const actor: GCharSprite = this.getSpecificActor(actorEvent.actor) as GCharSprite;
        const goal: GGoal|Function = this.createActorGoalOrEvent(actor, actorEvent);
        // Determine whether to finish instantly, or after a delay:
        if (actorEvent.since <= 0) {
            // Instant:
            if (goal instanceof Function) {
                // If goal is a function, call it and finish the event:
                goal.call(this);
                this.finishEvent(actorEvent.eventId);
            } else {
                // If goal is an actual goal, set up its aftermath function to finish the event:
                goal.setAftermath(() => {
                    actorEvent.postCode?.call(this);
                    this.finishEvent(actorEvent.eventId);
                });
                actor.setGoal(goal);
            }
        } else {
            // Delayed:
            GFF.AdventureContent.time.delayedCall(actorEvent.since, () => {
                if (goal instanceof Function) {
                    // If goal is a function, call it and finish the event:
                    goal.call(this);
                    this.finishEvent(actorEvent.eventId);
                } else {
                    // If goal is an actual goal, set up its aftermath function to finish the event:
                    goal.setAftermath(() => {
                        actorEvent.postCode?.call(this);
                        this.finishEvent(actorEvent.eventId);
                    });
                    actor.setGoal(goal);
                }
            });
        }
    }

    private processGeneralEvent(generalEvent: GGeneralEvent): void {
        if (generalEvent.since <= 0) {
            // Instant:
            generalEvent.eventCode();
            this.finishEvent(generalEvent.eventId);
        } else {
            // Delayed:
            GFF.AdventureContent.time.delayedCall(generalEvent.since, () => {
                generalEvent.eventCode();
                this.finishEvent(generalEvent.eventId);
            });
        }
    }

    private processConditionEvent(conditionEvent: GConditionEvent): void {
        if (conditionEvent.since <= 0) {
            // Instant:
            this.activeConditionEvents.push(conditionEvent);
        } else {
            // Delayed:
            GFF.AdventureContent.time.delayedCall(conditionEvent.since, () => {
                this.activeConditionEvents.push(conditionEvent);
            });
        }
    }

    /**
     * Translate a command into an achievable goal.
     * We'll need to parse the command and determine both the
     * type of goal and its arguments.
     *
     * There are a limited number of complex goals, such as:
     * - walk to a certain point
     * - walk X pixels in direction
     * - face direction
     * - say something
     * - switch to a special animation, like kneeling, sitting, or rejoicing
     *
     * We may also need to make an abstraction of goal, like CutsceneEvent,
     * that allows things to happen without being the goal of a character.
     */
    private createActorGoalOrEvent(actorSprite: GCharSprite, actorCommand: GActorEvent): GGoal|Function {
        const commandTokens: string[] = actorCommand.command.split(/[\(\),]+/).filter(Boolean);

        // The first token is the command name; use it to determine the type of goal.
        // Some commands will return an event as a function, instead of a character-based goal.
        switch(commandTokens[0] as 'spawnAt'|'rejoice'|'faceDir'|'walkDir'|'walkTo') {
            case 'spawnAt':
                return () => {
                    const spawnX: number = parseInt(commandTokens[1]);
                    const spawnY: number = parseInt(commandTokens[2]);
                    this.spawnActorAt(actorSprite, spawnX, spawnY);
                };
            case 'rejoice':
                const time: number = parseInt(commandTokens[1]);
                return new GRejoiceGoal(time);
            case 'faceDir':
                const faceDir: Dir9 = DIRECTION.fromDir8String(commandTokens[1] as 'n'|'ne'|'e'|'se'|'s'|'sw'|'w'|'nw');
                return () => {
                    actorSprite.faceDirection(faceDir, true);
                };
            case 'walkDir':
                const walkDir: Dir9 = DIRECTION.fromDir8String(commandTokens[1] as 'n'|'ne'|'e'|'se'|'s'|'sw'|'w'|'nw');
                const dist: number = parseInt(commandTokens[2]);
                return new GWalkDirGoal(walkDir, dist, 1);
            case 'walkTo':
                const toX: number = parseInt(commandTokens[1]);
                const toY: number = parseInt(commandTokens[2]);
                return new GWalkToPointGoal(toX, toY, 1);
        }
    }

    /**
     * Registers an event as being finished, and kicks off any
     * events that have been waiting for it.
     */
    protected finishEvent(eventId: string) {
        this.finishedEvents.push(eventId);
        this.beginNext(eventId);
    }

    private start(): void {
        this.beginNext('start');
        GFF.AdventureContent.setCutscene(this);
    }

    private stop(): void {
        GFF.AdventureContent.clearCutscene();
        this.finalize();
    }

    /**
     * Get an actor sprite by label and spawn him at the given point.
     * This does not check surroundings, so care must be taken to only
     * spawn in a safe area that is guaranteed to be unobstructed.
     */
    private spawnActorAt(actorSprite: GCharSprite, x: number, y: number): void {
        actorSprite.setVisible(true);
        actorSprite.setImmobile(false);
        actorSprite.getBody().setEnable(true);
        PHYSICS.centerPhysically(actorSprite, {x, y});
    }

    protected abstract initialize(): void;

    protected abstract finalize(): void;

}