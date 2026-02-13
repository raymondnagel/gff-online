import { AREA } from "../area";
import { GStrongholdArea } from "../areas/GStrongholdArea";
import { GStronghold } from "./GStronghold";

export class GStrongholdKeep extends GStronghold {

    /**
     * Stronghold: Keep of Wickedness
     * Armor: Breastplate of Righteousness
     * Boss: Belial
     * Challenge: 50% of common chests contain the "Treasure of Wickedness"
     * item, which halves the player's remaining faith and grace. At 100% faith,
     * these chests are revealed and can be avoided.
     */

    constructor() {
        super("Keep of Wickedness", 2, "keep_front");
    }

    public getProphetThemeText(): string {
        return `Thou art in the very heart of evil, the Keep of Wickedness. Beware the treasures of wickedness: for the end of those things is death! But walk by faith, and not by sight; and thou shalt not fall prey to the deceitfulness of sin.`;
    }

    public getProphetArmourText(): string {
        return `The Breastplate of Righteousness shall be thy reward, if by faith thou dost overcome. For with the heart man believeth unto righteousness: even the righteousness of God which is by faith of Jesus Christ unto all and upon all them that believe.`;
    }

    public getProphetBossText(): string {
        return `Wicked Belial reigneth within this stronghold, the enemy of all righteousness, whose sons have long perverted the right ways of the Lord. Therefore love righteousness, and hate wickedness: for what concord hath Christ with Belial?`;
    }

    public getStoneTint(): number {
        // A dark gray tint, representative of darkness.
        return 0x999999;
    }
}