import { BOOKS } from "../books";
import { GLOSSARY } from "../glossary";
import { GRandom } from "../GRandom";
import { GRoom } from "../GRoom";
import { GFF } from "../main";
import { PLAYER } from "../player";
import { SCENERY } from "../scenery";
import { GBookEntry, GGlossaryEntry, GItem } from "../types";
import { GPopup } from "./components/GPopup";
import { GInteractable } from "./interactables/GInteractable";

export class GTreasureChest extends GInteractable {

    private premium: boolean;

    constructor(x: number, y: number, premium: boolean) {
        super(SCENERY.def(premium ? 'premium_chest' : 'common_chest'), x, y);
        this.setOrigin(0, 0);
        this.premium = premium;
    }

    public canInteract(): boolean {
        return PLAYER.getFaith() > 0;
    }

    public interact() {
        const item: GItem = this.premium ? this.getPremiumItem() : this.getCommonItem();
        GFF.AdventureContent.scene.pause();
        GFF.AdventureUI.getSound().playSound('open_chest').once('complete', () => {
            GFF.AdventureContent.getCurrentRoom()?.removePremiumChest();
            switch (item.type) {
                case 'book':
                    GPopup.createBookPopup(item.name);
                    break;
                case 'item':
                    GPopup.createItemPopup(item.name);
                    break;
            }
            item.onCollect();
            this.destroy();
        });
    }

    private getCommonItem(): GItem {
        const item: GItem = GRandom.randElementWeighted([
            {
                element: { name: 'seed', type: 'item', onCollect: () => {PLAYER.changeSeeds(1)} },
                weight: 20
            },
            {
                element: { name: 'milk', type: 'item', onCollect: () => {PLAYER.changeFaith(50)} },
                weight: 20
            },
            {
                element: { name: 'meat', type: 'item', onCollect: () => {PLAYER.changeFaith(200)} },
                weight: 10
            },
            {
                element: { name: 'strong_meat', type: 'item', onCollect: () => {PLAYER.changeFaith(500)} },
                weight: 5
            },
            {
                element: { name: 'sermon', type: 'item', onCollect: () => {PLAYER.changeSermons(1)} },
                weight: 5
            }
        ]) as GItem;

        return item;
    }

    private getPremiumItem(): GItem {
        const room: GRoom = GFF.AdventureContent.getCurrentRoom() as GRoom;
        const itemName: string = room.getChestItem() as string;
        let entry: GBookEntry|GGlossaryEntry|undefined = BOOKS.lookupEntry(itemName);

        // If entry was found in BOOKS, return a book item:
        if (entry !== undefined) {
            return {
                name: itemName,
                type: 'book',
                onCollect: () => {BOOKS.obtainBook(itemName)}
            };
        } else {
            // Otherwise, look it up in the GLOSSARY:
            entry = GLOSSARY.lookupEntry(itemName);
            return {
                name: itemName,
                type: 'item',
                onCollect: () => {/* Cross this bridge when we get to it */}
            };
        }
    }
}