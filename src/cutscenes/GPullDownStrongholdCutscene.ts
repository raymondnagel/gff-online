import { COLOR } from "../colors";
import { DEPTH } from "../depths";
import { GConversation } from "../GConversation";
import { GRoom } from "../GRoom";
import { GFF } from "../main";
import { GCharSprite } from "../objects/chars/GCharSprite";
import { GProphetSprite } from "../objects/chars/GProphetSprite";
import { PLAYER } from "../player";
import { RANDOM } from "../random";
import { Dir9, GPoint2D } from "../types";
import { GCutscene } from "./GCutscene";

const RUBBLE_CHUNKS = ['rubble_chunk_1', 'rubble_chunk_2', 'rubble_chunk_3'];
const STRONGHOLD_BASE_Y: number = 480;
const PLAYER_SPAWN_PT: GPoint2D = {x: 382, y: STRONGHOLD_BASE_Y + 10};
const PROPHET_SPAWN_PT: GPoint2D = {x: 642, y: STRONGHOLD_BASE_Y + 10};

export class GPullDownStrongholdCutscene extends GCutscene {

    private outsideRoom: GRoom;
    private strongholdHeight: number;
    private holders: GCharSprite[];
    private grapplePoints: GPoint2D[];
    private ropes: Phaser.GameObjects.TileSprite[];
    private hooks: Phaser.GameObjects.Image[];
    private chunks: Phaser.GameObjects.Image[];

    constructor(outsideRoom: GRoom) {
        super('pull down stronghold cutscene', true);
        this.outsideRoom = outsideRoom;
    }

    /**
     * Returns points for a row of chunks. Make sure to start with row 0.
     */
    private createChunkRow(rowFromBase: number, numWide: number): GPoint2D[] {
        const y = STRONGHOLD_BASE_Y - 24 - (rowFromBase * 48);
        const totalWidth = numWide * 48;
        const startX = 512 - (totalWidth / 2) + 24;
        const points: GPoint2D[] = [];
        for (let n = 0; n < numWide; n++) {
            points.push({x: startX + (n * 48), y});
        }
        return points;

    }

    private createChunks(strongholdKey: string) {
        let chunkPoints: GPoint2D[] = [];
        switch (strongholdKey) {
            case 'tower_front':
                chunkPoints = [
                    ...this.createChunkRow(0, 4),
                    ...this.createChunkRow(1, 4),
                    ...this.createChunkRow(2, 4),
                    ...this.createChunkRow(3, 4),
                    ...this.createChunkRow(4, 4),
                    ...this.createChunkRow(5, 2),
                    ...this.createChunkRow(6, 4),
                ];
                break;
            case 'dungeon_front':
                chunkPoints = [
                    ...this.createChunkRow(0, 6),
                    ...this.createChunkRow(1, 6),
                    ...this.createChunkRow(2, 6),
                    ...this.createChunkRow(3, 6),
                ];
                break;
            case 'keep_front':
                chunkPoints = [
                    ...this.createChunkRow(0, 6),
                    ...this.createChunkRow(1, 6),
                    ...this.createChunkRow(2, 6),
                    ...this.createChunkRow(3, 6),
                    ...this.createChunkRow(4, 6),
                    ...this.createChunkRow(5, 4),
                    ...this.createChunkRow(6, 4),
                ];
                break;
            case 'fortress_front':
                chunkPoints = [
                    ...this.createChunkRow(0, 8),
                    ...this.createChunkRow(1, 6),
                    ...this.createChunkRow(2, 6),
                    ...this.createChunkRow(3, 6),
                    ...this.createChunkRow(4, 6),
                    ...this.createChunkRow(5, 6),
                    {x: 392, y: STRONGHOLD_BASE_Y - 24 - (6 * 48)},
                    {x: 632, y: STRONGHOLD_BASE_Y - 24 - (6 * 48)},
                ];
                break;
            case 'castle_front':
                chunkPoints = [
                    ...this.createChunkRow(0, 8),
                    ...this.createChunkRow(1, 8),
                    ...this.createChunkRow(2, 8),
                    ...this.createChunkRow(3, 8),
                    ...this.createChunkRow(4, 6),
                    ...this.createChunkRow(5, 6),
                    ...this.createChunkRow(6, 6),
                    ...this.createChunkRow(7, 2),
                ];
                break;
        }
        this.chunks = chunkPoints.map(point =>
            GFF.AdventureContent.add.image(point.x, point.y, RANDOM.randElement(RUBBLE_CHUNKS) as string)
                .setOrigin(0.5, 0.5)
                .setDepth(DEPTH.SPECIAL_EFFECT)
                .setVisible(false)
        );
    }

