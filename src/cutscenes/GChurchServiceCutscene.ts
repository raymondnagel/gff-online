import { GChurch } from "../GChurch";
import { GCharSprite } from "../objects/chars/GCharSprite";
import { RANDOM } from "../random";
import { GPoint } from "../types";
import { GCutscene } from "./GCutscene";

// Everyone in this cutscene will spawn at the same point (entrance):
const SPAWN_POINT: GPoint = {x: 512, y: 632};

export class GChurchServiceCutscene extends GCutscene {

    private church: GChurch;
    private preacher: GCharSprite;

    constructor(church: GChurch) {
        super('church service cutscene');
        this.church = church;
    }

    protected initialize(): void {
        console.log(`Cutscene "${this.getName()}" starting...`);

        // Add all church saints as actors:
        this.church.getPeople().forEach(saint => {
            this.addActor(saint);
        });

        // Get all the male saints (Adam has already been included),
        // and select a random one to be designated as the preacher.
        const maleSaints: GCharSprite[] = this.getAllActors().filter(
            saint => saint.getGender() === "m"
        );
        this.preacher = RANDOM.randElement(maleSaints);
        this.setActorLabel(this.preacher, 'preacher');

        // Set up the script by adding actor commands:
        this.addActorCommand({
            eventId: 'preacherSpawn',
            actor: 'preacher',
            command: `spawnAt(${SPAWN_POINT.x},${SPAWN_POINT.y})`,
            after: 'start',
            since: 0
        });
        this.addActorCommand({
            eventId: 'preacherWalkToThreshold',
            actor: 'preacher',
            command: 'walkDir(n,100)',
            after: 'preacherSpawn',
            since: 0
        });
        this.addActorCommand({
            eventId: 'preacherWalkToPulpit',
            actor: 'preacher',
            command: 'walkDir(n,262)',
            after: 'preacherWalkToThreshold',
            since: 0
        });
        this.addActorCommand({
            eventId: 'preacherWalkAroundPulpit',
            actor: 'preacher',
            command: 'walkDir(nw,70)',
            after: 'preacherWalkToPulpit',
            since: 0
        });
        this.addActorCommand({
            eventId: 'preacherWalkPastPulpit',
            actor: 'preacher',
            command: 'walkDir(n,53)',
            after: 'preacherWalkAroundPulpit',
            since: 0
        });
        this.addActorCommand({
            eventId: 'preacherWalkBehindPulpit',
            actor: 'preacher',
            command: 'walkDir(e,73)',
            after: 'preacherWalkPastPulpit',
            since: 0
        });
        this.addActorCommand({
            eventId: 'preacherFaceCongregation',
            actor: 'preacher',
            command: 'faceDir(s)',
            after: 'preacherWalkBehindPulpit',
            since: 0
        });
        this.addActorCommand({
            eventId: 'preacherRejoice',
            actor: 'preacher',
            command: 'rejoice(800)',
            after: 'preacherFaceCongregation',
            since: 10000
        });

        //TODO: Add a function like "stop" to GGoal to be executed before the aftermath.
        // For examplem, in stop, stop the character from walking, but don't change direction.

        //TODO: Modify preacher selection so that Adam is only chosen to preach if he is at max faith.
        // Since hearing a sermon will restore his faith, this will make it so his faith is only restored
        // when he hears a sermon, not when he preaches (already full).

        // After the preacher, we'll need to use a loop to add commands
        // for the other actors, since we don't know how many people
        // there will be in the church.
    }
}