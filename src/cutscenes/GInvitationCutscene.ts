import { AREA } from "../area";
import { GFakeArea } from "../areas/GFakeArea";
import { COLOR } from "../colors";
import { DEPTH } from "../depths";
import { DIRECTION } from "../direction";
import { EFFECTS } from "../effects";
import { GConversation } from "../GConversation";
import { GRoom } from "../GRoom";
import { LOGIC } from "../logic";
import { GFF } from "../main";
import { PLAYER } from "../player";
import { GRegion } from "../regions/GRegion";
import { REGISTRY } from "../registry";
import { CardDir, Dir9, GPoint2D } from "../types";
import { GCutscene } from "./GCutscene";

/**
 * The scroll will fall slightly off-center so that the player can
 * walk to the exact center (from any direction) and use a kneel-se
 * pose to pick it up.
 */
const CENTER_PT: GPoint2D = {x: 512, y: 352};
const SCROLL_PT: GPoint2D = {x: CENTER_PT.x + 8, y: CENTER_PT.y + 8};
const FALL_OFFSET: number = 400;
const LEFT_ROLL_START_X: number = 495;
const LEFT_ROLL_END_X: number = 191;
const RIGHT_ROLL_START_X: number = 529;
const RIGHT_ROLL_END_X: number = 834;
const BIG_SCROLL_Y: number = CENTER_PT.y - 35;
const TEXT_COLOR: string = '#663420';

export class GInvitationCutscene extends GCutscene {

    private invitationRoom: GRoom;
    private nextRoom: GRoom;
    private entryDir: Dir9;
    private playerLastRealPosition: GPoint2D;
    private closedScrollImage: Phaser.GameObjects.Image;
    private scrollShadowImage: Phaser.GameObjects.Image;
    private scrollOpenImage: Phaser.GameObjects.Image;
    private leftRollImage: Phaser.GameObjects.Image;
    private rightRollImage: Phaser.GameObjects.Image;
    private messageText: Phaser.GameObjects.Text;
    private recipientText: Phaser.GameObjects.Text;
    private senderText: Phaser.GameObjects.Text;

    constructor(nextRoom: GRoom, entryDir: Dir9) {
        super('invitation to cave cutscene', true);
        this.playerLastRealPosition = {x: PLAYER.getSprite().x, y: PLAYER.getSprite().y};
        this.entryDir = entryDir;
        this.nextRoom = nextRoom;
        this.invitationRoom = this.createInvitationRoom(nextRoom.getRegion(), entryDir);
    }

    private createInvitationRoom(region: GRegion, entryDir: Dir9): GRoom {
        // The "invitation room" is a fake room that doesn't actually exist in the world.
        // We have to create it on the fly in order to match the current region.
        // In order to properly load it, it needs to be part of an Area, so we'll create a fake area for it.
        const fakeArea = new GFakeArea();
        fakeArea.generate();
        const room = fakeArea.getRoomAt(0, 0, 0) as GRoom;
        room.planInvitationRoom(region, entryDir);
        region.furnishRoom(room);
        return room;
    }

