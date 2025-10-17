import { COLOR } from "../colors";
import { DEPTH } from "../depths";
import { DIRECTION } from "../direction";
import { GConversation } from "../GConversation";
import { GRoom } from "../GRoom";
import { GTown } from "../GTown";
import { GFF } from "../main";
import { GPersonSprite } from "../objects/chars/GPersonSprite";
import { PHYSICS } from "../physics";
import { PLAYER } from "../player";
import { RANDOM } from "../random";
import { GAdventureContent } from "../scenes/GAdventureContent";
import { STATS } from "../stats";
import { Dir9, GPoint2D } from "../types";
import { GCutscene } from "./GCutscene";

const SCREEN_SIDE: number = 1024;
const JET_DEPTH: number = 0;
const CLOUDS_ABOVE_DEPTH: number = JET_DEPTH + 1;
const CLOUDS_BELOW_DEPTH: number = JET_DEPTH - 1;
const CLOUDS_ABOVE_SPEED: number = 1.5;
const CLOUDS_BELOW_SPEED: number = 0.5;

/**
 * In some ways, this is the most unique cutscene in the game,
 * since it doesn't involve any actors and it doesn't take place
 * in a room. It's just a fancy animation of an airplane flying
 * in the direction of the destination town, with clouds going by.
 */

export class GQuickTravelCutscene extends GCutscene {

    private destination: GTown;
    private background: Phaser.GameObjects.Rectangle;
    private jet: Phaser.GameObjects.Image;
    private cloudsAbove: Phaser.GameObjects.Image[] = [];
    private cloudsBelow: Phaser.GameObjects.Image[] = [];
    private baseVelocity: GPoint2D;
    private moveVelocity: GPoint2D;

    private travelDirection: Dir9;

    constructor(destination: GTown) {
        super('quick-travel cutscene', true);
        this.destination = destination;
    }

    private initGraphics() {
        const scene: GAdventureContent = GFF.AdventureContent;
        this.background = scene.add.rectangle(0, 0, GFF.GAME_W, GFF.GAME_H, COLOR.SKY_BLUE.num(), 1)
            .setOrigin(0, 0)
            .setDepth(DEPTH.BACKGROUND)
            .setVisible(false);
        this.jet = scene.add.image(GFF.GAME_W / 2, GFF.GAME_H / 2, 'jet')
            .setOrigin(0.5, 0.5)
            .setVisible(false);

        // Determine the travel direction based on the destination town's position relative to the current room:
        const originRoom: GRoom = GFF.AdventureContent.getCurrentRoom() as GRoom;
        const destinationRoom: GRoom = this.destination.getTravelAgencyLocation();
        this.travelDirection = DIRECTION.getDirectionOf(
            {x: originRoom.getX(), y: originRoom.getY()},
            {x: destinationRoom.getX(), y: destinationRoom.getY()}
        );

        // Set the jet's angle based on the travel direction:
        this.jet.setAngle(this.getAngleForDirection(this.travelDirection));

        // Set velocity based on the travel direction:
        this.baseVelocity = DIRECTION.getVelocity(this.travelDirection);
        const distFactor: number = DIRECTION.getDistanceFactor(this.travelDirection);
        this.moveVelocity = {
            x: this.baseVelocity.x * distFactor,
            y: this.baseVelocity.y * distFactor
        };

        // Move the jet away from the direction of travel, so it starts off-screen:
        this.jet.setPosition(
            this.jet.x - (this.moveVelocity.x * SCREEN_SIDE),
            this.jet.y - (this.moveVelocity.y * SCREEN_SIDE)
        );

        // Create some clouds, which will move in the opposite direction of the jet:
        this.createClouds();
    }