    private beginChunking() {
        for (const chunk of this.chunks) {
            const ctrY = STRONGHOLD_BASE_Y - (this.strongholdHeight / 2);
            const dx = chunk.x - 512;
            const dy = chunk.y - ctrY;

            const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
            const nx = dx / len;
            const ny = dy / len;

            const burstDistance = Phaser.Math.Between(140, 260);
            const driftX = Phaser.Math.Between(-30, 30);

            const targetX = chunk.x + (nx * burstDistance) + driftX;

            const riseY = chunk.y - Phaser.Math.Between(40, 90);
            const fallY = riseY + Phaser.Math.Between(180, 300);

            const totalDuration = Phaser.Math.Between(900, 1400);
            const riseDuration = Phaser.Math.Between(120, 220);
            const fallDuration = totalDuration - riseDuration;

            chunk.setVisible(true);
            chunk.setAlpha(1);

            // Horizontal/outward motion
            GFF.AdventureContent.tweens.add({
                targets: chunk,
                x: targetX,
                angle: chunk.angle + Phaser.Math.Between(-120, 120),
                alpha: 0,
                duration: totalDuration,
                ease: 'Cubic.easeOut',
                onComplete: () => chunk.destroy()
            });

            // Vertical motion: quick rise, then heavier fall
            GFF.AdventureContent.tweens.add({
                targets: chunk,
                y: riseY,
                duration: riseDuration,
                ease: 'Quad.easeOut',
                onComplete: () => {
                    GFF.AdventureContent.tweens.add({
                        targets: chunk,
                        y: fallY,
                        duration: fallDuration,
                        ease: 'Quad.easeIn'
                    });
                }
            });
        }
    }

    private beginSmoke() {
        const smoke = GFF.AdventureContent.add.sprite(512, STRONGHOLD_BASE_Y - (this.strongholdHeight / 2), 'big_smoke');
        smoke.setOrigin(0.5, 0.5).setAlpha(1).setScale(0.6).setDepth(DEPTH.SPECIAL_EFFECT + 100);
        GFF.AdventureContent.anims.create({
            key: 'big_smoke',
            frames: GFF.AdventureContent.anims.generateFrameNumbers(
                'big_smoke',
                { start: 0, end: 9 }
            ),
            frameRate: 20,
            repeat: -1 // Infinite loop
        });
        smoke.play('big_smoke');
        GFF.AdventureContent.tweens.add({
            targets: smoke,
            alpha: 0,
            scale: 1.5,
            duration: 2000
        });
    }

    private beginDebrisExplosion() {
        const emitter = GFF.AdventureContent.add.particles(512, STRONGHOLD_BASE_Y - (this.strongholdHeight / 2), 'rubble_debris', {
            lifespan: 1200,
            speed: { min: 500, max: 1000 },
            alpha: { start: 1.0, end: 0.0},
            gravityY: 1500,
            blendMode: Phaser.BlendModes.NORMAL,
            emitting: false
        });
        emitter.explode(Phaser.Math.Between(50, 100));
    }

