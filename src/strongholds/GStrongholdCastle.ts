import { AREA } from "../area";
import { GStrongholdArea } from "../areas/GStrongholdArea";
import { GStronghold } from "./GStronghold";

export class GStrongholdCastle extends GStronghold {

    /**
     * Stronghold: Castle of Perdition
     * Armor: Helmet of Salvation
     * Boss: Beelzebub
     * Challenge: The player's faith slowly drains while inside the stronghold,
     * at the rate of 1 every second. At 100% faith, this effect is negated.
     */

    constructor() {
        super('Castle of Perdition', 4, 'castle_front', AREA.CASTLE_AREA);
    }

    public getProphetThemeText(): string {
        return `This dread place is the Castle of Perdition. Here thy faith will be tested sorely; therefore continue in the faith, grounded and settled, and be not moved away from the hope of the gospel. I say again, hold fast the profession of thy faith without wavering!`;
    }

    public getProphetArmourText(): string {
        return `May thou find herein the Helmet of Salvation: for by grace are ye saved through faith; and that not of yourselves: it is the gift of God.`;
    }

    public getProphetBossText(): string {
        return `Beelzebub, prince of devils, lord of the flies, doth spread his corruption from this dark stronghold. But we are not of them who draw back unto perdition; but of them that believe to the saving of the soul.`;
    }
}