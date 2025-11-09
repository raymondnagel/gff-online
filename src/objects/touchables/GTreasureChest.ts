import { BOOKS } from "../../books";
import { COMMANDMENTS } from "../../commandments";
import { GLOSSARY } from "../../glossary";
import { RANDOM } from "../../random";
import { GRoom } from "../../GRoom";
import { GFF } from "../../main";
import { PLAYER } from "../../player";
import { SCENERY } from "../../scenery";
import { GBookEntry, GGlossaryEntry, GItem, GSceneryDef, GSceneryPlan, SIX, TEN } from "../../types";
import { GPopup } from "../components/GPopup";
import { GTouchable } from "./GTouchable";
import { STATS } from "../../stats";
import { REGISTRY } from "../../registry";
import { ARMORS } from "../../armors";
import { DEPTH } from "../../depths";
import { EFFECTS } from "../../effects";
import { GStrongholdArea } from "../../areas/GStrongholdArea";
import { GBossTrigger } from "../../triggers/GBossTrigger";

export class GTreasureChest extends GTouchable {

    private premium: boolean;
    private color: 'brown'|'blue'|'red'|'purple'|'gold'|'black';
    private wicked: boolean;

    constructor(x: number, y: number, chestKey: 'brown_chest'|'blue_chest'|'red_chest'|'purple_chest'|'gold_chest'|'black_chest', wicked: boolean = false) {
        super(SCENERY.def(chestKey), x, y);
        this.setOrigin(0, 0);
        this.premium = chestKey !== 'brown_chest' && chestKey !== 'black_chest';
        this.color = chestKey.split('_')[0] as 'brown'|'blue'|'red'|'purple'|'gold'|'black';
        this.wicked = wicked;
    }

    public isWicked(): boolean {
        return this.wicked;
    }

    public canTouch(): boolean {
        return PLAYER.getFaith() > 0;
    }

    public doTouch() {
        const item: GItem = this.premium ? this.getPremiumItem() : this.getCommonItem();

        // Unmark the chest if it is premium and marked::
        if (this.premium && PLAYER.getMarkedChestRoom() === GFF.AdventureContent.getCurrentRoom()) {
            PLAYER.setMarkedChestRoom(null);
        }
        STATS.changeInt('ChestsOpened', 1);
        GFF.AdventureContent.scene.pause();
        GFF.AdventureUI.getSound().playSound('open_chest').once('complete', () => {
            if (this.premium) {
                GFF.AdventureContent.getCurrentRoom()?.removePremiumChest();
            }
            switch (item.type) {
                case 'book':
                    GPopup.createBookPopup(item.name).onClose(() => {
                        this.poofChest();
                    });
                    break;
                case 'item':
                    GPopup.createItemPopup(item.name).onClose(() => {
                        if (item.name.startsWith('cmd')) {
                            GFF.AdventureContent.setVisionWithCheck();
                        }
                        this.poofChest();
                    });
                    break;
            }
            item.onCollect();
            if (this.wicked) {
                this.color = 'black';
            }
            this.setTexture(`${this.color}_chest_open`);
        });
    }

    public addBossTrigger() {
        // This is called when the chest is added to the scene,
        // which means the room is already loaded. We can add the trigger now.
        const bossSpirit = (GFF.AdventureContent.getCurrentRoom()!.getArea() as GStrongholdArea).getBossSpirit();
        const trigger = new GBossTrigger(
            bossSpirit,
            this.body!.x + (this.body!.width / 2),
            this.body!.y + (this.body!.height / 2)
        );
        GFF.AdventureContent.getCurrentRoom()!.addTemporaryEventTrigger(trigger);
    }

    private poofChest() {
        const center = this.getCenter();
        const effectSprite: Phaser.Physics.Arcade.Sprite = EFFECTS.doEffect('chest_puff', GFF.AdventureContent, center.x, center.y, .5, .5);
        effectSprite.setDepth(DEPTH.SPECIAL_EFFECT);
        this.destroy();

        // When the gold chest is opened, spawn a teleporter so the player can exit easily:
        if (this.color === 'gold') {
            GFF.AdventureContent.createTeleporter();
            GFF.AdventureUI.getSound().playSound('ahh');
        }
    }

