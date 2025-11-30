import { COLOR } from "../colors";
import { GRoom } from "../GRoom";
import { GFF } from "../main";
import { GEnemySprite } from "../objects/chars/GEnemySprite";
import { GImpSprite } from "../objects/chars/GImpSprite";
import { PHYSICS } from "../physics";
import { PLAYER } from "../player";
import { SCENERY } from "../scenery";
import { STATS } from "../stats";
import { GSceneryDef, GSceneryPlan } from "../types";
import { GCutscene } from "./GCutscene";

export class GRaiseStandardCutscene extends GCutscene {

    constructor() {
        super('raise-standard cutscene', true);
    }

    private placeStandard() {
        const standardDef: GSceneryDef = SCENERY.def('standard');

        /**
         * Place the standard so that it is horizontally centered with the player, but
         * its physical top is equal to the player's physical top; the standard's body
         * will be entirely within the player's body. Thus the standard is guaranteed
         * to be in a valid space, since it was entirely accessible to the player.
         * Since the player and the standard physically overlap initially,
         * the player will be able to move in any direction without hitting it; but
         * once he moves away, it will still be a physical obstacle.
         */

        // Place the standard directly to the north of the player:
        const playerCenter = PLAYER.getSprite().getPhysicalCenter();
        const stdX: number = playerCenter.x - (standardDef.body.width / 2);
        const stdY: number = PHYSICS.getPhysicalTop(PLAYER.getSprite()) as number;

        // Permanently place the standard in the room:
        const room: GRoom = GFF.AdventureContent.getCurrentRoom() as GRoom;
        const plan: GSceneryPlan|null = room.planSceneryDuringGameplay(standardDef, stdX, stdY, 0, 0);
        if (plan !== null) {
            SCENERY.create(plan, room);
        }
    }

    private banishEnemies(enemies: GEnemySprite[]) {
        // Banish all enemies in the room:
        for (let n = enemies.length - 1; n >= 0; n--) {
            GFF.AdventureContent.banishEnemy(enemies[n]);
        }
    }

    protected initialize(): void {
        // Stop characters, or the player might slide while trying to set up the standard:
        GFF.AdventureContent.stopChars();

        // Get a list of enemies in the room, so we can banish them later:
        const enemies: GEnemySprite[] = GFF.AdventureContent.getEnemies();

        // Set up the script by adding actor commands:

        // First, the player faces north, since the standard will be raised to the north:
        this.addCutsceneEvent({
            eventId: 'faceNorth',
            actor: 'player',
            command: 'faceDir(n)',
            after: 'start',
            since: 100
        });
        // Then the player does an interact animation to set up the standard:
        this.addCutsceneEvent({
            eventId: 'setUp',
            actor: 'player',
            command: 'interact',
            after: 'faceNorth',
            since: 100
        });
        // There is a miracle as the standard is raised, consecrating the area:
        this.addCutsceneEvent({
            eventId: 'standardMiracle',
            eventCode: () => {
                GFF.AdventureContent.getSound().playSound('ahh');
                GFF.AdventureContent.fadeOut(500, COLOR.WHITE.num(), () => {
                    this.placeStandard();
                    GFF.AdventureContent.setVisionWithCheck();
                    GFF.AdventureContent.fadeIn(500, COLOR.WHITE.num(), () => {
                        this.banishEnemies(enemies);
                    });
                });
            },
            after: 'start',
            since: 110
        });
        // End the cutscene:
        this.addCutsceneEvent({
            eventId: 'end',
            eventCode: () => this.end(),
            after: 'standardMiracle',
            since: 500
        });
    }

    protected finalize(): void {
        PLAYER.getSprite().showFloatingText('-1 standard', 'info');
        PLAYER.changeStandards(-1);
        PLAYER.giveGrace('major');
        STATS.changeInt('StandardsRaised', 1);
        GFF.AdventureContent.startChars();
    }
}