    /**
     * Returns an array of 2 points.
     * Index 0 is where the player's grappling hook attaches to the stronghold.
     * Index 1 is where the prophets's grappling hook attaches.
     * The points depend on what kind of stronghold it is.
     *
     * Since we're determining the stronghold type here, we can also
     * create the appropriate chunks and add them to the scene.
     */
    private getGrapplingPoints(): GPoint2D[] {
        if (this.outsideRoom.hasPlanKey('tower_front')) {
            this.createChunks('tower_front');
            this.strongholdHeight = 362;
            return [
                {x: 447, y: 146},
                {x: 577, y: 146}
            ];
        } else if (this.outsideRoom.hasPlanKey('dungeon_front')) {
            this.createChunks('dungeon_front');
            this.strongholdHeight = 211;
            return [
                {x: 417, y: 290},
                {x: 611, y: 290}
            ];
        } else if (this.outsideRoom.hasPlanKey('keep_front')) {
            this.createChunks('keep_front');
            this.strongholdHeight = 357;
            return [
                {x: 442, y: 152},
                {x: 582, y: 152}
            ];
        } else if (this.outsideRoom.hasPlanKey('fortress_front')) {
            this.createChunks('fortress_front');
            this.strongholdHeight = 342;
            return [
                {x: 403, y: 163},
                {x: 620, y: 163}
            ];
        } else if (this.outsideRoom.hasPlanKey('castle_front')) {
            this.createChunks('castle_front');
            this.strongholdHeight = 396;
            return [
                {x: 452, y: 239},
                {x: 572, y: 239}
            ];
        }
        throw new Error('Trying to grapple a stronghold that does not exist!');
    }

    private createRopes() {
        this.grapplePoints = this.getGrapplingPoints();
        const scene = GFF.AdventureContent;
        this.ropes = [
            scene.add.tileSprite(0, 0, 12, 6, 'rope_section')
                .setOrigin(0, .5)
                .setDepth(DEPTH.OH_DECOR)
                .setVisible(true),
            scene.add.tileSprite(0, 0, 12, 6, 'rope_section')
                .setOrigin(0, .5)
                .setDepth(DEPTH.OH_DECOR)
                .setVisible(true)
        ];
        this.hooks = [
            scene.add.image(0, 0, 'grapple_hook')
                .setOrigin(.5, .5)
                .setDepth(DEPTH.OH_DECOR)
                .setVisible(true),
            scene.add.image(0, 0, 'grapple_hook')
                .setOrigin(.5, .5)
                .setDepth(DEPTH.OH_DECOR)
                .setVisible(true)
        ];
    }

    private updateRope(ropeIndex: 0|1) {
        const x1 = this.holders[ropeIndex].getCenter().x;
        const y1 = this.holders[ropeIndex].getCenter().y + 10;
        const x2 = this.grapplePoints[ropeIndex].x;
        const y2 = this.grapplePoints[ropeIndex].y;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        // position at the holder's center
        this.ropes[ropeIndex].setPosition(x1, y1);
        // rotate toward the stronghold
        this.ropes[ropeIndex].setRotation(angle);
        // stretch by width (this is the magic)
        this.ropes[ropeIndex].width = distance;
        // optional: subtle texture scroll for tension feel
        this.ropes[ropeIndex].tilePositionX += distance * 0.02;

        // position the hook at the end of the rope
        this.hooks[ropeIndex].setPosition(x2, y2);
        this.hooks[ropeIndex].setRotation(angle);
    }

    private retractRope(ropeIndex: 0 | 1, duration: number = 1000) {
        const holder = this.holders[ropeIndex];
        const targetX = holder.getCenter().x;
        const targetY = holder.getCenter().y + 10;

        const point = this.grapplePoints[ropeIndex];

        GFF.AdventureContent.tweens.add({
            targets: point,
            x: targetX,
            y: targetY,
            duration,
            ease: 'Quad.easeIn',

            onUpdate: () => {
                this.updateRope(ropeIndex);
            },

            onComplete: () => {
                // Optional: hide rope + hook after it reaches the player
                this.ropes[ropeIndex].setVisible(false);
                this.hooks[ropeIndex].setVisible(false);
            }
        });
    }

    private fallBackward() {
        const playerDest: GPoint2D = {x: this.holders[0].x - 25, y: this.holders[0].y + 10};
        const prophetDest: GPoint2D = {x: this.holders[1].x + 25, y: this.holders[1].y + 10};
        GFF.AdventureContent.tweens.add({
            targets: this.holders[0],
            x: playerDest.x,
            y: playerDest.y,
            duration: 200,
            ease: 'Quad.easeIn'
        });
        GFF.AdventureContent.tweens.add({
            targets: this.holders[1],
            x: prophetDest.x,
            y: prophetDest.y,
            duration: 200,
            ease: 'Quad.easeIn'
        });
    }

