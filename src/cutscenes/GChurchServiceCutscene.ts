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
            since: 5000
        });
        this.addActorCommand({
            eventId: 'preacherWalk',
            actor: 'preacher',
            command: 'walkDir(n,100)',
            after: 'preacherSpawn',
            since: 2000
        });

        // After the preacher, we'll need to use a loop to add commands
        // for the other actors, since we don't know how many people
        // there will be in the church.
    }
}