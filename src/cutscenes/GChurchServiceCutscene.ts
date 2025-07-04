import { GChurch } from "../GChurch";
import { GConversation } from "../GConversation";
import { GFF } from "../main";
import { GCharSprite } from "../objects/chars/GCharSprite";
import { GBuildingExit } from "../objects/touchables/GBuildingExit";
import { PLAYER } from "../player";
import { RANDOM } from "../random";
import { STATS } from "../stats";
import { CLabeledChar, Dir9, GPoint2D } from "../types";
import { GCutscene } from "./GCutscene";

type PewSeat = {
    point: GPoint2D,
    state: 'empty'|'reserved'|'claimed'
}

const CENTER_X: number = 512;
const CENTER_Y: number = 352;
const THRESH_Y: number = 553;
const SPAWN_PT: GPoint2D = {x: CENTER_X, y: 800};
const THRESH_PT: GPoint2D = {x: CENTER_X, y: THRESH_Y};
const BEFORE_PULPIT_PT: GPoint2D = {x: CENTER_X, y: 290};
const AROUND_PULPIT_PT: GPoint2D = {x: BEFORE_PULPIT_PT.x - 70, y: 220};
const PAST_PULPIT_PT: GPoint2D = {x: AROUND_PULPIT_PT.x, y: 183};
const BEHIND_PULPIT_PT: GPoint2D = {x: CENTER_X, y: PAST_PULPIT_PT.y};

export class GChurchServiceCutscene extends GCutscene {

    private church: GChurch;
    private preacher: GCharSprite;

    private pews: PewSeat[][] = [];

    constructor(church: GChurch) {
        super('church-service cutscene');
        this.church = church;
        this.createPewSeats();
    }

    private createPewSeats() {
        const rows: number[] = [297, 425, THRESH_Y];
        const distToFirst: number = 100;
        const distBetween: number = 62;

        // For each row, create left and right sides:
        rows.forEach(y => {
            // Left
            let x = CENTER_X - distToFirst;
            const leftPew: PewSeat[] = [];
            for (let seat: number = 0; seat < 5; seat++) {
                leftPew.push({point: {x, y}, state: 'empty'});
                x -= distBetween;
            }
            this.pews.push(leftPew);

            // Right
            x = CENTER_X + distToFirst;
            const rightPew: PewSeat[] = [];
            for (let seat: number = 0; seat < 5; seat++) {
                rightPew.push({point: {x, y}, state: 'empty'});
                x += distBetween;
            }
            this.pews.push(rightPew);
        });
    }

    // Randomly reserve a certain number of seats
    private reserveSeats(seatCount: number): void {
        // Get all untaken seats
        const availableSeats = this.pews.flat().filter(seat => seat.state === 'empty');
        // Shuffle the available seats
        RANDOM.shuffle(availableSeats);
        // Get the amount of seats to reserve
        const seatsToTake = availableSeats.slice(0, seatCount);
        // Mark them as reserved
        seatsToTake.forEach(seat => seat.state = 'reserved');
    }

    // Claim and return a random already-reserved seat
    private claimSeat(): PewSeat|null {
        const availablePews: PewSeat[][] = this.pews.filter(pew => pew.some(value => value.state === 'reserved'));
        const chosenPew: PewSeat[] = RANDOM.randElement(availablePews);
        for (let s = chosenPew.length - 1; s >= 0; s--) {
            if (chosenPew[s].state === 'reserved') {
                chosenPew[s].state = 'claimed';
                return chosenPew[s];
            }
        }
        return null;
    }

    private getRandomSermon(): string {
        const sermons: String[] = GFF.GAME.cache.json.entries.keys().filter(entry => entry.startsWith('church_sermon_'));
        return RANDOM.randElement(sermons) as string;
    }

    private getConversationChars(): CLabeledChar[] {
        const chars: CLabeledChar[] = [];
        // Add the preacher:
        const preacher: GCharSprite = this.getSpecificActor('preacher') as GCharSprite;
        chars.push({label: 'preacher', char: preacher});
        // Everyone else is generically added as an 'other':
        this.getGenericActors().forEach(actor => {
            chars.push({label: 'other', char: actor});
        });
        return chars;
    }

    private getExit(): GBuildingExit {
        return GFF.AdventureContent.children.list.find(gameObject =>
            gameObject instanceof GBuildingExit
        ) as GBuildingExit;
    }

