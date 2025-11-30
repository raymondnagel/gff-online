import { COLOR } from "../colors";
import { GConversation } from "../GConversation";
import { GFF } from "../main";
import { PLAYER } from "../player";
import { GCutscene } from "./GCutscene";

export class GPrayCutscene extends GCutscene {

    constructor() {
        super('pray cutscene', true);
    }

    protected initialize(): void {
        // Stop characters, or the player might slide while trying to pray:
        GFF.AdventureContent.stopChars();

        // Set up the script by adding actor commands:

        // First, the player kneels down in a humble position:
        this.addCutsceneEvent({
            eventId: 'kneel',
            actor: 'player',
            command: 'kneel',
            after: 'start',
            since: 100
        });
        // We'll fade to black to simulate Adam closing his eyes:
        this.addCutsceneEvent({
            eventId: 'closeEyes',
            eventCode: () => {
                GFF.AdventureContent.fadeOut(1000, COLOR.BLACK.num());
                GFF.AdventureContent.getSound().fadeOutMusic(1000);
            },
            after: 'kneel',
            since: 1000
        });
        // Begin the prayer as a conversation:
        this.addCutsceneEvent({
            eventId: 'sayPrayer',
            eventCode: () => {
                GConversation.fromFile('player_prayer_conv', [], 'playerpray');
            },
            after: 'closeEyes',
            since: 1500
        });
        // Detect when the conversation ends, so we can continue the cutscene:
        this.addCutsceneEvent({
            eventId: 'prayerDone',
            condition: () => GFF.AdventureContent.getConversation() === null,
            after: 'sayPrayer',
            since: 10
        });
        // The prayer is done, so we fade in to simulate Adam opening his eyes:
        this.addCutsceneEvent({
            eventId: 'openEyes',
            eventCode: () => {
                GFF.AdventureContent.fadeIn(1000, COLOR.BLACK.num());
            },
            after: 'prayerDone',
            since: 200
        });
        // Adam stands up, facing north, and turns around little by little until he's facing south:
        this.addCutsceneEvent({
            eventId: 'standUp',
            actor: 'player',
            command: 'faceDir(n)',
            after: 'prayerDone',
            since: 1000
        });
        this.addCutsceneEvent({
            eventId: 'turnNe',
            actor: 'player',
            command: 'faceDir(ne)',
            after: 'standUp',
            since: 400
        });
        this.addCutsceneEvent({
            eventId: 'turnE',
            actor: 'player',
            command: 'faceDir(e)',
            after: 'turnNe',
            since: 100
        });
        this.addCutsceneEvent({
            eventId: 'turnSe',
            actor: 'player',
            command: 'faceDir(se)',
            after: 'turnE',
            since: 100
        });
        this.addCutsceneEvent({
            eventId: 'turnS',
            actor: 'player',
            command: 'faceDir(s)',
            after: 'turnSe',
            since: 100
        });
        // Change to a 'lifting holy hands' animation:
        this.addCutsceneEvent({
            eventId: 'liftHolyHands',
            actor: 'player',
            command: 'raiseHands',
            after: 'turnS',
            since: 300
        });
        this.addCutsceneEvent({
            eventId: 'prayerMiracle',
            eventCode: () => {
                GFF.AdventureContent.getSound().playSound('ahh');
                const faithDiff: number = PLAYER.getMaxFaith() - PLAYER.getFaith();
                const change: number = Math.min(faithDiff, PLAYER.getGrace());
                const faithWrapper: {value: number} = {value: PLAYER.getFaith()};
                const graceWrapper: {value: number} = {value: PLAYER.getGrace()};
                const newFaith: number = PLAYER.getFaith() + change;
                const newGrace: number = PLAYER.getGrace() - change;
                // Tween for increasing faith:
                GFF.AdventureContent.tweens.add({
                    targets: [faithWrapper],
                    duration: 1000,
                    value: newFaith,
                    onUpdate: () => {
                        PLAYER.setFaith(Math.floor(faithWrapper.value));
                    },
                    onComplete: () => {
                        GFF.AdventureContent.setVisualsByFaith();
                    }
                });
                // Tween for decreasing grace:
                GFF.AdventureContent.tweens.add({
                    targets: [graceWrapper],
                    duration: 1000,
                    value: newGrace,
                    onUpdate: () => {
                        PLAYER.setGrace(Math.floor(graceWrapper.value));
                    }
                });
                GFF.AdventureContent.fadeOut(500, COLOR.WHITE.num(), () => {
                    GFF.AdventureContent.fadeIn(500, COLOR.WHITE.num());
                });
            },
            after: 'liftHolyHands',
            since: 500
        });
        // End the cutscene; Adam will put his hands down when the cutscene ends.
        this.addCutsceneEvent({
            eventId: 'end',
            eventCode: () => this.end(),
            after: 'prayerMiracle',
            since: 500
        });
    }

    protected finalize(): void {
        GFF.AdventureContent.getSound().fadeInMusic(1000);
        GFF.AdventureContent.startChars();
    }
}