import { AREA } from "../area";
import { COLOR } from "../colors";
import { DEPTH } from "../depths";
import { ENEMY } from "../enemy";
import { GConversation } from "../GConversation";
import { GRoom } from "../GRoom";
import { GFF } from "../main";
import { GSatanSprite } from "../objects/chars/GSatanSprite";
import { PLAYER } from "../player";
import { REGISTRY } from "../registry";
import { CLabeledChar, Dir9, GSceneryPlan } from "../types";
import { GCutscene } from "./GCutscene";
import { GDragonTransformCutscene } from "./GDragonTransformCutscene";



export class GEnterTombCutscene extends GCutscene {

    private rollingStone: Phaser.GameObjects.Image;
    private rollingStoneLight: Phaser.GameObjects.Image;

    constructor() {
        super('enter tomb cutscene', true);
    }

    // I can almost imagine Bob Dylan singing as this happens...
    private rollStoneOverEntrance() {
        const advScene = GFF.AdventureContent;
        const cavePlan = advScene.getCurrentRoom()!.getPlanByKey('cave_entrance') as GSceneryPlan;

        const caveHeight = 260;
        const caveCenterX = 260;
        const stoneDiameter = 154;
        const stoneRadius = stoneDiameter / 2;

        const stoneY = cavePlan.y + caveHeight - stoneRadius;
        const startX = 1024 + stoneRadius;
        const finalX = cavePlan.x + caveCenterX;

        const overshootLeftX = finalX - 18;
        const overshootRightX = finalX + 7;

        this.rollingStone = advScene.add.image(startX, stoneY, 'unlit_rolling_stone')
            .setOrigin(0.5, 0.5);
        this.rollingStone.setDepth(this.rollingStone.y + stoneRadius);

        this.rollingStoneLight = advScene.add.image(startX, stoneY, 'rolling_stone_lighting')
            .setOrigin(0.5, 0.5);
        this.rollingStoneLight.setDepth(this.rollingStone.depth + 1);

        const updateStoneRotation = () => {
            const distance = this.rollingStone.x - startX;
            this.rollingStone.rotation = distance / stoneRadius;
        };

        advScene.tweens.chain({
            targets: [this.rollingStone, this.rollingStoneLight],
            tweens: [
                {
                    x: overshootLeftX,
                    duration: 3000,
                    ease: 'Linear',
                    onUpdate: updateStoneRotation,
                    onComplete: () => {
                        advScene.getSound().playSound('stone_thud');
                    }
                },
                {
                    x: overshootRightX,
                    duration: 260,
                    ease: 'Sine.easeOut',
                    onUpdate: updateStoneRotation
                },
                {
                    x: finalX,
                    duration: 180,
                    ease: 'Sine.easeIn',
                    onUpdate: updateStoneRotation
                }
            ],
            onComplete: () => {
                this.rollingStone.x = finalX;
                this.rollingStoneLight.x = finalX;
                updateStoneRotation();
                this.registry.set('stoneRolled', true);
            }
        });

        advScene.getSound().playSound('stone_rumble');
    }

    private placeStoneAtEntrance() {
        const advScene = GFF.AdventureContent;
        this.rollingStone = advScene.add.image(512, 704, 'unlit_rolling_stone')
            .setOrigin(0.5, 0.5)
            .setDepth(DEPTH.OH_DECOR)
            .setVisible(true);
    }

