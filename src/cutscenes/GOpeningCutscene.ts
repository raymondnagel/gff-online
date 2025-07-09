import { COLOR } from "../colors";
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

export class GOpeningCutscene extends GCutscene {

    private church: GChurch;
    private preacher: GCharSprite;

    private pews: PewSeat[][] = [];

    constructor(church: GChurch) {
        super('opening cutscene');
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

        // Reserve the first seat in the back/right row for the player:
        this.pews[5][0].state = 'reserved';
    }

    // Claim and return a random seat that is not already reserved:
    private claimSeat(): PewSeat|null {
        const availableSeats: PewSeat[] = this.pews.flat().filter(seat => seat.state === 'empty');
        if (availableSeats.length === 0) return null;
        const chosenSeat: PewSeat = RANDOM.randElement(availableSeats);
        chosenSeat.state = 'claimed';
        return chosenSeat;
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
        /**
         * This cutscene is the opening cutscene of the game.
         * It has a lot of similarities to the church service cutscene, since
         * it also takes place in a church. One of the main differences is that
         * all characters (except the player) are already spawned in the church,
         * so we don't need to do the same reserve/claim/walk process.
         *
         * However, we do need to reserve one particular seat for the player,
         * and then distribute the other church members randomly around the church.
         */

        // Adam begins the game without any faith:
        PLAYER.setFaith(0);

        // Immediately stop the default church background music:
        GFF.AdventureContent.getSound().stopMusic();

        // Start with a black screen, and update the fidelity mode:
        GFF.AdventureContent.shroud();
        GFF.AdventureContent.updateFidelityMode();

        // Disable bottom bound and exit so the player can enter from off the screen:
        GFF.AdventureContent.setBottomBoundEnabled(false);
        this.getExit().getBody().setEnable(false);

        // Add all church saints as actors:
        this.church.getPeople().forEach(saint => {
            this.createActorSprite(saint);
        });

        // Find the preacher and set him as the preacher:
        this.preacher = this.getAllActors().find(actor => actor.getPerson().spriteKeyPrefix === 'preacher') as GCharSprite;
        this.setActorLabel(this.preacher, 'preacher');

        // Set up the script by adding actor commands:

        // Spawn the preacher behind the pulpit:
        this.addCutsceneEvent({
            eventId: 'preacherSpawn',
            actor: 'preacher',
            command: `spawnAt(${BEHIND_PULPIT_PT.x},${BEHIND_PULPIT_PT.y})`,
            after: 'start',
            since: 0
        });

        // Spread the church members randomly around the church:
        const genericActors: number = this.getGenericActors().length;
        for (let a = 1; a <= genericActors; a++) {
            const seat: PewSeat = this.claimSeat() as PewSeat;
            this.addCutsceneEvent({
                eventId: `actor${a}Spawn`,
                actor: `actor_${a}`,
                command: `spawnAt(${seat.point.x},${seat.point.y})`,
                after: 'start',
                since: 0
            });
            this.addCutsceneEvent({
                eventId: `actor${a}FacePulpit`,
                actor: `actor_${a}`,
                command: `faceDir(n)`,
                after: `actor${a}Spawn`,
                since: 0
            });
        }

        // The preacher faces the congregation:
        this.addCutsceneEvent({
            eventId: 'preacherFaceCongregation',
            actor: 'preacher',
            command: 'faceDir(s)',
            after: 'preacherSpawn',
            since: 0
        });

        // Fade in from black to start the cutscene:
        this.addCutsceneEvent({
            eventId: 'fadeIn',
            eventCode: () => {
                GFF.AdventureContent.fadeIn(2000, COLOR.BLACK.num());
                GFF.AdventureContent.getSound().fadeInMusic(2000, 'words')
            },
            after: 'preacherFaceCongregation',
            since: 1000
        });

        // Adam walks into the church and takes the first seat to the right, in the back row:
        const seat: PewSeat = this.pews[5][0];
        this.addCutsceneEvent({
            eventId: `playerSpawn`,
            actor: `player`,
            command: `spawnAt(${SPAWN_PT.x},${SPAWN_PT.y})`,
            after: `fadeIn`,
            since: 2000
        });
        this.addCutsceneEvent({
            eventId: `playerWalkToRow`,
            actor: `player`,
            command: `walkTo(${CENTER_X},${seat.point.y})`,
            after: `playerSpawn`,
            since: 0
        });
        this.addCutsceneEvent({
            eventId: `playerWalkToSeat`,
            actor: `player`,
            command: `walkTo(${seat.point.x},${seat.point.y})`,
            after: `playerWalkToRow`,
            since: 0
        });
        this.addCutsceneEvent({
            eventId: `playerFacePulpit1`,
            actor: `player`,
            command: `faceDir(n)`,
            after: `playerWalkToSeat`,
            since: 0
        });

        // The preacher begins the service dialogue, which is mostly a sermon:
        this.addCutsceneEvent({
            eventId: 'preachSermon',
            eventCode: () => {
                GConversation.fromFile('opening_1_conv', this.getConversationChars());
            },
            after: `playerFacePulpit1`,
            since: 1000
        });

        // Sermon is over when conversation is clear:
        this.addCutsceneEvent({
            eventId: 'sermonDone',
            condition: () => GFF.AdventureContent.getConversation() === null,
            after: 'preachSermon',
            since: 500
        });

        // Adam walks to the center aisle:
        this.addCutsceneEvent({
            eventId: `playerWalkToAisle`,
            actor: `player`,
            command: `walkTo(${CENTER_X},${seat.point.y})`,
            after: `sermonDone`,
            since: 10
        });

        // Adam faces the preacher again:
        this.addCutsceneEvent({
            eventId: `playerFacePulpit2`,
            actor: `player`,
            command: `faceDir(n)`,
            after: `playerWalkToAisle`,
            since: 100
        });

        // Adam confesses that Jesus is both Lord and Christ!
        this.addCutsceneEvent({
            eventId: 'confession',
            eventCode: () => {
                GConversation.fromFile('opening_2_conv', this.getConversationChars());
            },
            after: `playerFacePulpit2`,
            since: 500
        });

        // Confession is over when conversation is clear:
        this.addCutsceneEvent({
            eventId: 'confessionDone',
            condition: () => GFF.AdventureContent.getConversation() === null,
            after: 'confession',
            since: 10
        });

        // First, the player kneels down in a humble position:
        this.addCutsceneEvent({
            eventId: 'kneel',
            actor: 'player',
            command: 'kneel',
            after: 'confessionDone',
            since: 500
        });
        // We'll fade to black to simulate Adam closing his eyes:
        this.addCutsceneEvent({
            eventId: 'closeEyes',
            eventCode: () => {
                GFF.AdventureContent.fadeOut(1000, COLOR.BLACK.num());
            },
            after: 'kneel',
            since: 1000
        });
        // Begin the prayer as a conversation:
        this.addCutsceneEvent({
            eventId: 'sayPrayer',
            eventCode: () => {
                GConversation.fromFile('opening_3_conv', this.getConversationChars(), 'playerpray');
            },
            after: 'closeEyes',
            since: 1500
        });
        // Prayer is over when conversation is clear:
        this.addCutsceneEvent({
            eventId: 'prayerDone',
            condition: () => GFF.AdventureContent.getConversation() === null,
            after: 'sayPrayer',
            since: 10
        });

        /**
         * From this point on, events are temporary.
         * We will eventually fade in to a baptism scene, and then
         * to another scene where the preacher instructs Adam.
         */

        // The prayer is done, so we fade in to simulate Adam opening his eyes:
        this.addCutsceneEvent({
            eventId: 'openEyes',
            eventCode: () => {
                GFF.AdventureContent.fadeIn(1000, COLOR.BLACK.num());
            },
            after: 'prayerDone',
            since: 200
        });

        // The preacher will rejoice:
        this.addCutsceneEvent({
            eventId: 'preacherRejoice',
            actor: 'preacher',
            command: 'rejoice(2100)',
            after: 'prayerDone',
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
            // Re-enable the exit and bottom bound:
            this.getExit().getBody().setEnable(true);
            GFF.AdventureContent.setBottomBoundEnabled(true);
            // Position the player at the center of the church:
            PLAYER.getSprite().centerPhysically({x: CENTER_X, y: CENTER_Y});
            PLAYER.getSprite().faceDirection(Dir9.S, true);
        });
    }
}