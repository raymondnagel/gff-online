import { GRandom } from "../GRandom";
import { GFF } from "../main";
import { PLAYER } from "../player";
import { GAdventureContent } from "../scenes/GAdventureContent";
import { GItem } from "../types";
import { GPopup } from "./components/GPopup";

export class GTreasureChest extends Phaser.Physics.Arcade.Image {

    private premium: boolean;

    constructor(scene: GAdventureContent, x: number, y: number, premium: boolean) {
        super(scene, x, y, premium ? 'premium_chest' : 'common_chest');
        this.setOrigin(0, 0);
        this.premium = premium;

        // Add to scene:
        scene.add.existing(this);

        // Configure physical properites:
        scene.physics.add.existing(this);
        if (this.body !== null) {
            this.body.setSize(64, 20);
            this.body.setOffset(0, 34);
            this.body.immovable = true;
            this.body.updateFromGameObject();
            this.setDepth(this.body.bottom);
        }

        // Add to the scene as a special:
        scene.addSpecial(this);
    }

    public open() {
        const item: GItem = this.premium ? this.getPremiumItem() : this.getCommonItem();
        GFF.AdventureContent.scene.pause();
        GFF.AdventureUI.getSound().playSound('open_chest').once('complete', () => {
            GPopup.createItemPopup(item.name);
            item.onCollect();
            this.destroy();
        });
    }

    private getCommonItem(): GItem {
        const item: GItem = GRandom.randElementWeighted([
            {
                element: { name: 'seed', onCollect: () => {PLAYER.changeSeeds(1)} },
                weight: 20
            },
            {
                element: { name: 'milk', onCollect: () => {PLAYER.changeFaith(50)} },
                weight: 20
            },
            {
                element: { name: 'meat', onCollect: () => {PLAYER.changeFaith(200)} },
                weight: 10
            },
            {
                element: { name: 'strong_meat', onCollect: () => {PLAYER.changeFaith(500)} },
                weight: 5
            },
            {
                element: { name: 'sermon', onCollect: () => {PLAYER.changeSermons(1)} },
                weight: 5
            }
        ]) as GItem;

        return item;
    }

    private getPremiumItem(): GItem {
        return this.getCommonItem();
    }

    public toString() {
        return this.premium ? 'premium_chest' : 'common_chest';
    }
}