    protected initialize(): void {
        // Disable bottom bound and exit so people can enter from off the screen:
        GFF.AdventureContent.setBottomBoundEnabled(false);
        this.getExit().getBody().setEnable(false);

        // Get a sermon to preach:
        const sermon: string = this.getRandomSermon();

        // Add all church saints as actors:
        this.church.getPeople().forEach(saint => {
            this.createActorSprite(saint);
        });

        // Get all the male saints (Adam has already been included),
        // and select a random one to be designated as the preacher.
        const maleSaints: GCharSprite[] = this.getAllActors().filter(
            saint => saint.getGender() === "m"
        );
        this.preacher = RANDOM.randElement(maleSaints);
        const preacherPrevLabel: string = this.getLabelForActor(this.preacher) as string;

        // If the selected preacher is not the player, then we should
        // give Adam the preacher's previous label. This will make him
        // a generic actor, and allow him to be added in the congregation loop.
        if (preacherPrevLabel !== 'player') {
            this.setActorLabel(PLAYER.getSprite(), preacherPrevLabel);
        }
        this.setActorLabel(this.preacher, 'preacher');

        // Set up the script by adding actor commands:
        this.addCutsceneEvent({
            eventId: 'preacherSpawn',
            actor: 'preacher',
            command: `spawnAt(${SPAWN_PT.x},${SPAWN_PT.y})`,
            after: 'start',
            since: 0
        });
        this.addCutsceneEvent({
            eventId: 'preacherWalkToThreshold',
            actor: 'preacher',
            command: `walkTo(${THRESH_PT.x},${THRESH_PT.y})`,
            after: 'preacherSpawn',
            since: 0
        });
        this.addCutsceneEvent({
            eventId: 'preacherWalkToPulpit',
            actor: 'preacher',
            command: `walkTo(${BEFORE_PULPIT_PT.x},${BEFORE_PULPIT_PT.y})`,
            after: 'preacherWalkToThreshold',
            since: 0
        });
        this.addCutsceneEvent({
            eventId: 'preacherWalkAroundPulpit',
            actor: 'preacher',
            command: `walkTo(${AROUND_PULPIT_PT.x},${AROUND_PULPIT_PT.y})`,
            after: 'preacherWalkToPulpit',
            since: 0
        });
        this.addCutsceneEvent({
            eventId: 'preacherWalkPastPulpit',
            actor: 'preacher',
            command: `walkTo(${PAST_PULPIT_PT.x},${PAST_PULPIT_PT.y})`,
            after: 'preacherWalkAroundPulpit',
            since: 0
        });
        this.addCutsceneEvent({
            eventId: 'preacherWalkBehindPulpit',
            actor: 'preacher',
            command: `walkTo(${BEHIND_PULPIT_PT.x},${BEHIND_PULPIT_PT.y})`,
            after: 'preacherWalkPastPulpit',
            since: 0
        });
        this.addCutsceneEvent({
            eventId: 'preacherFaceCongregation',
            actor: 'preacher',
            command: 'faceDir(s)',
            after: 'preacherWalkBehindPulpit',
            since: 0
        });

        // After the preacher, we'll need to use a loop to add commands
        // for the other actors, since we don't know how many people
        // there will be in the church.

        // Reserve seats for the congregation ahead of time:
        const genericActors: number = this.getGenericActors().length;
        this.reserveSeats(genericActors);

        for (let a = 1; a <= genericActors; a++) {

            // Claim a random, already-reserved seat, so he/she knows where to go!
            const seat: PewSeat = this.claimSeat() as PewSeat;

            this.addCutsceneEvent({
                eventId: `actor_${a}Spawn`,
                actor: `actor_${a}`,
                command: `spawnAt(${SPAWN_PT.x},${SPAWN_PT.y})`,
                after: a === 1 ? 'preacherWalkToThreshold' : `actor_${a - 1}WalkToThreshold`,
                since: 0
            });
            this.addCutsceneEvent({
                eventId: `actor_${a}WalkToThreshold`,
                actor: `actor_${a}`,
                command: `walkTo(${THRESH_PT.x},${THRESH_PT.y})`,
                after: `actor_${a}Spawn`,
                since: 0
            });
            this.addCutsceneEvent({
                eventId: `actor_${a}WalkToRow`,
                actor: `actor_${a}`,
                command: `walkTo(${CENTER_X},${seat.point.y})`,
                after: `actor_${a}WalkToThreshold`,
                since: 0
            });
            this.addCutsceneEvent({
                eventId: `actor_${a}WalkToSeat`,
                actor: `actor_${a}`,
                command: `walkTo(${seat.point.x},${seat.point.y})`,
                postCode: () => {
                    let seatedCount: number = this.registry.get('seatedCount') ?? 0;
                    this.registry.set('seatedCount', ++seatedCount);
                },
                after: `actor_${a}WalkToRow`,
                since: 0
            });
            this.addCutsceneEvent({
                eventId: `actor_${a}FacePulpit`,
                actor: `actor_${a}`,
                command: 'faceDir(n)',
                after: `actor_${a}WalkToSeat`,
                since: 0
            });
        }

        // After all actors have been seated, we can start the service:
        this.addCutsceneEvent({
            eventId: 'beginService',
            condition: () => this.registry.get('seatedCount') as number === genericActors,
            after: `preacherFaceCongregation`,
            since: 0
        });

        // Sermon is preached as a conversation:
        this.addCutsceneEvent({
            eventId: 'preachSermon',
            eventCode: () => {
                GConversation.fromFile(sermon, this.getConversationChars(), 'sermon');
            },
            after: `beginService`,
            since: 1000
        });

        // Sermon is over when conversation is clear:
        this.addCutsceneEvent({
            eventId: 'sermonDone',
            condition: () => GFF.AdventureContent.getConversation() === null,
            after: 'preachSermon',
            since: 500
        });

        // The preacher will rejoice:
        this.addCutsceneEvent({
            eventId: 'preacherRejoice',
            actor: 'preacher',
            command: 'rejoice(2100)',
            after: 'sermonDone',
            since: 1000
        });

        // End the service:
        this.addCutsceneEvent({
            eventId: 'endService',
            eventCode: () => this.end(),
            after: 'preacherRejoice',
            since: 1000
        });
    }

    protected finalize(): void {
        STATS.changeInt('ServicesAttended', 1);
        GFF.AdventureContent.reloadCurrentRoom(() => {
            // Renable the exit and bottom bound:
            this.getExit().getBody().setEnable(true);
            GFF.AdventureContent.setBottomBoundEnabled(true);
            // Position the player at the center of the church:
            PLAYER.getSprite().centerPhysically({x: CENTER_X, y: CENTER_Y});
            PLAYER.getSprite().faceDirection(Dir9.S);
            PLAYER.giveGrace('minor');
        });
    }
}