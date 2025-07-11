import { ARMORS } from "../armors";
import { BOOKS } from "../books";
import { COLOR } from "../colors";
import { DEPTH } from "../depths";
import { EFFECTS } from "../effects";
import { GChurch } from "../GChurch";
import { GConversation } from "../GConversation";
import { GFF } from "../main";
import { GCharSprite } from "../objects/chars/GCharSprite";
import { GBuildingExit } from "../objects/touchables/GBuildingExit";
import { PLAYER } from "../player";
import { RANDOM } from "../random";
import { REGISTRY } from "../registry";
import { GAdventureContent } from "../scenes/GAdventureContent";
import { STATS } from "../stats";
import { CLabeledChar, Dir9, GPoint2D } from "../types";
import { GCutscene } from "./GCutscene";

type PewSeat = {
    point: GPoint2D,
    state: 'empty'|'reserved'|'claimed'
}

const CENTER_X: number = 512;
const CENTER_Y: number = 352;
const THRESH_Y: number = 553;
const SPAWN_PT: GPoint2D = {x: CENTER_X, y: 800};
const THRESH_PT: GPoint2D = {x: CENTER_X, y: THRESH_Y};
const BEFORE_PULPIT_PT: GPoint2D = {x: CENTER_X, y: 290};
const AROUND_PULPIT_PT: GPoint2D = {x: BEFORE_PULPIT_PT.x - 70, y: 220};
const PAST_PULPIT_PT: GPoint2D = {x: AROUND_PULPIT_PT.x, y: 183};
const BEHIND_PULPIT_PT: GPoint2D = {x: CENTER_X, y: PAST_PULPIT_PT.y};
const BAPTISM_X: number = 490;
const BAPTISM_Y: number = 270;
const UNDERWATER_X: number = BAPTISM_X - 4;
const UNDERWATER_Y: number = BAPTISM_Y + 60;
const PREACHER_BEN_X: number = 475;
const PREACHER_BEN_Y: number = CENTER_Y;
const PLAYER_BEN_X: number = 545;
const PLAYER_BEN_Y: number = CENTER_Y;

export class GOpeningCutscene extends GCutscene {

    private church: GChurch;
    private preacher: GCharSprite;
    private pews: PewSeat[][] = [];

    private baptismBgImage: Phaser.GameObjects.Image;
    private baptismImage: Phaser.GameObjects.Image;
    private baptismEffectSprite: Phaser.Physics.Arcade.Sprite;
    private baptismUnderwaterImage: Phaser.GameObjects.Image;

    constructor(church: GChurch) {
        super('opening cutscene');
        this.church = church;
        this.createPewSeats();
    }

    private createPewSeats() {
        const rows: number[] = [297, 425, THRESH_Y];
        const distToFirst: number = 100;
        const distBetween: number = 62;

        // For each row, create left and right sides:
        rows.forEach(y => {
            // Left
            let x = CENTER_X - distToFirst;
            const leftPew: PewSeat[] = [];
            for (let seat: number = 0; seat < 5; seat++) {
                leftPew.push({point: {x, y}, state: 'empty'});
                x -= distBetween;
            }
            this.pews.push(leftPew);

            // Right
            x = CENTER_X + distToFirst;
            const rightPew: PewSeat[] = [];
            for (let seat: number = 0; seat < 5; seat++) {
                rightPew.push({point: {x, y}, state: 'empty'});
                x += distBetween;
            }
            this.pews.push(rightPew);
        });

        // Reserve the first seat in the back/right row for the player:
        this.pews[5][0].state = 'reserved';
    }

    // Claim and return a random seat that is not already reserved:
    private claimSeat(): PewSeat|null {
        const availableSeats: PewSeat[] = this.pews.flat().filter(seat => seat.state === 'empty');
        if (availableSeats.length === 0) return null;
        const chosenSeat: PewSeat = RANDOM.randElement(availableSeats);
        chosenSeat.state = 'claimed';
        return chosenSeat;
    }

