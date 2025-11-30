import { COLOR } from "../colors";
import { GChurch } from "../GChurch";
import { GConversation } from "../GConversation";
import { GFF } from "../main";
import { GPersonSprite } from "../objects/chars/GPersonSprite";
import { PLAYER } from "../player";
import { CLabeledChar, Dir9, GColor, GPerson } from "../types";
import { GCutscene } from "./GCutscene";



export class GRestorationCutscene extends GCutscene {
    private intercessor: GPersonSprite;

    constructor(intercessor: GPersonSprite) {
        super('restoration cutscene', true);
        this.intercessor = intercessor;
    }

    private getConversationChars(): CLabeledChar[] {
        const chars: CLabeledChar[] = [];
        // Player will be automatically added as 'player'

        // Everyone else is generically added as a 'saint':
        this.getGenericActors().forEach(actor => {
            chars.push({label: 'saint', char: actor});
        });
        return chars;
    }

    protected initialize(): void {
        const saints: GPersonSprite[] = GFF.AdventureContent.getPersons();

        // Add original speaker as "intercessor", and all other saints as generic actors:
        saints.forEach(saint => {
            if (saint === this.intercessor) {
                this.useActorSprite(saint, 'intercessor');
            } else {
                this.useActorSprite(saint);
            }
        });

        // Get labeled characters for conversations:
        const chars: CLabeledChar[] = this.getConversationChars()

        // Set up the script by adding actor commands:

        // First, the intro: intercessor talks to player, and calls for the saints to gather:
        this.addCutsceneEvent({
            eventId: 'intercessorIntro',
            eventCode: () => {
                GConversation.fromFile('restoration_conv', [{
                    label: 'intercessor',
                    char: this.intercessor
                }]);
            },
            after: 'start',
            since: 0
        });
        this.addCutsceneEvent({
            eventId: 'introDone',
            condition: () => GFF.AdventureContent.getConversation() === null,
            after: 'intercessorIntro',
            since: 500
        });

        // The saints rally to the player:
        const rallyX: number = PLAYER.getSprite().getPhysicalCenter().x;
        const rallyY: number = PLAYER.getSprite().getPhysicalCenter().y;
        // console.log(`Rallying to ${rallyX}, ${rallyY}`);
        const genericActors: number = this.getGenericActors().length;
        for (let a = 1; a <= genericActors; a++) {
            this.addCutsceneEvent({
                eventId: `actor_${a}Rally`,
                actor: `actor_${a}`,
                command: `tryWalkTo(${rallyX},${rallyY})`,
                postCode: () => {
                    let readyCount: number = this.registry.get('readyCount') ?? 0;
                    this.registry.set('readyCount', ++readyCount);
                },
                after: 'introDone',
                since: 0
            });
        }

        // Begin prayer when all the saints are ready:
        this.addCutsceneEvent({
            eventId: 'beginPrayer',
            condition: () => this.registry.get('readyCount') as number === genericActors,
            after: `introDone`,
            since: 500
        });
        this.addCutsceneEvent({
            eventId: 'playerKneel',
            actor: 'player',
            command: 'kneel()',
            after: 'beginPrayer',
            since: 100
        });
        this.addCutsceneEvent({
            eventId: 'restorationPrayer',
            eventCode: () => {
                GConversation.fromFile('restoration_prayer', chars);
            },
            after: 'playerKneel',
            since: 100
        });
        this.addCutsceneEvent({
            eventId: 'prayerDone',
            condition: () => GFF.AdventureContent.getConversation() === null,
            after: 'restorationPrayer',
            since: 100
        });

        // After prayer, there is a restoration miracle!
        // Then the player stands up, and the saints encourage him:
        this.addCutsceneEvent({
            eventId: 'restorationMiracle',
            eventCode: () => {
                GFF.AdventureContent.fadeOut(500, COLOR.WHITE.num(), () => {
                    PLAYER.setFaith(1);
                    const faithWrapper: {value: number} = {value: PLAYER.getFaith()};
                    const newFaith: number = PLAYER.getMaxFaith() / 2;
                    GFF.AdventureContent.setVisualsByFaith();
                    GFF.AdventureContent.tweens.add({
                        targets: [faithWrapper],
                        duration: 1000,
                        value: newFaith,
                        onUpdate: () => {
                            PLAYER.setFaith(Math.floor(faithWrapper.value));
                        }
                    });
                    GFF.AdventureContent.startAreaBgMusic();
                    GFF.AdventureContent.fadeIn(500, COLOR.WHITE.num());
                });
            },
            after: 'prayerDone',
            since: 500
        });
        this.addCutsceneEvent({
            eventId: 'playerStand',
            actor: 'player',
            command: 'stand()',
            after: 'restorationMiracle',
            since: 2000
        });
        this.addCutsceneEvent({
            eventId: 'saintsEncourage',
            eventCode: () => {
                GConversation.fromFile('encourage_conv', chars);
            },
            after: 'playerStand',
            since: 700
        });
        this.addCutsceneEvent({
            eventId: 'encourageDone',
            condition: () => GFF.AdventureContent.getConversation() === null,
            after: 'saintsEncourage',
            since: 500
        });

        // End the cutscene:
        this.addCutsceneEvent({
            eventId: 'endRestoration',
            eventCode: () => this.end(),
            after: 'encourageDone',
            since: 500
        });
    }

    protected finalize(): void {
        PLAYER.getSprite().faceDirection(Dir9.S);
        GFF.AdventureContent.startChars();
    }
}