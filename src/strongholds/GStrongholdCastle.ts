import { AREA } from "../area";
import { GStrongholdArea } from "../areas/GStrongholdArea";
import { GStronghold } from "./GStronghold";

export class GStrongholdCastle extends GStronghold {

    /**
     * Stronghold: Castle of Perdition
     * Armor: Helmet of Salvation
     * Boss: Apollyon
     * Challenge: The player's faith slowly drains while inside the stronghold,
     * at the rate of 1 every second. At 100% faith, this effect is negated.
     */

    constructor() {
        super('Castle of Perdition', 4, 'castle_front');
    }

    public getProphetThemeText(): string {
        return `This dread place is the Castle of Perdition. Here thy faith will be tested sorely; therefore continue in the faith, grounded and settled, and be not moved away from the hope of the gospel. I say again, hold fast the profession of thy faith without wavering!`;
    }

    public getProphetArmourText(): string {
        return `May thou find herein the Helmet of Salvation: for GOD the Lord, the strength of thy salvation, shall cover thy head in the day of battle.`;
    }

    public getProphetBossText(): string {
        return `This stronghold is ruled by Apollyon the Destroyer, a powerful foe. He seeketh to drag thee down into the bottomless pit from whence he came, where he drowneth men in destruction and perdition. Trust in the LORD, who redeemeth thy life from destruction: salvation is of the LORD!`;
    }

    public getStoneTint(): number {
        // A dark red tint, like corruption and perdition.
        return 0xEE9999;
    }
}