import { COLOR } from "../colors";
import { FRUITS } from "../fruits";
import { GConversation } from "../GConversation";
import { GRestGoal } from "../goals/GRestGoal";
import { GFF } from "../main";
import { GPersonSprite } from "../objects/chars/GPersonSprite";
import { PLAYER } from "../player";
import { RANDOM } from "../random";
import { STATS } from "../stats";
import { CLabeledChar, Dir9, GPerson } from "../types";
import { GCutscene } from "./GCutscene";



export class GStreetPreachCutscene extends GCutscene {

    constructor() {
        super('street-preach cutscene', true);
    }



    private getRandomSermon(): string {
        const sermons: String[] = GFF.GAME.cache.json.entries.keys().filter(entry => entry.startsWith('street_sermon_'));
        return RANDOM.randElement(sermons) as string;
    }

    private getConversationChars(): CLabeledChar[] {
        const chars: CLabeledChar[] = [];
        // Player will be automatically added as 'player'

        // Everyone else is generically added as a 'sinner':
        this.getGenericActors().forEach(actor => {
            chars.push({label: 'sinner', char: actor});
        });
        return chars;
    }

    protected initialize(): void {
        // Stop characters, or the player might slide while trying to pull out the bullhorn:
        GFF.AdventureContent.stopChars();

        const sinners: GPersonSprite[] = GFF.AdventureContent.getPersons();

        // Add all sinners as generic actors:
        sinners.forEach(sinner => {
            this.useActorSprite(sinner);
        });

        // Get labeled characters for conversations:
        const chars: CLabeledChar[] = this.getConversationChars()

        // Set up the script by adding actor commands:

        // First, the player pulls out his bullhorn:
        this.addCutsceneEvent({
            eventId: 'bullhorn',
            actor: 'player',
            command: 'bullhorn',
            after: 'start',
            since: 100
        });

        // Next, begin the preach animation; it will continue until the end of the cutscene:
        this.addCutsceneEvent({
            eventId: 'preachAnim',
            eventCode: () => {
                PLAYER.getSprite().play('adam_preach_sw', false);
            },
            after: 'bullhorn',
            since: 0
        });

        this.addCutsceneEvent({
            eventId: 'sermon',
            eventCode: () => {
                GConversation.fromFile(this.getRandomSermon(), chars, 'streetpreach');
            },
            after: 'preachAnim',
            since: 100
        });

        this.addCutsceneEvent({
            eventId: 'sermonDone',
            condition: () => GFF.AdventureContent.getConversation() === null,
            after: 'sermon',
            since: 10
        });

        this.addCutsceneEvent({
            eventId: 'nobullhorn',
            actor: 'player',
            command: 'nobullhorn',
            after: 'sermonDone',
            since: 100
        });

        this.addCutsceneEvent({
            eventId: 'playerFaceSW',
            eventCode: () => {
                PLAYER.getSprite().faceDirection(Dir9.SW, true);
            },
            after: 'nobullhorn',
            since: 0
        });

        // End the cutscene:
        this.addCutsceneEvent({
            eventId: 'end',
            eventCode: () => this.end(),
            after: 'playerFaceSW',
            since: 200
        });
    }

    protected finalize(): void {
        const sinners: GPersonSprite[] = GFF.AdventureContent.getPersons();
        sinners.forEach(sinner => {
            const faithChange: number = RANDOM.randInt(5, 10 + FRUITS.getCount());
            const person: GPerson = sinner.getPerson();
            if (person.reprobate) {
                person.faith -= faithChange;
                person.faith = Math.max(person.faith, 0);
            } else {
                person.faith += faithChange;
                person.faith = Math.min(person.faith, 99);
            }
            sinner.setGoal(new GRestGoal(RANDOM.randInt(1000, 5000), sinner.getDirection()));
        });

        PLAYER.getSprite().showFloatingText('-1 sermon');
        PLAYER.changeSermons(-1);
        PLAYER.giveGrace('major');
        STATS.changeInt('SermonsPreached', 1);
        GFF.AdventureContent.startChars();
    }
}