    protected initialize(): void {
        const advScene = GFF.AdventureContent;
        const caveRoom = AREA.CAVE_AREA.getRoomAt(0, 0, 0) as GRoom;
        const player = PLAYER.getSprite();
        const skipLuciferIntro = REGISTRY.getBoolean('lostToLucifer') || REGISTRY.getBoolean('lostToDragon');
        const endCutsceneDelay = skipLuciferIntro ? 0 : 1500;
        player.disableBody(); // Disable player body so it doesn't interact with anything

        const luciferSprite = this.createActorSprite(GSatanSprite.getSatanPerson(), 'lucifer');
        luciferSprite.setData('permanent', true); // So we can create the sprite now, but have it stick around after room transition
        const conversationChars: CLabeledChar[] = [
            { label: 'lucifer', char: luciferSprite }
        ];


        // Set up the script by adding actor commands:

        /**
         * Adam has just collided with the threshold to enter the tomb; do an animation to make him enter.
         * Instead of using a normal walk action, we'll play the walk animation and move him manually.
         * We also want to have him become smaller and fade out as he enters, to create a sense of depth as he disappears into the tomb.
         * Finally, we'll fade out the music as he enters.
         */
        this.addCutsceneEvent({
            eventId: 'adamEnter',
            eventCode: () => {
                const newX = player.getTopCenter().x;
                const newY = player.getTopCenter().y;
                advScene.getSound().fadeOutMusic(1500);
                player.play('adam_walk_n');
                player.setOrigin(0.5, 0); // Change origin top-center, which will pull him up slightly as he scales
                player.setPosition(newX, newY);
                advScene.tweens.add({
                targets: player,
                scaleX: 0.5,
                scaleY: 0.5,
                alpha: {
                    value: 0,
                    delay: 500
                },
                duration: 1500,
                ease: 'Linear',
                onComplete: () => {
                    this.registry.set('adamEnteredTomb', true);
                }
            });
            },
            after: 'start',
            since: 10
        });

        // Wait for Adam to fully enter and be out of view:
        this.addCutsceneEvent({
            eventId: 'fullyEntered',
            condition: () => this.registry.has('adamEnteredTomb'),
            after: 'adamEnter',
            since: 100
        });

        // After Adam enters, wait a couple seconds, then have the stone roll in and block the entrance:
        this.addCutsceneEvent({
            eventId: 'rollStone',
            eventCode: () => this.rollStoneOverEntrance(),
            after: 'fullyEntered',
            since: 2000
        });

        // Wait for the stone to roll into place
        this.addCutsceneEvent({
            eventId: 'stoneRolled',
            condition: () => this.registry.has('stoneRolled'),
            after: 'rollStone',
            since: 100
        });

        // Fade to black:
        this.addCutsceneEvent({
            eventId: 'fadeOut',
            eventCode: () => {
                GFF.AdventureContent.fadeOut(2000, COLOR.BLACK.num(), () => {
                    this.registry.set('fadedOut', true);
                });
            },
            after: 'stoneRolled',
            since: 2000
        });

        // Wait for the fade out to complete
        this.addCutsceneEvent({
            eventId: 'fadedOut',
            condition: () => this.registry.has('fadedOut'),
            after: 'fadeOut',
            since: 100
        });

        // Transition to the cave room:
        this.addCutsceneEvent({
            eventId: 'transitionToCave',
            eventCode: () => {
                advScene.transitionRoomDuringCutscene(caveRoom, false, false, true);

                // Place the player just above the south wall; we can't have him come through the entrance because the stone is blocking it
                player.centerPhysically({x: 512, y: 600});
                player.useSoldierAnims();
                player.faceDirection(Dir9.N, true);
                player.setAlpha(1);
                player.setScale(1);
                player.setOrigin(0, 0);
                player.enableBody();

                luciferSprite.faceDirection(Dir9.S, true);

                this.placeStoneAtEntrance();
            },
            after: 'fadedOut',
            since: 100
        });

        // Spawn Lucifer:
        this.addCutsceneEvent({
            eventId: 'luciferSpawn',
            actor: 'lucifer',
            command: `spawnAt(512,220)`,
            after: 'transitionToCave',
            since: 100
        });

        // Fade into the cave room:
        this.addCutsceneEvent({
            eventId: 'fadeIn',
            eventCode: () => {
                GFF.AdventureContent.fadeIn(2000, COLOR.BLACK.num());
            },
            after: 'luciferSpawn',
            since: 100
        });

        // Adam steps forward, but keeps his distance:
        this.addCutsceneEvent({
            eventId: `playerStepsForward`,
            actor: `player`,
            command: `walkTo(512,440)`,
            after: `fadeIn`,
            since: 3000
        });

        if (skipLuciferIntro) {
            this.addCutsceneEvent({
                eventId: 'luciferIntroDone',
                eventCode: () => {},
                after: `playerStepsForward`,
                since: 1000
            });
        } else {
            // Lucifer begins the conversation:
            this.addCutsceneEvent({
                eventId: 'luciferIntro',
                eventCode: () => {
                    GConversation.fromFile('lucifer_intro_conv', conversationChars);
                },
                after: `playerStepsForward`,
                since: 2500
            });

            // Wait for the conversation to end:
            this.addCutsceneEvent({
                eventId: 'luciferIntroDone',
                condition: () => GFF.AdventureContent.getConversation() === null,
                after: 'luciferIntro',
                since: 100
            });
        }

        // 1) If the player entered and defected to Satan:
        // there was a hard GAME OVER with no chance to save; that situation is impossible to start from here.
        // 2) If the player entered and lost to Lucifer:
        // Lucifer will be present, but the dialog will be different: no choices, but will allow the player to try again.
        // 3) If the player entered and lost to the Dragon:
        // The Dragon will be present, but the dialog will be different: no choices, but will allow the player to try again.
        // 4) If the player entered and won:
        // The end-game sequence has already been triggered with no chance to save; that situation is impossible to start from here.

        // So there are essentially three branches:
        // 1) Player meets Lucifer for the first time and the main cutscene plays out.
        // 2) Player meets Lucifer again after losing to him, and gets a chance to try again.
        // 3) Player meets the Dragon again after losing to it, and gets a chance to try again.

        // The branching logic will be handled by checking the registry for flag,
        // similar to how the opening cutscene allowed skipping certain parts.

        // End the cutscene:
        this.addCutsceneEvent({
            eventId: 'endCutscene',
            eventCode: () => {
                // Before ending, make Lucifer non-permanent so that he will be removed in the next room transition:
                luciferSprite.setData('permanent', false);
                this.end();
            },
            after: 'luciferIntroDone',
            since: endCutsceneDelay
        });
    }

    protected finalize(): void {
        // When this cutscene ends, a battle will begin,
        // except in the case where the player surrenders to Satan, which results in a bad end / hard Game Over.
        if (REGISTRY.getBoolean('lostToDragon')) {
            new GDragonTransformCutscene().play();
        } else {
            GFF.AdventureContent.encounterBoss(ENEMY.BOSS_SPIRITS[5]); // Lucifer is the 6th boss spirit in the list
        }
    }
}