    private initGraphics() {
        this.closedScrollImage = GFF.AdventureContent.add.image(SCROLL_PT.x, SCROLL_PT.y - FALL_OFFSET, 'scroll_closed')
            .setOrigin(0.5, 0.5)
            .setDepth(DEPTH.SPECIAL_EFFECT)
            .setScale(12.5)
            .setVisible(false);
        this.scrollShadowImage = GFF.AdventureContent.add.image(SCROLL_PT.x, SCROLL_PT.y, 'scroll_shadow')
            .setOrigin(0.5, 0.5)
            .setDepth(DEPTH.SPECIAL_EFFECT - 1)
            .setScale(.1)
            .setVisible(false);
        this.scrollOpenImage = GFF.AdventureContent.add.image(CENTER_PT.x, BIG_SCROLL_Y, 'scroll_open')
            .setOrigin(.5, .5)
            .setVisible(false)
            .setDepth(DEPTH.TOPMOST);
        this.leftRollImage = GFF.AdventureContent.add.image(LEFT_ROLL_START_X, BIG_SCROLL_Y, 'roll_left')
            .setOrigin(.5, .5)
            .setVisible(false)
            .setDepth(DEPTH.TOPMOST);
        this.rightRollImage = GFF.AdventureContent.add.image(RIGHT_ROLL_START_X, BIG_SCROLL_Y, 'roll_right')
            .setOrigin(.5, .5)
            .setVisible(false)
            .setDepth(DEPTH.TOPMOST);

        this.messageText = GFF.AdventureContent.add.text(CENTER_PT.x, BIG_SCROLL_Y, '', {
            fontFamily: 'style_script',
            fontSize: '20px',
            color: TEXT_COLOR,
            align: 'left',
            wordWrap: {width: 560}
        }).setOrigin(0.5, 0.5).setDepth(DEPTH.TOPMOST).setVisible(false);
        this.recipientText = GFF.AdventureContent.add.text(LEFT_ROLL_END_X + 64, BIG_SCROLL_Y - 56, 'Adam,', {
            fontFamily: 'style_script',
            fontSize: '20px',
            color: TEXT_COLOR,
            align: 'left',
            wordWrap: {width: 560}
        }).setOrigin(0.0, 0.0).setDepth(DEPTH.TOPMOST).setVisible(false);
        this.senderText = GFF.AdventureContent.add.text(RIGHT_ROLL_END_X - 50, BIG_SCROLL_Y + 29, '- an Angel of Light', {
            fontFamily: 'style_script',
            fontSize: '20px',
            color: TEXT_COLOR,
            align: 'right',
            wordWrap: {width: 560}
        }).setOrigin(1.0, 0.0).setDepth(DEPTH.TOPMOST).setVisible(false);

        this.initMessageText();
    }

    private initMessageText() {
        const directionText = AREA.describeDistanceBetweenRooms(this.nextRoom, AREA.WORLD_AREA.getCaveRoom());
        this.messageText.setText(
            `I have heard of you and your faith. I think it would be good for the two of us to become acquainted. Meet me at the cave ${directionText} of here. Come alone.`
        );
    }

    private dropScroll() {
        GFF.AdventureContent.getSound().playSound('invitation');
        this.closedScrollImage.setVisible(true);
        this.scrollShadowImage.setVisible(true).setAlpha(0.01).setScale(0.01);

        GFF.AdventureContent.tweens.add({
            targets: this.closedScrollImage,
            scale: 0.16,
            duration: 5010,
            ease: 'Expo.easeOut',
            onUpdate: (tween, target) => {
                const progress = tween.progress;

                // Start 200px above the center, and fall to the center as it rotates:
                const yOffset = -FALL_OFFSET + (progress * FALL_OFFSET);
                target.y = SCROLL_PT.y + yOffset;

                // 0.5x speed at start → 1.0x at end
                const speedMultiplier = 0.5 + (progress * 0.5);

                // base degrees per second (tweak this)
                const baseRotation = 253;
                const dt = GFF.AdventureContent.game.loop.delta / 1000;
                target.angle += baseRotation * speedMultiplier * dt;
            },
            onComplete: () => {
                // use a nicer graphic for the final position instead of the scaled/rotated one
                this.closedScrollImage.setTexture('scroll_fallen');
                // snap to 0°, unscaled (for the new graphic)
                this.closedScrollImage.setScale(1.0);
                this.closedScrollImage.setAngle(0);

                // Set the depth by it's bottom edge so it will appear properly in relation to the player;
                // since it's rotated, use the width as the height for this calculation:
                this.closedScrollImage.setDepth(this.closedScrollImage.y + this.closedScrollImage.displayWidth / 2);

                // Play thud effect when the scroll hits the ground; there will be a little cloud of dust as it lands.
                EFFECTS.doEffect('scroll_thud', GFF.AdventureContent, this.closedScrollImage.x, this.closedScrollImage.y, 0.5, 0.5)
                    .setDepth(DEPTH.SPECIAL_EFFECT - 1);

                // small bounce up
                GFF.AdventureContent.tweens.add({
                    targets: this.closedScrollImage,
                    y: this.closedScrollImage.y - 4,
                    duration: 40,
                    ease: 'Quad.easeOut',
                    yoyo: true,
                    onComplete: () => {
                        this.registry.set('scrollDropped', true);
                    }
                });
            }
        });

        GFF.AdventureContent.tweens.add({
            targets: this.scrollShadowImage,
            alpha: 1.0,
            duration: 5010,
            ease: 'Expo.easeOut',
            onUpdate: (tween, target) => {
                target.setScale(target.alpha);
                target.angle = this.closedScrollImage.angle;
            },
            onComplete: () => {
                this.scrollShadowImage.setVisible(false);
            }
        });
    }