    private showTitle1() {
        const title = GFF.AdventureContent.add.text(512, 100, 'Mighty through God', {
            fontFamily: 'olde',
            fontSize: '72px',
            color: COLOR.GOLD_5.str(),
            stroke: COLOR.BLACK.str(),
            strokeThickness: 8
        }).setOrigin(0.5).setDepth(DEPTH.FLOAT_TEXT + 200).setAlpha(0).setPadding({
            left: 20,
            right: 20,
            top: 0,
            bottom: 0
        });
        GFF.AdventureContent.tweens.add({
            targets: title,
            alpha: 1,
            duration: 1500
        });
    }
    private showTitle2() {
        const title = GFF.AdventureContent.add.text(512, 172, 'to the pulling down of strongholds!', {
            fontFamily: 'olde',
            fontSize: '72px',
            color: COLOR.GOLD_5.str(),
            stroke: COLOR.BLACK.str(),
            strokeThickness: 8
        }).setOrigin(0.5).setDepth(DEPTH.FLOAT_TEXT + 200).setAlpha(0).setPadding({
            left: 20,
            right: 20,
            top: 0,
            bottom: 0
        });
        GFF.AdventureContent.tweens.add({
            targets: title,
            alpha: 1,
            duration: 1500
        });
    }

    protected initialize(): void {
        // Immediately stop the background music:
        GFF.AdventureContent.getSound().fadeOutMusic(1000);

        // Remove corruption patches now that the stronghold is clear
        this.outsideRoom.removeAllPlansByKey('corruption_patch');
        // We've already transitioned into the room; but reload it to clear the patches
        GFF.AdventureContent.setCurrentRoom(
            this.outsideRoom.getX(),
            this.outsideRoom.getY(),
            this.outsideRoom.getFloor(),
            this.outsideRoom.getArea(),
            true, // ignore background music since we just stopped it
            false // don't show the title for the cutscene
        );

        // Create actor sprite for the Prophet; he'll help Adam to pull down the stronghold
        this.createActorSprite(GProphetSprite.getProphetPerson(), 'prophet');

        // Add Adam and the Prophet as holders of the ropes:
        this.holders = [
            this.getSpecificActor('player') as GCharSprite,
            this.getSpecificActor('prophet') as GCharSprite
        ];
        this.createRopes();

        // Enable full vision so we can watch the entire scene unfold:
        GFF.AdventureContent.setVision(true);

        // Set up the script by adding events:

        // Spawn the player
        this.addCutsceneEvent({
            eventId: `playerSpawn`,
            actor: `player`,
            command: `spawnAt(${PLAYER_SPAWN_PT.x},${PLAYER_SPAWN_PT.y})`,
            after: `start`,
            since: 0
        });

        // Spawn the prophet
        this.addCutsceneEvent({
            eventId: `prophetSpawn`,
            actor: `prophet`,
            command: `spawnAt(${PROPHET_SPAWN_PT.x},${PROPHET_SPAWN_PT.y})`,
            after: `start`,
            since: 0
        });

        // Make the player and prophet face each other:
        this.addCutsceneEvent({
            eventId: `playerFaceProphet`,
            actor: `player`,
            command: `faceDir(e)`,
            after: `playerSpawn`,
            since: 0
        });
        this.addCutsceneEvent({
            eventId: `prophetFacePlayer`,
            actor: `prophet`,
            command: `faceDir(w)`,
            after: `prophetSpawn`,
            since: 0
        });

        // Do an extra-slow fade-in from black to start the cutscene:
        this.addCutsceneEvent({
            eventId: 'fadeIn',
            eventCode: () => {
                // Update the ropes so they're in the correct starting position:
                this.updateRope(0);
                this.updateRope(1);
                // Set the characters to be above the ropes:
                this.holders[0].setUseAutoDepth(false);
                this.holders[0].setDepth(DEPTH.OH_DECOR + 1);
                this.holders[1].setUseAutoDepth(false);
                this.holders[1].setDepth(DEPTH.OH_DECOR + 1);
                // Set the updateRope functions in the registry so the goals can call them:
                this.registry.set('updateAdamRope', () => this.updateRope(0));
                this.registry.set('updateProphetRope', () => this.updateRope(1));
                // Ensure the player is visible (he may have been hidden if exiting the stronghold through the portal)
                this.holders[0].setVisible(true).setAlpha(1);
                // Now fade in:
                GFF.AdventureContent.fadeIn(2000, COLOR.BLACK.num());
            },
            after: 'start',
            since: 2000
        });

        // Before pulling the stronghold down, they have a short conversation
        this.addCutsceneEvent({
            eventId: 'converse',
            eventCode: () => {
                GConversation.fromFile('pull_down_stronghold', [
                    { label: 'other', char: this.holders[1] },
                ]);
            },
            after: `fadeIn`,
            since: 2000
        });
        // Conversation is done:
        this.addCutsceneEvent({
            eventId: 'converseDone',
            condition: () => GFF.AdventureContent.getConversation() === null,
            after: 'converse',
            since: 10
        });

        // Adam and prophet turn to face the stronghold:
        this.addCutsceneEvent({
            eventId: `playerTurnsNE`,
            actor: `player`,
            command: `faceDir(ne)`,
            after: `converseDone`,
            since: 1000
        });
        this.addCutsceneEvent({
            eventId: `prophetTurnsNW`,
            actor: `prophet`,
            command: `faceDir(nw)`,
            after: `converseDone`,
            since: 1000
        });

        // Start pulling the ropes in the opposite direction:
        this.addCutsceneEvent({
            eventId: `playerPulls`,
            actor: `player`,
            command: `pullRopeSW`,
            after: `prophetTurnsNW`,
            since: 500
        });
        this.addCutsceneEvent({
            eventId: `prophetPulls`,
            actor: `prophet`,
            command: `pullRopeSE`,
            after: `prophetTurnsNW`,
            since: 500
        });

        // Show the first part of the title once the pulling is underway:
        this.addCutsceneEvent({
            eventId: 'firstTitle',
            eventCode: () => {
                this.showTitle1();
            },
            after: `prophetTurnsNW`,
            since: 1000
        });

        // Let the destruction begin!
        this.addCutsceneEvent({
            eventId: 'divineDestruction',
            eventCode: () => {
                GFF.AdventureContent.getSound().playSound('divine_destroy');
                GFF.AdventureContent.fadeOut(200, COLOR.WHITE.num(), () => {
                    this.outsideRoom.destroyStronghold();
                    GFF.AdventureContent.time.delayedCall(500, () => {
                        GFF.AdventureContent.getSound().playSound('stronghold_collapse');
                        GFF.AdventureContent.fadeIn(200, COLOR.WHITE.num(), () => {
                            this.beginChunking();
                            this.beginSmoke();
                            this.beginDebrisExplosion();
                            this.fallBackward();
                            this.retractRope(0);
                            this.retractRope(1);
                            this.registry.set('destructionComplete', true);
                        });
                    });
                });
            },
            // Begin the destruction on the last pull
            after: 'prophetTurnsNW',
            since: 6800
        });

        // Once the scene fades back in, the destruction is complete
        this.addCutsceneEvent({
            eventId: 'completeDestruction',
            condition: () => this.registry.get('destructionComplete') !== undefined,
            after: `divineDestruction`,
            since: 0
        });

        // Show the title after the destruction is complete:
        this.addCutsceneEvent({
            eventId: 'secondTitle',
            eventCode: () => this.showTitle2(),
            after: 'completeDestruction',
            since: 1500
        });

        // Show the title after the destruction is complete:
        this.addCutsceneEvent({
            eventId: 'fanfare',
            eventCode: () => GFF.AdventureContent.getSound().playSound('victory_fanfare'),
            after: 'secondTitle',
            since: 500
        });

        // End the cutscene:
        this.addCutsceneEvent({
            eventId: 'endCutscene',
            eventCode: () => this.end(),
            after: 'fanfare',
            since: 7000
        });
    }

    protected finalize(): void {
        GFF.AdventureContent.reloadCurrentRoom(() => {
            PLAYER.getSprite().centerPhysically({x: 512, y: 500});
            PLAYER.getSprite().faceDirection(Dir9.S, true);
            PLAYER.getSprite().setUseAutoDepth(true);
            GFF.AdventureContent.startAreaBgMusic();
        });
    }
}