    private getCommonItem(): GItem {
        if (this.wicked) {
            return { name: 'wicked_treasure', type: 'item', onCollect: () => {
                PLAYER.changeFaith(-(PLAYER.getFaith() * 0.5));
                PLAYER.changeGrace(-(PLAYER.getGrace() * 0.5));
            } };
        }

        // Items in the original list can be obtained by the player at any level.
        const itemList = [
            {
                element: { name: 'seed', type: 'item', onCollect: () => {PLAYER.changeSeeds(1)} },
                weight: 20
            },
            {
                element: { name: 'milk', type: 'item', onCollect: () => {PLAYER.changeFaith(50)} },
                weight: 20
            },
            {
                element: { name: 'exp_bonus', type: 'item', onCollect: () => {PLAYER.addXp(PLAYER.getXpBonus())} },
                weight: 10
            },
            {
                element: { name: 'sermon', type: 'item', onCollect: () => {PLAYER.changeSermons(1)} },
                weight: 5
            },
            {
                element: { name: 'standard', type: 'item', onCollect: () => {PLAYER.changeStandards(1)} },
                weight: 5
            }
        ];

        // Meat and Strong Meat are only available once the player reaches certain levels:
        if (PLAYER.getLevel() >= 10) {
            itemList.push({
                element: { name: 'meat', type: 'item', onCollect: () => {PLAYER.changeFaith(200)} },
                weight: 10
            });
        }
        if (PLAYER.getLevel() >= 20) {
            itemList.push({
                element: { name: 'strong_meat', type: 'item', onCollect: () => {PLAYER.changeFaith(500)} },
                weight: 5
            });
        }

        const item: GItem = RANDOM.randElementWeighted(itemList) as GItem;

        return item;
    }

    private getPremiumItem(): GItem {
        const room: GRoom = GFF.AdventureContent.getCurrentRoom() as GRoom;
        const itemName: string = room.getChestItem() as string;

        // If using the canonical books order, we'll get the next book dynamically:
        if (REGISTRY.get('booksOrder') === 'canonical' && itemName === 'NEXT_BOOK') {
            // Get the next book to find:
            const nextBook: string|undefined = BOOKS.getNextBookToFind();
            if (nextBook === undefined) {
                // This should never happen, since we create chests according to the number of books
                throw new Error("No more books to find in the canonical order.");
            }
            // Otherwise, use the next book:
            return {
                name: nextBook,
                type: 'book',
                onCollect: () => {
                    BOOKS.obtainBook(nextBook);
                }
            };
        }

        // Otherwise, proceed with the default logic: check for book or commandment
        let entry: GBookEntry|GGlossaryEntry|undefined = BOOKS.lookupEntry(itemName);

        // If entry was found in BOOKS, return a book item:
        if (entry !== undefined) {
            return {
                name: itemName,
                type: 'book',
                onCollect: () => {
                    BOOKS.obtainBook(itemName);
                }
            };
        } else if (itemName.startsWith('armor')) {
            // It's an armor item; look it up in the GLOSSARY:
            entry = GLOSSARY.lookupEntry(itemName);
            const armorNum = parseInt(itemName.split('_')[1]) as SIX;
            return {
                name: itemName,
                type: 'item',
                onCollect: () => {
                    ARMORS.obtainArmor(armorNum);
                }
            };
        } else if (itemName.startsWith('cmd')) {
            // It's a commandment; look it up in the GLOSSARY:
            entry = GLOSSARY.lookupEntry(itemName);
            const cmdNum = parseInt(itemName.split('_')[1]) as TEN;
            return {
                name: itemName,
                type: 'item',
                onCollect: () => {
                    COMMANDMENTS.obtainCommandment(cmdNum);
                }
            };
        } else {
            // Otherwise, it's a key for the stronghold:
            return {
                name: itemName,
                type: 'item',
                onCollect: () => {
                    const area = room.getArea() as GStrongholdArea;
                    PLAYER.changeKeys(area.getStrongholdIndex(), 1);
                }
            };
        }
    }

    /**
     * Overridden so depth is reset when we spawn a common chest.
     */
    public setPosition(x?: number, y?: number, z?: number, w?: number): this {
        const retThis: this = super.setPosition(x, y, z, w);
        if (this.body !== null) {
            this.body.updateFromGameObject();
            this.setDepth(this.body.bottom);
        }
        return retThis;
    }
}