    // The player will start here, at the edge of the room
    private initPlayerStart(): GPoint2D {
        let playerStart: GPoint2D = {x: 0, y: 0};
        switch (this.entryDir) {
            case Dir9.N:
                playerStart = {x: 512, y: 704 + 100};
                break;
            case Dir9.E:
                playerStart = {x: 0 - 100, y: 352};
                break;
            case Dir9.S:
                playerStart = {x: 512, y: 0 - 100};
                break;
            case Dir9.W:
                playerStart = {x: 1024 + 100, y: 352};
                break;
        }
        return playerStart;
    }

    // The player will walk to this point, two-thirds to the center, before the scroll drops
    private initMidPoint(playerStart: GPoint2D): GPoint2D {
        return {
            x: playerStart.x + (CENTER_PT.x - playerStart.x) * 2 / 3,
            y: playerStart.y + (CENTER_PT.y - playerStart.y) * 2 / 3
        };
    }

    // The player will walk to this point at the end of the cutscene
    private initEndPoint(playerStart: GPoint2D): GPoint2D {
        return {
            x: playerStart.x + LOGIC.triValue(playerStart.x, CENTER_PT.x, 1224, 0, -1224),
            y: playerStart.y + LOGIC.triValue(playerStart.y, CENTER_PT.y, 904, 0, -904)
        };
    }

    private unfurlScroll() {
        const crop: Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle(this.scrollOpenImage.width / 2, 0, 0, this.scrollOpenImage.height);
        this.scrollOpenImage.setVisible(true).setAlpha(0).setCrop(crop);
        this.leftRollImage.setVisible(true).setAlpha(0);
        this.rightRollImage.setVisible(true).setAlpha(0);

        GFF.AdventureContent.tweens.add({
            targets: [this.scrollOpenImage, this.leftRollImage, this.rightRollImage],
            alpha: 1.0,
            duration: 500,
            ease: 'Linear',
            onComplete: () => {
                GFF.AdventureContent.time.delayedCall(100, () => {
                    GFF.AdventureContent.getSound().playSound('scroll');
                    GFF.AdventureContent.tweens.add({
                        targets: this.leftRollImage,
                        duration: 500,
                        x: LEFT_ROLL_END_X
                    });
                    GFF.AdventureContent.tweens.add({
                        targets: this.rightRollImage,
                        duration: 500,
                        x: RIGHT_ROLL_END_X
                    });
                    GFF.AdventureContent.tweens.add({
                        targets: crop,
                        duration: 500,
                        x: 0,
                        width: this.scrollOpenImage.width,
                        onUpdate: () => {
                            this.scrollOpenImage.setCrop(crop);
                        },
                        onComplete: () => {
                            this.leftRollImage.setVisible(false);
                            this.rightRollImage.setVisible(false);
                            this.showMessageText();
                            this.registry.set('messageShown', true);
                        }
                    });
                });
            }
        });
    }

    private showMessageText() {
        this.messageText.setVisible(true).setAlpha(0);
        this.recipientText.setVisible(true).setAlpha(0);
        this.senderText.setVisible(true).setAlpha(0);
        GFF.AdventureContent.tweens.add({
            targets: [this.messageText, this.recipientText, this.senderText],
            alpha: 1.0,
            duration: 200,
        });
    }

    private hideScrollAndMessage() {
        PLAYER.getSprite().faceDirection(Dir9.S, true);
        GFF.AdventureContent.tweens.add({
            targets: [this.scrollOpenImage, this.messageText, this.recipientText, this.senderText],
            alpha: 0.0,
            duration: 1000,
            onComplete: () => {
                this.messageText.setVisible(false);
                this.recipientText.setVisible(false);
                this.senderText.setVisible(false);
                this.scrollOpenImage.setVisible(false);
                this.registry.set('messageHidden', true);
            }
        });
    }

