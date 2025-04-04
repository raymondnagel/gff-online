import { DIRECTION } from "../direction";
import { GGoal } from "../goals/GGoal";
import { GWalkDirGoal } from "../goals/GWalkDirGoal";
import { GFF } from "../main";
import { GCharSprite } from "../objects/chars/GCharSprite";
import { GImpSprite } from "../objects/chars/GImpSprite";
import { GPersonSprite } from "../objects/chars/GPersonSprite";
import { PHYSICS } from "../physics";
import { PLAYER } from "../player";
import { CLabeledChar, Dir9, GActorCommand, GPerson, GSpirit } from "../types";

export abstract class GCutscene {

    private actorCommands: GActorCommand[] = [];
    private finishedEvents: string[] = [];

    private name: string;
    private genericActorsCount: number = 0;
    private actors: CLabeledChar[] = [];

    constructor(name: string) {
        this.name = name;

        // Add the player as a default actor, since we already have his sprite;
        // others can be added via addActor(), which will also create their sprites.
        this.actors.push({ label: 'player', char: PLAYER.getSprite() });
        // Hide the player sprite; we'll spawn him where we want him in the cutscene implementation.
        PLAYER.getSprite().setVisible(false);
    }

    public getName(): string {
        return this.name;
    }

    public play(): void {
        this.initialize();
        this.start();
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
     * otherwise, it is generically labeled with "actor_#".
     * Sprites are invisible and not placed in a particular location yet.
     */
    public addActor(actor: GPerson|GSpirit, label?: string): void {
        let sprite: GCharSprite;
        if ('faith' in actor) {
            sprite = new GPersonSprite(GFF.AdventureContent, actor, 0, 0);
        } else {
            sprite = new GImpSprite(GFF.AdventureContent, actor, 0, 0);
        }
        sprite.setVisible(false);

        if (label === undefined) {
            this.actors.push({ label: `actor_${++this.genericActorsCount}`, char: sprite });
        } else {
            this.actors.push({ label, char: sprite });
        }
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

    protected addActorCommand(actorCommand: GActorCommand) {
        this.actorCommands.push(actorCommand);
    }

    private beginNext(afterEventId: string) {
        // Filter to get a list of the "next" events to run:
        this.actorCommands.filter(
            c => c.after === afterEventId
        ).forEach(c => {
            // For each such event, create a goal for the actor:
            console.log(`Creating goal for ${c.actor} to ${c.command}...`);
            const actor: GCharSprite = this.getSpecificActor(c.actor) as GCharSprite;
            const goal: GGoal|Function = this.createGoalOrEventForCommand(actor, c);

            // Determine whether to finish instantly, or after a delay:
            if (c.since <= 0) {
                // Instant:
                if (goal instanceof Function) {
                    // If goal is a function, call it and finish the event:
                    goal.call(this);
                    this.finishEvent(c.eventId);
                } else {
                    // If goal is an actual goal, set up its aftermath function to finish the event:
                    goal.setAftermath(() => {
                        this.finishEvent(c.eventId);
                    });
                    actor.setGoal(goal);
                }
            } else {
                // Delayed:
                GFF.AdventureContent.time.delayedCall(c.since, () => {
                    if (goal instanceof Function) {
                        // If goal is a function, call it and finish the event:
                        goal.call(this);
                        this.finishEvent(c.eventId);
                    } else {
                        // If goal is an actual goal, set up its aftermath function to finish the event:
                        goal.setAftermath(() => {
                            this.finishEvent(c.eventId);
                        });
                        actor.setGoal(goal);
                    }
                });
            }
        });
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
    private createGoalOrEventForCommand(actorSprite: GCharSprite, actorCommand: GActorCommand): GGoal|Function {
        const commandTokens: string[] = actorCommand.command.split(/[\(\),]+/).filter(Boolean);
        console.log(`Parsed command ${actorCommand.command} into tokens: ${commandTokens.join('/')}`);

        // The first token is the command name; use it to determine the type of goal.
        // Some commands will return an event as a function, instead of a character-based goal.
        switch(commandTokens[0] as 'spawnAt'|'walkDir') {
            case 'spawnAt':
                return () => {
                    console.log(`Spawning actor: ${actorSprite.getName()}...`);
                    const spawnX: number = parseInt(commandTokens[1]);
                    const spawnY: number = parseInt(commandTokens[2]);
                    this.spawnActorAt(actorSprite, spawnX, spawnY);
                };
            case 'walkDir':
                const dir: Dir9 = DIRECTION.fromDir8String(commandTokens[1] as 'n'|'ne'|'e'|'se'|'s'|'sw'|'w'|'nw');
                const dist: number = parseInt(commandTokens[2]);
                return new GWalkDirGoal(actorSprite, dir, dist);
        }
    }

    private finishEvent(eventId: string) {
        this.finishedEvents.push(eventId);
        this.beginNext(eventId);
    }

    private start(): void {
        this.beginNext('start');
    }

    /**
     * Get an actor sprite by label and spawn him at the given point.
     * This does not check surroundings, so care must be taken to only
     * spawn in a safe area that is guaranteed to be unobstructed.
     */
    private spawnActorAt(actorSprite: GCharSprite, x: number, y: number): void {
        actorSprite.setControlled(true);
        actorSprite.setImmobile(false);
        actorSprite.setVisible(true);
        PHYSICS.centerPhysically(actorSprite, {x, y});
    }

    protected abstract initialize(): void;

}