    private createClouds() {
        const min: number = -SCREEN_SIDE;
        const max: number = SCREEN_SIDE * 2;
        for (let i = 0; i < 50; i++) {
            const isAbove: boolean = RANDOM.flipCoin();
            const cloudType: number = RANDOM.randInt(1, 3);
            const cloud: Phaser.GameObjects.Image = GFF.AdventureContent.add.image(
                RANDOM.randInt(min, max),
                RANDOM.randInt(min, max),
                `cloud_${cloudType}`
            )
                .setOrigin(0.5, 0.5)
                .setAlpha(RANDOM.randFloat(.3, .8))
                .setAngle(RANDOM.randFloat(0, 360))
                .setScale(RANDOM.randFloat(1, 3));
            if (isAbove) {
                cloud.setDepth(CLOUDS_ABOVE_DEPTH);
                this.cloudsAbove.push(cloud);
            } else {
                cloud.setDepth(CLOUDS_BELOW_DEPTH);
                this.cloudsBelow.push(cloud);
            }
        }
    }

    private startFlightSimulation() {
        // Show all the graphics:
        this.background.setVisible(true);
        this.jet.setVisible(true);

        // Create a tween to move the jet:
        const destX: number = this.jet.x + (this.moveVelocity.x * SCREEN_SIDE * 2);
        const destY: number = this.jet.y + (this.moveVelocity.y * SCREEN_SIDE * 2);
        GFF.AdventureContent.tweens.add({
            targets: this.jet,
            x: destX,
            y: destY,
            duration: 4000
        });

        // Create tweens to move the clouds above by CLOUDS_ABOVE_SPEED:
        this.cloudsAbove.forEach(cloud => {
            const destX: number = cloud.x - (this.moveVelocity.x * CLOUDS_ABOVE_SPEED * SCREEN_SIDE * 2);
            const destY: number = cloud.y - (this.moveVelocity.y * CLOUDS_ABOVE_SPEED * SCREEN_SIDE * 2);
            GFF.AdventureContent.tweens.add({
                targets: cloud,
                x: destX,
                y: destY,
                duration: 5000
            });
        });
        // Create tweens to move the clouds below by CLOUDS_BELOW_SPEED:
        this.cloudsBelow.forEach(cloud => {
            const destX: number = cloud.x - (this.moveVelocity.x * CLOUDS_BELOW_SPEED * SCREEN_SIDE * 2);
            const destY: number = cloud.y - (this.moveVelocity.y * CLOUDS_BELOW_SPEED * SCREEN_SIDE * 2);
            GFF.AdventureContent.tweens.add({
                targets: cloud,
                x: destX,
                y: destY,
                duration: 5000
            });
        });
    }

    private getAngleForDirection(direction: Dir9): number {
        return (direction - 1) * 45;
    }