    private getConversationChars(): CLabeledChar[] {
        const chars: CLabeledChar[] = [];
        // Add the preacher:
        const preacher: GCharSprite = this.getSpecificActor('preacher') as GCharSprite;
        chars.push({label: 'preacher', char: preacher});
        // Everyone else is generically added as an 'other':
        this.getGenericActors().forEach(actor => {
            chars.push({label: 'other', char: actor});
        });
        return chars;
    }

    private getExit(): GBuildingExit {
        return GFF.AdventureContent.children.list.find(gameObject =>
            gameObject instanceof GBuildingExit
        ) as GBuildingExit;
    }

    private doConversionMiracle() {
        PLAYER.calcMaxFaith(false);
        const faithWrapper: {value: number} = {value: 0};
        GFF.AdventureContent.tweens.add({
            targets: [faithWrapper],
            duration: 1000,
            value: PLAYER.getMaxFaith(),
            onUpdate: () => {
                PLAYER.setFaith(Math.floor(faithWrapper.value));
            }
        });
        GFF.AdventureContent.fadeOut(500, COLOR.WHITE.num(), () => {
            GFF.AdventureContent.fadeIn(500, COLOR.WHITE.num(), () => {
                GFF.AdventureContent.updateFidelityMode();
            });
        });
    }

    private loadBaptismScene() {
        const scene: GAdventureContent = GFF.AdventureContent;
        this.baptismBgImage = scene.add.image(0, 0, 'baptism_scene_bg')
            .setOrigin(0, 0)
            .setDepth(2000)
            .setVisible(true);
        this.baptismImage = scene.add.image(BAPTISM_X, BAPTISM_Y, 'baptism', 0).setOrigin(0, 0)
            .setDepth(2001)
            .setVisible(true);
        this.baptismUnderwaterImage = scene.add.image(UNDERWATER_X, UNDERWATER_Y, 'baptism_underwater')
            .setOrigin(0, 0)
            .setDepth(2002)
            .setVisible(true);

        // Position the preacher near the baptism scene.
        // Although his sprite is hidden behind the baptism background,
        // we'll move him here so his chat bubbles appear in the right place.
        // (We will reposition him after the baptism scene is over.)
        this.preacher.setPosition(BAPTISM_X - 30, BAPTISM_Y);
    }

    private finishBaptism() {
        this.baptismEffectSprite.setVisible(false);
        this.baptismImage.setTexture('baptism_end').setVisible(true);
    }

    private unloadBaptismScene() {
        this.baptismBgImage.destroy();
        this.baptismImage.destroy();
        this.baptismEffectSprite.destroy();
        this.baptismUnderwaterImage.destroy();
    }

    private loadBenedictionScene() {
        // We have to clear all the other people from the church,
        // so that Adam and the preacher are alone.
        // They'll be destroyed when the cutscene ends,
        // so we can just hide them for now.
        this.getGenericActors().forEach(actor => {
            actor.setVisible(false);
        });
    }

