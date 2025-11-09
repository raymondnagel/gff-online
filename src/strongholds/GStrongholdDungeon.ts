import { AREA } from "../area";
import { GStrongholdArea } from "../areas/GStrongholdArea";
import { GStronghold } from "./GStronghold";

export class GStrongholdDungeon extends GStronghold {

    /**
     * Stronghold: Dungeon of Doubt
     * Armor: Shield of Faith
     * Boss: Apollyon
     * Challenge: Many illusory walls seem to block the way, but dissipate when
     * touched. At 100% faith, they do not appear at all.
     */

    constructor() {
        super("Dungeon of Doubt", 1, "dungeon_front", AREA.DUNGEON_AREA);
    }

    public getProphetThemeText(): string {
        return `This confusing place is none other than the Dungeon of Doubt. Many obstacles seem to block thy way; however, they are but illusions that the enemy hath placed to make thee doubt the way forward. Only by faith canst thou dissolve these doubts and proceed in confidence.`;
    }

    public getProphetArmourText(): string {
        return `Here thou shalt find the Shield of Faith, that which can quench all the fiery darts of the wicked. Have faith in God, my brother; and he shall be thy shield, and thy exceeding great reward!`;
    }

    public getProphetBossText(): string {
        return `This stronghold is ruled by Apollyon, angel of the bottomless pit. He seeks to instill doubt and fear in the hearts of men, dissuading them from trusting in God. Beloved, think it not strange concerning the fiery trial which is to try you, as though some strange thing happened unto you: but rejoice, inasmuch as ye are partakers of Christ's sufferings!`;
    }
}