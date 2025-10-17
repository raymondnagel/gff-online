import { COLOR } from "../colors";
import { DEPTH } from "../depths";
import { GRoom } from "../GRoom";
import { GFF } from "../main";
import { GObstacleStatic } from "../objects/obstacles/GObstacleStatic";
import { GStaircaseThreshold } from "../objects/touchables/GStaircaseThreshold";
import { PLAYER } from "../player";
import { Dir9 } from "../types";
import { GCutscene } from "./GCutscene";

/**
 * This cutscene works for both ascending and descending staircases,
 * since both up and down staircases have the same structure and size.
 */

export class GStairsCutscene extends GCutscene {

    constructor() {
        super('stairs cutscene', true);
    }

    private getStairs(): GObstacleStatic {
        return GFF.AdventureContent.children.list.find(gameObject =>
            gameObject.getData('stairs')
        ) as GObstacleStatic;
    }

    private getThreshold(): GStaircaseThreshold {
        return GFF.AdventureContent.children.list.find(gameObject =>
            gameObject instanceof GStaircaseThreshold
        ) as GStaircaseThreshold;
    }

    protected initialize(): void {
        // Get the current room and the next room:
        const room = GFF.AdventureContent.getCurrentRoom() as GRoom;
        const nextRoom = room.getPortalRoom() as GRoom;

        // Determine if we are going up or down the stairs:
        const dir = nextRoom.getFloor() > room.getFloor() ? 'up' : 'down';

        // Get staircase objects in the current room:
        const startStairs: GObstacleStatic = this.getStairs();
        const startThreshold: GStaircaseThreshold = this.getThreshold();

        const destX = startStairs.x + 50;
        const firstDestY = dir === 'up' ? startStairs.y + 16 : startStairs.y + 50;
        const lastStartY = dir === 'up' ? startStairs.y + 50 : startStairs.y + 16;
        const lastDestY = startStairs.y + 101;

        const firstTime = dir === 'up' ? 500 : 300;
        const secondTime = dir === 'up' ? 300 : 500;

        // Remove threshold so player can't re-trigger it:
        startThreshold.destroy();
        // Treat the stairs as a background decoration so the player can walk over it:
        startStairs.getBody().enable = false;
        startStairs.setDepth(DEPTH.BG_DECOR);

        // Play sound for steps on stairs:
        this.addCutsceneEvent({
            eventId: 'stepsSound',
            eventCode: () => {
                GFF.AdventureContent.getSound().playSound('stairs');
            },
            after: 'start',
            since: 5
        });

        // The player must enter the staircase going North; we'll start by having him continue over the stairs:
        this.addCutsceneEvent({
            eventId: 'playerClimb',
            actor: 'player',
            command: `walkTo(${destX},${firstDestY})`,
            after: 'start',
            since: 5
        });

        // Fade to black:
        this.addCutsceneEvent({
            eventId: 'fadeOut',
            eventCode: () => {
                GFF.AdventureContent.fadeOut(firstTime, COLOR.BLACK.num());
            },
            after: 'start',
            since: 5
        });

        // Unload everything belonging to the current room:
        this.addCutsceneEvent({
            eventId: 'unloadRoom',
            eventCode: () => {
                room.unload();
                PLAYER.getSprite().setVisible(false);
            },
            after: 'fadeOut',
            since: 500
        });

        // Stay faded out for a moment:
        this.addCutsceneEvent({
            eventId: 'stairwell',
            eventCode: () => {
            },
            after: 'unloadRoom',
            since: 1000
        });

        // Transition to the destination room:
        this.addCutsceneEvent({
            eventId: 'transitionToDestination',
            eventCode: () => {
                // Transition to the destination room:
                GFF.AdventureContent.transitionRoomDuringCutscene(nextRoom);

                // Get staircase objects in the destination room:
                const endStairs: GObstacleStatic = this.getStairs();
                const endThreshold: GStaircaseThreshold = this.getThreshold();

                // Disable threshold so player doesn't trigger it on the way out:
                endThreshold.getBody().enable = false;
                // Treat the stairs as a background decoration so the player can walk over it:
                endStairs.getBody().enable = false;
                endStairs.setDepth(DEPTH.BG_DECOR);

                // Place the player so he is coming out of the stairwell:
                PLAYER.getSprite().centerPhysically({x: destX, y: lastStartY});
                PLAYER.getSprite().faceDirection(Dir9.S, true);
                PLAYER.getSprite().setVisible(true);
            },
            after: 'stairwell',
            since: 10
        });

        // Fade into the destination room:
        this.addCutsceneEvent({
            eventId: 'fadeIn',
            eventCode: () => {
                GFF.AdventureContent.setVisionWithCheck();
                GFF.AdventureContent.fadeIn(secondTime, COLOR.BLACK.num());
            },
            after: 'transitionToDestination',
            since: 100
        });

        // The player must enter the staircase going North; we'll start by having him continue up the stairs:
        this.addCutsceneEvent({
            eventId: 'playerEmerge',
            actor: 'player',
            command: `walkTo(${destX},${lastDestY})`,
            after: 'transitionToDestination',
            since: 100
        });

        // End the cutscene:
        this.addCutsceneEvent({
            eventId: 'end',
            eventCode: () => this.end(),
            after: 'playerEmerge',
            since: 10
        });
    }

    protected finalize(): void {
        // Get staircase objects in the destination room:
        const topStairs: GObstacleStatic = this.getStairs();
        const topThreshold: GStaircaseThreshold = this.getThreshold();
        // Re-enable threshold so player can descend the stairs:
        topThreshold.getBody().enable = true;
        // Treat the stairs as a background decoration so the player can walk over it:
        topStairs.getBody().enable = true;
        topStairs.setDepth(topStairs.getBody().bottom);

        GFF.AdventureContent.startChars();
    }
}