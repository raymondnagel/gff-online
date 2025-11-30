import { AREA } from "../area";
import { GStrongholdArea } from "../areas/GStrongholdArea";
import { GStronghold } from "./GStronghold";

export class GStrongholdFortress extends GStronghold {

    /**
     * Stronghold: Fortress of Enmity
     * Armor: Shoes of the Gospel of Peace
     * Boss: Legion
     * Challenge: Many rooms contain stone statues of devils, which animate into
     * enemies when approached. At 100% faith, the statues remain stone and do
     * not animate.
     */

    constructor() {
        super("Fortress of Enmity", 3, "fortress_front", AREA.FORTRESS_AREA);
    }

    public getProphetThemeText(): string {
        return `This stronghold is known as the Fortress of Enmity: for there is no peace, saith my God, to the wicked. Even the statues of this place may become thine enemies! But be strong in faith, trusting in God: and he will keep thee in perfect peace.`;
    }

    public getProphetArmourText(): string {
        return `Here thou canst obtain the Shoes of the Gospel of Peace, wherewithal thy feet may be shod. Though many feet be swift in running to mischief, may thine be blessed and beautiful as thou servest the Prince of Peace!`;
    }

    public getProphetBossText(): string {
        return `In this stronghold dwelleth Legion, a horde of vicious devils which tormenteth the souls of men as they sow discord and strife. Let therefore the peace of God, which passeth all understanding, keep thy heart and mind through Christ Jesus; and the God of peace shall bruise Satan under thy feet shortly.`;
    }

    public getStoneTint(): number {
        // An evil green tint, like envy and poison.
        return 0x99EE99;
    }
}