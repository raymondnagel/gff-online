import { AREA } from "../area";
import { GStrongholdArea } from "../areas/GStrongholdArea";
import { GStronghold } from "./GStronghold";

export class GStrongholdTower extends GStronghold {

    /**
     * Stronghold: Tower of Deception
     * Armor: Girdle of Truth
     * Boss: Mammon
     * Challenge: Each room with a staircase up also has false staircases that lead
     * down instead. At 100% faith, the false staircases are revealed, making the
     * true path obvious.
     */

    constructor() {
        super("Tower of Deception", 0, "tower_front", AREA.TOWER_AREA);
    }

    public getProphetThemeText(): string {
        return `This place is the Tower of Deception. On each floor, thou wilt find staircases which appear to lead up; but many of them deceive thee, and will only thwart thy purpose. Be full of faith, trusting in the LORD, and he shall direct thy paths.`;
    }

    public getProphetArmourText(): string {
        return `Within this stronghold thou wilt find the Girdle of Truth, which hath been worn through the ages by those who walk in truth by faith in God's holy word. May thou, my brother, also walk uprightly, according to the truth of the gospel!`;
    }

    public getProphetBossText(): string {
        return `The prince of this stronghold is Mammon, spirit of greed and the love of money. He ensnareth souls through the deceitfulness of riches, desiring to choke the word. My brother, thou canst not serve both God and Mammon; choose thou this day whom thou wilt serve!`;
    }
}