    protected initialize(): void {
        /**
         * This cutscene is the opening cutscene of the game.
         * It has a lot of similarities to the church service cutscene, since
         * it also takes place in a church. One of the main differences is that
         * all characters (except the player) are already spawned in the church,
         * so we don't need to do the same reserve/claim/walk process.
         *
         * However, we do need to reserve one particular seat for the player,
         * and then distribute the other church members randomly around the church.
         */

        // Adam begins the game without any faith:
        PLAYER.setFaith(0);

        // Immediately stop the default church background music:
        GFF.AdventureContent.getSound().stopMusic();

        // Start with a black screen, and update the fidelity mode:
        GFF.AdventureContent.shroud();
        GFF.AdventureContent.updateFidelityMode();

        // Disable bottom bound and exit so the player can enter from off the screen:
        GFF.AdventureContent.setBottomBoundEnabled(false);
        this.getExit().getBody().setEnable(false);

        // Add all church saints as actors:
        this.church.getPeople().forEach(saint => {
            this.createActorSprite(saint);
        });

        // Find the preacher and set him as the preacher:
        this.preacher = this.getAllActors().find(actor => actor.getPerson().spriteKeyPrefix === 'preacher') as GCharSprite;
        this.setActorLabel(this.preacher, 'preacher');

        // Set up the script by adding actor commands:

        // skipIntro 1 means skip the whole thing; we won't even be in this cutscene.
        const skipService: boolean = REGISTRY.getNumber('skipIntro') > 1;
        const skipBaptism: boolean = REGISTRY.getNumber('skipIntro') > 2;

        // Spawn the preacher behind the pulpit:
        this.addCutsceneEvent({
            eventId: 'preacherSpawn',
            actor: 'preacher',
            command: `spawnAt(${BEHIND_PULPIT_PT.x},${BEHIND_PULPIT_PT.y})`,
            after: 'start',
            since: 0
        });

        if (skipService) {

            // Service was skipped; spawn the player, so he's ready to act when the cutscene is over.
            // Also add a fake 'prayerDone' event, which will kick off the baptism scene:
            this.addCutsceneEvent({
                eventId: `playerSpawn`,
                actor: `player`,
                command: `spawnAt(${CENTER_X},${CENTER_Y})`,
                after: `preacherSpawn`,
                since: 1
            });
            this.addCutsceneEvent({
                eventId: 'prayerDone',
                eventCode: () => {
                    GFF.AdventureContent.shroud();
                    PLAYER.beBornAgain();
                    GFF.AdventureContent.updateFidelityMode();
                    GFF.AdventureContent.getSound().fadeInMusic(1000, 'amazing');
                },
                after: 'playerSpawn',
                since: 1
            });

        } else {

            // Spread the church members randomly around the church:
            const genericActors: number = this.getGenericActors().length;
            for (let a = 1; a <= genericActors; a++) {
                const seat: PewSeat = this.claimSeat() as PewSeat;
                this.addCutsceneEvent({
                    eventId: `actor${a}Spawn`,
                    actor: `actor_${a}`,
                    command: `spawnAt(${seat.point.x},${seat.point.y})`,
                    after: 'start',
                    since: 0
                });
                this.addCutsceneEvent({
                    eventId: `actor${a}FacePulpit`,
                    actor: `actor_${a}`,
                    command: `faceDir(n)`,
                    after: `actor${a}Spawn`,
                    since: 0
                });
            }

            // The preacher faces the congregation:
            this.addCutsceneEvent({
                eventId: 'preacherFaceCongregation',
                actor: 'preacher',
                command: 'faceDir(s)',
                after: 'preacherSpawn',
                since: 0
            });

            // Fade in from black to start the cutscene:
            this.addCutsceneEvent({
                eventId: 'fadeIn',
                eventCode: () => {
                    GFF.AdventureContent.fadeIn(2000, COLOR.BLACK.num());
                    GFF.AdventureContent.getSound().fadeInMusic(2000, 'words')
                },
                after: 'preacherFaceCongregation',
                since: 1000
            });

            // Adam walks into the church and takes the first seat to the right, in the back row:
            const seat: PewSeat = this.pews[5][0];
            this.addCutsceneEvent({
                eventId: `playerSpawn`,
                actor: `player`,
                command: `spawnAt(${SPAWN_PT.x},${SPAWN_PT.y})`,
                after: `fadeIn`,
                since: 2000
            });
            this.addCutsceneEvent({
                eventId: `playerWalkToRow`,
                actor: `player`,
                command: `walkTo(${CENTER_X},${seat.point.y})`,
                after: `playerSpawn`,
                since: 0
            });
            this.addCutsceneEvent({
                eventId: `playerWalkToSeat`,
                actor: `player`,
                command: `walkTo(${seat.point.x},${seat.point.y})`,
                after: `playerWalkToRow`,
                since: 0
            });
            this.addCutsceneEvent({
                eventId: `playerFacePulpit1`,
                actor: `player`,
                command: `faceDir(n)`,
                after: `playerWalkToSeat`,
                since: 0
            });

            // The preacher begins the service dialogue, which is mostly a sermon:
            this.addCutsceneEvent({
                eventId: 'preachSermon',
                eventCode: () => {
                    GConversation.fromFile('opening_1_conv', this.getConversationChars());
                },
                after: `playerFacePulpit1`,
                since: 1000
            });

            // Sermon is over when conversation is clear:
            this.addCutsceneEvent({
                eventId: 'sermonDone',
                condition: () => GFF.AdventureContent.getConversation() === null,
                after: 'preachSermon',
                since: 500
            });

            // Adam walks to the center aisle:
            this.addCutsceneEvent({
                eventId: `playerWalkToAisle`,
                actor: `player`,
                command: `walkTo(${CENTER_X},${seat.point.y})`,
                after: `sermonDone`,
                since: 10
            });

            // Adam faces the preacher again:
            this.addCutsceneEvent({
                eventId: `playerFacePulpit2`,
                actor: `player`,
                command: `faceDir(n)`,
                after: `playerWalkToAisle`,
                since: 100
            });

            // Adam confesses that Jesus is both Lord and Christ!
            this.addCutsceneEvent({
                eventId: 'confession',
                eventCode: () => {
                    GConversation.fromFile('opening_2_conv', this.getConversationChars());
                },
                after: `playerFacePulpit2`,
                since: 500
            });

            // Confession is over when conversation is clear:
            this.addCutsceneEvent({
                eventId: 'confessionDone',
                condition: () => GFF.AdventureContent.getConversation() === null,
                after: 'confession',
                since: 10
            });

            // First, the player kneels down in a humble position:
            this.addCutsceneEvent({
                eventId: 'kneel',
                actor: 'player',
                command: 'kneel',
                after: 'confessionDone',
                since: 500
            });

            // We'll do a little conversion miracle:
            this.addCutsceneEvent({
                eventId: 'conversionMiracle',
                eventCode: () => {
                    this.doConversionMiracle();
                },
                after: 'kneel',
                since: 500
            });

            // We'll fade to black to simulate Adam closing his eyes:
            this.addCutsceneEvent({
                eventId: 'closeEyes',
                eventCode: () => {
                    GFF.AdventureContent.fadeOut(1000, COLOR.BLACK.num());
                },
                after: 'conversionMiracle',
                since: 2500
            });
            // Begin the prayer as a conversation:
            this.addCutsceneEvent({
                eventId: 'sayPrayer',
                eventCode: () => {
                    GConversation.fromFile('opening_3_conv', this.getConversationChars(), 'playerpray');
                },
                after: 'closeEyes',
                since: 1500
            });
            // Prayer is over when conversation is clear:
            this.addCutsceneEvent({
                eventId: 'prayerDone',
                condition: () => GFF.AdventureContent.getConversation() === null,
                after: 'sayPrayer',
                since: 10
            });
        }

        if (skipBaptism) {

            // Baptism was skipped; we'll add a fake 'unloadBaptismScene' event, which will kick off the benediction scene.
            // We only skip baptism if the service was also skipped; so we can pick it up from the last fake event.
            this.addCutsceneEvent({
                eventId: 'unloadBaptismScene',
                eventCode: () => {
                    GFF.AdventureContent.shroud();
                },
                after: 'prayerDone',
                since: 1
            });

        } else {
            /**
             * Baptism scene:
             */

            // Fade into the baptism scene:
            this.addCutsceneEvent({
                eventId: 'loadBaptismScene',
                eventCode: () => {
                    this.loadBaptismScene();
                    GFF.AdventureContent.fadeIn(2000, COLOR.BLACK.num());
                },
                after: 'prayerDone',
                since: 2000
            });

            // The preacher gives a short speech:
            this.addCutsceneEvent({
                eventId: 'baptismSpeech1',
                eventCode: () => {
                    GConversation.fromFile('opening_4_conv', this.getConversationChars());
                },
                after: `loadBaptismScene`,
                since: 2000
            });

            // Speech 1 is over when conversation is clear:
            this.addCutsceneEvent({
                eventId: 'baptismSpeech1Done',
                condition: () => GFF.AdventureContent.getConversation() === null,
                after: 'baptismSpeech1',
                since: 10
            });

            // After the first speech, the preacher baptizes Adam:
            this.addCutsceneEvent({
                eventId: 'startBaptism',
                eventCode: () => {
                    this.baptismImage.setVisible(false);
                    this.baptismEffectSprite = EFFECTS.doEffect('baptism', GFF.AdventureContent, BAPTISM_X, BAPTISM_Y, 0, 0).setDepth(2001);
                },
                after: 'baptismSpeech1Done',
                since: 1000
            });

            // Finish the baptism effect:
            this.addCutsceneEvent({
                eventId: 'endBaptism',
                eventCode: () => {
                    this.finishBaptism();
                },
                after: 'startBaptism',
                since: 2500
            });

            // The preacher gives another short speech:
            this.addCutsceneEvent({
                eventId: 'baptismSpeech2',
                eventCode: () => {
                    GConversation.fromFile('opening_5_conv', this.getConversationChars());
                },
                after: `endBaptism`,
                since: 1000
            });

            // Speech 2 is over when conversation is clear:
            this.addCutsceneEvent({
                eventId: 'baptismSpeech2Done',
                condition: () => GFF.AdventureContent.getConversation() === null,
                after: 'baptismSpeech2',
                since: 10
            });

            /**
             * Baptism scene is over; we'll fade out and unload it.
             */
            this.addCutsceneEvent({
                eventId: 'unloadBaptismScene',
                eventCode: () => {
                    GFF.AdventureContent.fadeOut(2000, COLOR.BLACK.num(), () => {
                        this.unloadBaptismScene();
                    });
                },
                after: `baptismSpeech2Done`,
                since: 1000
            });
        }

        /**
         * Benediction scene
         * This is the final part of the opening cutscene, where the preacher
         * gives Adam some godly advice, directly relevant to the game,
         * and gifts him some items: the Sword of the Spirit and a book to start with.
         */

        // Spawn the preacher in the center aisle:
        this.addCutsceneEvent({
            eventId: 'preacherSpawn2',
            actor: 'preacher',
            command: `spawnAt(${PREACHER_BEN_X},${PREACHER_BEN_Y})`,
            after: 'unloadBaptismScene',
            since: 2500
        });

        // Spawn the player in the center aisle:
        this.addCutsceneEvent({
            eventId: 'playerSpawn2',
            actor: 'player',
            command: `spawnAt(${PLAYER_BEN_X},${PLAYER_BEN_Y})`,
            after: 'preacherSpawn2',
            since: 1
        });

        // Make the preacher face east, toward the player:
        this.addCutsceneEvent({
            eventId: 'preacherFacePlayer',
            actor: 'preacher',
            command: `faceDir(e)`,
            after: 'playerSpawn2',
            since: 1
        });

        // Make the player face west, toward the preacher:
        this.addCutsceneEvent({
            eventId: 'playerFacePreacher',
            actor: 'player',
            command: `faceDir(w)`,
            after: 'preacherFacePlayer',
            since: 1
        });

        // Fade back into the church for the benediction scene:
        this.addCutsceneEvent({
            eventId: 'startBenediction',
            eventCode: () => {
                this.loadBenedictionScene();
                GFF.AdventureContent.fadeIn(2000, COLOR.BLACK.num());
            },
            after: 'playerFacePreacher',
            since: 1000
        });

        // The preacher begins the benediction speech:
        this.addCutsceneEvent({
            eventId: 'benedictionSpeech1',
            eventCode: () => {
                GConversation.fromFile('opening_6_conv', this.getConversationChars());
            },
            after: `startBenediction`,
            since: 2000
        });

        // Benediction 1 is over when conversation is clear:
        this.addCutsceneEvent({
            eventId: 'benedictionSpeech1Done',
            condition: () => GFF.AdventureContent.getConversation() === null,
            after: 'benedictionSpeech1',
            since: 10
        });

        // The preacher gives Adam the Sword of the Spirit:
        this.addCutsceneEvent({
            eventId: 'giftSword',
            eventCode: () => {
                GFF.AdventureContent.obtainItemWithoutChest({
                    name: 'armor_1',
                    type: 'item',
                    onCollect: () => {
                        ARMORS.obtainArmor(1);
                    }
                });
            },
            after: `benedictionSpeech1Done`,
            since: 10
        });

        // Gift is over when popup is clear:
        this.addCutsceneEvent({
            eventId: 'giftSwordDone',
            condition: () => GFF.AdventureContent.getPopup() === null,
            after: 'giftSword',
            since: 10
        });

        // The preacher continues the benediction speech, giving Adam a starting book.
        // The book depends on the books order selection: Random (John) or Canonical (Genesis).
        this.addCutsceneEvent({
            eventId: 'benedictionSpeech2',
            eventCode: () => {
                GConversation.fromFile('opening_7_conv', this.getConversationChars());
            },
            after: `giftSwordDone`,
            since: 10
        });

        // Benediction 2 is over when conversation is clear:
        this.addCutsceneEvent({
            eventId: 'benedictionSpeech2Done',
            condition: () => GFF.AdventureContent.getConversation() === null,
            after: 'benedictionSpeech2',
            since: 10
        });

        // The preacher gives Adam the starting book:
        this.addCutsceneEvent({
            eventId: 'giftBook',
            eventCode: () => {
                GFF.AdventureContent.obtainItemWithoutChest({
                    name: BOOKS.getFirstBook(),
                    type: 'book',
                    onCollect: () => {
                        BOOKS.obtainFirstBook();
                    }
                });
            },
            after: `benedictionSpeech2Done`,
            since: 10
        });

        // Gift is over when popup is clear:
        this.addCutsceneEvent({
            eventId: 'giftBookDone',
            condition: () => GFF.AdventureContent.getPopup() === null,
            after: 'giftBook',
            since: 10
        });

        // The preacher finishes the benediction speech, giving Adam instructions for his adventure:
        this.addCutsceneEvent({
            eventId: 'benedictionSpeech3',
            eventCode: () => {
                GConversation.fromFile('opening_8_conv', this.getConversationChars());
            },
            after: `giftBookDone`,
            since: 10
        });

        // Benediction 3 is over when conversation is clear:
        this.addCutsceneEvent({
            eventId: 'benedictionSpeech3Done',
            condition: () => GFF.AdventureContent.getConversation() === null,
            after: 'benedictionSpeech3',
            since: 10
        });

        // End the service:
        this.addCutsceneEvent({
            eventId: 'end',
            eventCode: () => this.end(),
            after: 'benedictionSpeech3Done',
            since: 2000
        });
    }

    protected finalize(): void {
        STATS.changeInt('ServicesAttended', 1);
        GFF.AdventureContent.reloadCurrentRoom(() => {
            // Re-enable the exit and bottom bound:
            this.getExit().getBody().setEnable(true);
            GFF.AdventureContent.setBottomBoundEnabled(true);
            // Position the player at the center of the church:
            PLAYER.getSprite().centerPhysically({x: CENTER_X, y: CENTER_Y});
            PLAYER.getSprite().faceDirection(Dir9.S, true);
        });
    }
}