    private resetPlayerPosition() {
        const newEdge: Dir9 = DIRECTION.getOpposite(this.entryDir) as Dir9;
        const newPlayerX: number =
            (newEdge === Dir9.W || newEdge === Dir9.E)
            ? DIRECTION.getCharPosForEdge(newEdge)
            : PLAYER.getSprite().x;
        const newPlayerY: number =
            (newEdge === Dir9.N || newEdge === Dir9.S)
            ? DIRECTION.getCharPosForEdge(newEdge)
            : PLAYER.getSprite().y;
        PLAYER.getSprite().setPosition(newPlayerX, newPlayerY);
        PLAYER.getSprite().faceDirection(this.entryDir, true);

        const playerCtr: GPoint2D = PLAYER.getSprite().getPhysicalCenter();
        const wallCtr: GPoint2D = this.nextRoom.getNearestWallCenter(DIRECTION.getOpposite(this.entryDir) as CardDir, playerCtr);
        PLAYER.getSprite().centerPhysically(wallCtr);
        console.log('Player position reset to:', PLAYER.getSprite().x, PLAYER.getSprite().y);
    }

    protected initialize(): void {
        // Determine where the player is and where he's going:
        const playerStart = this.initPlayerStart();
        const midPoint = this.initMidPoint(playerStart);
        const endPoint = this.initEndPoint(playerStart);

        // Immediately stop the background music:
        GFF.AdventureContent.getSound().fadeOutMusic(1000);

        // Transition to the invitation room, which is a fake room we create on the fly for this cutscene:
        GFF.AdventureContent.transitionRoomDuringCutscene(this.invitationRoom, false, true, false);

        // Disable the screen bounds so the player can walk in from off-screen:
        GFF.AdventureContent.setScreenBoundsEnabled(false);

        // After loading the room, initialize the cutscene graphics:
        this.initGraphics();

        // Enable full vision so we can watch the entire scene unfold:
        GFF.AdventureContent.setVision(true);

        /**
         * This cutscene is rather dynamic, because it depends on which region
         * the player is in, and which direction he's going.
         *
         * The "room" doesn't actually exist in the world. For example, if he's
         * moving EAST from 5,7 to 6,7, then we'll have him entering the cutscene
         * "room" from the west, see the invitation scroll fall from the sky to
         * land in the center of the room, and then have him walk to the scroll
         * and pick it up. After reading it, he'll continue walking east to the
         * next (real) room, which is 6,7. (6,7... haha... sorry.)
         */

        // Set up the script by adding events:

        // Spawn the player
        this.addCutsceneEvent({
            eventId: `playerSpawn`,
            actor: `player`,
            command: `spawnAt(${playerStart.x},${playerStart.y})`,
            after: `start`,
            since: 0
        });

        // Do an extra-slow fade-in from black to start the cutscene:
        this.addCutsceneEvent({
            eventId: 'fadeIn',
            eventCode: () => {
                // Now fade in:
                GFF.AdventureContent.fadeIn(2000, COLOR.BLACK.num());
            },
            after: 'start',
            since: 2000
        });

        // Adam walks halfway to the center...
        this.addCutsceneEvent({
            eventId: `playerWalkToMidPoint`,
            actor: `player`,
            command: `walkTo(${midPoint.x},${midPoint.y})`,
            after: `fadeIn`,
            since: 500
        });

        // Drop the scroll from the sky:
        this.addCutsceneEvent({
            eventId: 'dropScroll',
            eventCode: () => {
                this.dropScroll();
            },
            after: 'fadeIn',
            since: 1500
        });

        // Once the scroll falls to the ground, make the drop complete:
        this.addCutsceneEvent({
            eventId: 'completeDrop',
            condition: () => this.registry.get('scrollDropped') !== undefined,
            after: 'dropScroll',
            since: 0
        });

        // Adam ponders the scroll for a moment...
        this.addCutsceneEvent({
            eventId: 'ponderScroll',
            eventCode: () => {
                GConversation.fromFile('ponder_scroll_conv', undefined, 'observation');
            },
            after: 'completeDrop',
            since: 2000
        });

        // Wait for the conversation to finish before proceeding:
        this.addCutsceneEvent({
            eventId: 'endPonder',
            condition: () => GFF.AdventureContent.getConversation() === null,
            after: 'ponderScroll',
            since: 10
        });

        // Adam walks over to the scroll:
        this.addCutsceneEvent({
            eventId: `playerWalkToScroll`,
            actor: `player`,
            command: `walkTo(${CENTER_PT.x},${CENTER_PT.y})`,
            after: `endPonder`,
            since: 1000
        });

        // The scroll lies slightly to the southeast, so Adam will face it...
        this.addCutsceneEvent({
            eventId: `playerFaceScroll`,
            actor: `player`,
            command: `faceDir(se)`,
            after: `playerWalkToScroll`,
            since: 50
        });

        // Then bend down to pick it up...
        this.addCutsceneEvent({
            eventId: `playerBendDownToPickUp`,
            actor: `player`,
            command: `bendDownToPickUp`,
            after: `playerFaceScroll`,
            since: 100
        });

        // Remove the scroll from the ground, since it was picked up:
        this.addCutsceneEvent({
            eventId: 'removeScroll',
            eventCode: () => {
                this.closedScrollImage.setVisible(false);
            },
            after: 'playerBendDownToPickUp',
            since: 500
        });

        // Then stand up again and open the scroll:
        this.addCutsceneEvent({
            eventId: `playerOpenScroll`,
            actor: `player`,
            command: `openScroll`,
            after: `removeScroll`,
            since: 100
        });

        // After a short delay, show the large scroll and unfurl it so the player can read the message.
        // The scroll will block our view of Adam, so we can take the opportunity to hide the small scroll
        // he's holding, without needing an animation of him putting it away.
        this.addCutsceneEvent({
            eventId: 'unfurlScroll',
            eventCode: () => {
                this.unfurlScroll();
            },
            after: 'playerOpenScroll',
            since: 1200
        });

        // Once the scroll falls to the ground, make the drop complete:
        this.addCutsceneEvent({
            eventId: 'messageShown',
            condition: () => this.registry.get('messageShown') !== undefined,
            after: 'unfurlScroll',
            since: 0
        });

        // We'll use a fake conversation so that we don't have to do anything weird to make the Enter prompt show up.
        this.addCutsceneEvent({
            eventId: 'promptFinishReading',
            eventCode: () => {
                GConversation.promptOnly();
            },
            after: 'messageShown',
            since: 1
        });

        // Wait for the conversation to finish before proceeding:
        this.addCutsceneEvent({
            eventId: 'endPrompt',
            condition: () => GFF.AdventureContent.getConversation() === null,
            after: 'promptFinishReading',
            since: 10
        });

        // Fade out the large scroll:
        this.addCutsceneEvent({
            eventId: 'hideScrollAndMessage',
            eventCode: () => {
                this.hideScrollAndMessage();
            },
            after: 'endPrompt',
            since: 200
        });

        // Adam remarks innocently about the message, not openly acknowledging that it's a message from the Devil:
        this.addCutsceneEvent({
            eventId: 'remark',
            eventCode: () => {
                GConversation.fromFile('remark_about_invite', undefined);
            },
            after: 'hideScrollAndMessage',
            since: 2000
        });

        // Wait for the conversation to finish before proceeding:
        this.addCutsceneEvent({
            eventId: 'endRemark',
            condition: () => GFF.AdventureContent.getConversation() === null,
            after: 'remark',
            since: 10
        });

        // Continue on to the next room (the one the player was trying to enter when the cutscene triggered):
        this.addCutsceneEvent({
            eventId: `playerWalkToEndPoint`,
            actor: `player`,
            command: `walkTo(${endPoint.x},${endPoint.y})`,
            after: `endRemark`,
            since: 500
        });

        // Fade to black:
        this.addCutsceneEvent({
            eventId: 'fadeOut',
            eventCode: () => {
                GFF.AdventureContent.fadeOut(1000, COLOR.BLACK.num(), () => {
                    GFF.AdventureContent.transitionRoomDuringCutscene(this.nextRoom, true, false, false);
                    this.resetPlayerPosition();
                });
            },
            after: 'playerWalkToEndPoint',
            since: 1
        });

        // Fade into the next room:
        this.addCutsceneEvent({
            eventId: 'fadeIntoNextRoom',
            eventCode: () => {
                GFF.AdventureContent.setVisionWithCheck();
                GFF.AdventureContent.fadeIn(1000, COLOR.BLACK.num());
            },
            after: 'fadeOut',
            since: 1200
        });

        // End the cutscene:
        this.addCutsceneEvent({
            eventId: 'endCutscene',
            eventCode: () => this.end(),
            after: 'fadeIntoNextRoom',
            since: 1200
        });
    }

    protected finalize(): void {
        REGISTRY.set('invitedToCave', true);
        PLAYER.getSprite().setUseAutoDepth(true);
        // Re-enable the screen bounds:
        GFF.AdventureContent.setScreenBoundsEnabled(true);
        GFF.AdventureContent.startChars();
    }
}