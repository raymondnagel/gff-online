import { COLOR } from "../colors";
import { GChurch } from "../GChurch";
import { GConversation } from "../GConversation";
import { GFF } from "../main";
import { GPersonSprite } from "../objects/chars/GPersonSprite";
import { PLAYER } from "../player";
import { CLabeledChar, Dir9, GColor, GPerson } from "../types";
import { GCutscene } from "./GCutscene";

const CENTER_X: number = 512;
const ASIDE_X: number = 455;
const ASIDE_Y: number = 468;
const CELL_Y: number = 363;
const OUTSIDE_Y: number = 428;

export class GReleaseCaptiveCutscene extends GCutscene {

    private captive: GPersonSprite;

    constructor(captive: GPersonSprite) {
        super('release captive cutscene', true);
        this.captive = captive;
    }

    protected initialize(): void {

        // Add the captive as an actor:
        this.useActorSprite(this.captive, 'captive');

        // Set up the script by adding actor commands:

        // After one second, Adam backs out to allow space for the captive to emerge:
        this.addCutsceneEvent({
            eventId: 'adamBackOut',
            actor: 'player',
            command: `walkTo(${CENTER_X},${OUTSIDE_Y})`,
            after: 'start',
            since: 1000
        });
        // At the same time, the captive walks to the center of the cell:
        this.addCutsceneEvent({
            eventId: 'captiveToCenter',
            actor: 'captive',
            command: `walkTo(${CENTER_X},${CELL_Y})`,
            after: 'start',
            since: 1000
        });

        // Adam faces the captive after backing out:
        this.addCutsceneEvent({
            eventId: 'adamFaceNorth',
            actor: 'player',
            command: `faceDir(n)`,
            after: 'adamBackOut',
            since: 1
        });
        // At the same time, the captive faces south, preparing to exit the cell:
        this.addCutsceneEvent({
            eventId: 'captiveFaceSouth',
            actor: 'captive',
            command: `faceDir(s)`,
            after: 'captiveToCenter',
            since: 1
        });

        // We're not sure whether the player or the captive will reach their position first,
        // so we set the next event to occur after both are done moving.
        this.addCutsceneEvent({
            eventId: 'position1',
            condition: () => PLAYER.getSprite().getDirection() === Dir9.N && this.captive.getDirection() === Dir9.S,
            after: `adamFaceNorth`,
            since: 200
        });

        // Now the player proclaims liberty to the captive:
        this.addCutsceneEvent({
            eventId: 'proclaim',
            eventCode: () => {
                GConversation.fromFile('player_proclaim_liberty', [{ label: 'other', char: this.captive }]);
            },
            after: `position1`,
            since: 200
        });
        // Resume when the proclamation conversation is done:
        this.addCutsceneEvent({
            eventId: 'proclaimDone',
            condition: () => GFF.AdventureContent.getConversation() === null,
            after: 'proclaim',
            since: 0
        });

        // Now Adam will step aside to allow the captive to exit the cell:
        this.addCutsceneEvent({
            eventId: 'adamStepAside',
            actor: 'player',
            command: `walkTo(${ASIDE_X},${ASIDE_Y})`,
            postCode: () => {
                this.registry.set('adamAside', true);
            },
            after: 'proclaimDone',
            since: 200
        });
        // At the same time, the captive exits the cell and goes to where Adam was just standing:
        this.addCutsceneEvent({
            eventId: 'captiveExitCell',
            actor: 'captive',
            command: `walkTo(${CENTER_X},${OUTSIDE_Y})`,
            postCode: () => {
                this.registry.set('captiveExit', true);
            },
            after: 'proclaimDone',
            since: 200
        });

        // Again, we don't know who will reach their position first,
        // so we set the next event to occur after both are done moving.
        this.addCutsceneEvent({
            eventId: 'position2',
            condition: () => this.registry.get('captiveExit') === true && this.registry.get('adamAside') === true,
            after: `adamStepAside`,
            since: 0
        });

        // Post-release conversation:
        this.addCutsceneEvent({
            eventId: 'conversation',
            eventCode: () => {
                GConversation.fromFile('talk_to_released_conv', [{ label: 'other', char: this.captive }]);
            },
            after: `position2`,
            since: 200
        });
        // Resume when the post-release conversation is done:
        this.addCutsceneEvent({
            eventId: 'conversationDone',
            condition: () => GFF.AdventureContent.getConversation() === null,
            after: 'conversation',
            since: 0
        });

        // End the cutscene:
        this.addCutsceneEvent({
            eventId: 'end',
            eventCode: () => this.end(),
            after: 'conversationDone',
            since: 500
        });
    }

    protected finalize(): void {
        this.captive.setPrisoner(false);
        GFF.AdventureContent.startChars();
    }
}