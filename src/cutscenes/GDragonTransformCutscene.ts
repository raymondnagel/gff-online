import { ENEMY } from "../enemy";
import { GConversation } from "../GConversation";
import { GFF } from "../main";
import { GSatanSprite } from "../objects/chars/GSatanSprite";
import { PLAYER } from "../player";
import { REGISTRY } from "../registry";
import { CLabeledChar } from "../types";
import { GCutscene } from "./GCutscene";


/**
 * This cutscene plays after the player enters the tomb and defeats Lucifer.
 * We have just faded back in from the battle, and everything is still set up
 * in the room from the previous cutscene, so we'll just pick up from there.
 */
export class GDragonTransformCutscene extends GCutscene {
    constructor() {
        super('dragon transform cutscene', true);
    }

    private transformLucifer(luciferSprite: GSatanSprite): void {
        const advScene = GFF.AdventureContent;
        const animKey = 'dragon_transform';
        const bottomCenterX = luciferSprite.x - luciferSprite.displayOriginX + luciferSprite.displayWidth / 2;
        const bottomY = luciferSprite.y - luciferSprite.displayOriginY + luciferSprite.displayHeight;

        advScene.sound.play('lucifer_morph');

        if (!advScene.anims.exists(animKey)) {
            advScene.anims.create({
                key: animKey,
                frames: advScene.anims.generateFrameNumbers(animKey),
                frameRate: 8
            });
        }

        const morphSprite = advScene.add.sprite(bottomCenterX, bottomY, animKey, 0)
            .setOrigin(0.5, 1)
            .setDepth(luciferSprite.depth + 2)
            .setAlpha(0);

        advScene.tweens.add({
            targets: morphSprite,
            alpha: 1,
            duration: 1000,
            ease: 'Linear',
            onComplete: () => {
                luciferSprite.setVisible(false);
                morphSprite.play(animKey);
            },
        });

        morphSprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            const dragonImage = advScene.add.image(bottomCenterX, bottomY, 'dragon_char')
                .setOrigin(0.5, 1)
                .setDepth(luciferSprite.depth + 1);

            this.registry.set('dragonTransformDragonImage', dragonImage);

            advScene.tweens.add({
                targets: morphSprite,
                alpha: 0,
                duration: 1000,
                ease: 'Linear',
                onComplete: () => {
                    advScene.sound.play('dragon_horror');
                    morphSprite.destroy();
                    this.registry.set('dragonTransformDone', true);
                }
            });
        });
    }

    protected initialize(): void {
        const advScene = GFF.AdventureContent;
        const player = PLAYER.getSprite();
        const skipDragonDialogue = REGISTRY.getBoolean('lostToDragon');
        const transformDelay = skipDragonDialogue ? 0 : 1500;

        // Find and register the Lucifer sprite created in the previous cutscene:
        const luciferSprite = advScene.getPersons(true).find(person =>
            person instanceof GSatanSprite
        ) as GSatanSprite;
        this.useActorSprite(luciferSprite, 'lucifer');

        const conversationChars: CLabeledChar[] = [
            { label: 'lucifer', char: luciferSprite }
        ];

        // Resume animations so they don't look weirdly frozen during the monologue:
        player.play('adam_soldier_idle_n', false);
        luciferSprite.play('lucifer_idle_s', false);

        if (skipDragonDialogue) {
            this.addCutsceneEvent({
                eventId: 'luciferMonologueDone',
                eventCode: () => {},
                after: `start`,
                since: 0
            });
        } else {
            // Begin a short monologue after a couple seconds:
            this.addCutsceneEvent({
                eventId: `luciferMonologue`,
                eventCode: () => {
                    GConversation.fromFile('lucifer_defeat_conv', conversationChars);
                },
                after: `start`,
                since: 2000
            });

            // Wait for the monologue to end:
            this.addCutsceneEvent({
                eventId: 'luciferMonologueDone',
                condition: () => GFF.AdventureContent.getConversation() === null,
                after: 'luciferMonologue',
                since: 100
            });
        }

        // After the monologue, Lucifer will transform into the Dragon:
        this.addCutsceneEvent({
            eventId: 'transformLucifer',
            eventCode: () => {
                this.transformLucifer(luciferSprite);
            },
            after: 'luciferMonologueDone',
            since: transformDelay
        });

        // Wait for the transformation to end:
        this.addCutsceneEvent({
            eventId: 'dragonTransformDone',
            condition: () => this.registry.has('dragonTransformDone'),
            after: 'transformLucifer',
            since: 100
        });

        // End the cutscene:
        this.addCutsceneEvent({
            eventId: 'endCutscene',
            eventCode: () => {
                this.end();
            },
            after: 'dragonTransformDone',
            since: 5000
        });
    }

    protected finalize(): void {
        // When this cutscene ends, the final battle will begin.
        GFF.AdventureContent.encounterBoss(ENEMY.BOSS_SPIRITS[6]); // Dragon is the 7th boss spirit in the list
    }
}