    protected initialize(): void {
        // Fade to black:
        this.addCutsceneEvent({
            eventId: 'fadeOut1',
            eventCode: () => {
                GFF.AdventureContent.fadeOut(1000, COLOR.BLACK.num());
                GFF.AdventureContent.getSound().fadeOutMusic(1000);
            },
            after: 'start',
            since: 500
        });

        // Play sound for seatbelt tone:
        this.addCutsceneEvent({
            eventId: 'seatbeltTone1',
            eventCode: () => {
                GFF.AdventureContent.getSound().playSound('seatbelt_tone');
                // The screen will be black by this time; set full visibility for when it fades in:
                GFF.AdventureContent.setVision(true);
            },
            after: 'fadeOut1',
            since: 1500
        });

        // Unload everything belonging to the current room:
        this.addCutsceneEvent({
            eventId: 'unloadRoom',
            eventCode: () => {
                (GFF.AdventureContent.getCurrentRoom() as GRoom).unload();
                PLAYER.getSprite().setVisible(false);
            },
            after: 'seatbeltTone1',
            since: 500
        });

        // Play sound for airplane taking off:
        this.addCutsceneEvent({
            eventId: 'takeOff',
            eventCode: () => {
                GFF.AdventureContent.getSound().playSound('airplane_takeoff');
            },
            after: 'unloadRoom',
            since: 2000
        });

        // Begin playing the flight sound:
        this.addCutsceneEvent({
            eventId: 'startFlight',
            eventCode: () => {
                GFF.AdventureContent.getSound().playSound('airplane_travel');
            },
            after: 'takeOff',
            since: 1000
        });

        // Show the cutscene graphics: background, airplane, and clouds
        this.addCutsceneEvent({
            eventId: 'flightSim',
            eventCode: () => {
                this.initGraphics();
                this.startFlightSimulation();
            },
            after: 'startFlight',
            since: 1500
        });

        // Fade into the cutscene from black:
        this.addCutsceneEvent({
            eventId: 'fadeIn1',
            eventCode: () => {
                GFF.AdventureContent.fadeIn(1000, COLOR.BLACK.num());
            },
            after: 'flightSim',
            since: 100
        });

        // Play the landing sound:
        this.addCutsceneEvent({
            eventId: 'landing',
            eventCode: () => {
                GFF.AdventureContent.getSound().playSound('airplane_landing');
            },
            after: 'fadeIn1',
            since: 3800
        });

        // After the jet flies off the screen, fade to black again:
        this.addCutsceneEvent({
            eventId: 'fadeOut2',
            eventCode: () => {
                GFF.AdventureContent.fadeOut(1000, COLOR.BLACK.num());
            },
            after: 'fadeIn1',
            since: 3800
        });

        // Play sound for seatbelt tone:
        this.addCutsceneEvent({
            eventId: 'seatbeltTone2',
            eventCode: () => {
                GFF.AdventureContent.getSound().playSound('seatbelt_tone');
            },
            after: 'fadeOut2',
            since: 3200
        });

        // Transition to the destination room:
        this.addCutsceneEvent({
            eventId: 'transitionToDestination',
            eventCode: () => {
                // Fade in the background music again:
                GFF.AdventureContent.getSound().fadeInMusic(1000);

                // Transition to the destination room:
                GFF.AdventureContent.transitionRoomDuringCutscene(this.destination.getTravelAgencyLocation());

                // Get the travel agent in the destination room:
                const travelAgent: GPersonSprite = GFF.AdventureContent.getTravelAgent() as GPersonSprite;

                // Place the player in front of the travel agent, facing him:
                PLAYER.getSprite().setPosition(travelAgent.x, travelAgent.y + GFF.CHAR_BODY_H);
                PLAYER.getSprite().faceDirection(Dir9.N, true)
                PLAYER.getSprite().setVisible(true);
            },
            after: 'seatbeltTone2',
            since: 2700
        });

        // Fade into the destination room:
        this.addCutsceneEvent({
            eventId: 'fadeIn2',
            eventCode: () => {
                GFF.AdventureContent.setVisionWithCheck();
                GFF.AdventureContent.fadeIn(1000, COLOR.BLACK.num());
            },
            after: 'transitionToDestination',
            since: 100
        });

        // The travel agent welcomes the player to the destination town:
        this.addCutsceneEvent({
            eventId: 'agentWelcome',
            eventCode: () => {
                // Kick off a conversation with the travel agent:
                const travelAgent: GPersonSprite = GFF.AdventureContent.getTravelAgent() as GPersonSprite;
                GConversation.fromFile('arrival_agent_conv', [{
                    label: 'other',
                    char: travelAgent
                }]);
            },
            after: 'fadeIn2',
            since: 1200
        });

        // Detect when the conversation ends, so we can finish the cutscene:
        this.addCutsceneEvent({
            eventId: 'welcomeDone',
            condition: () => GFF.AdventureContent.getConversation() === null,
            after: 'agentWelcome',
            since: 10
        });

        // End the cutscene:
        this.addCutsceneEvent({
            eventId: 'end',
            eventCode: () => this.end(),
            after: 'welcomeDone',
            since: 10
        });
    }

    protected finalize(): void {
        STATS.changeInt('FlightsTaken', 1);
        GFF.AdventureContent.startChars();
    }
}