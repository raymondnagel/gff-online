import { GFF } from "../../main";
import { SCENERY } from "../../scenery";
import { GTravelAgentSprite } from "../chars/GTravelAgentSprite";
import { GObstacleStatic } from "./GObstacleStatic";

export class GSpiritTravelAgency extends GObstacleStatic {

    constructor(x: number, y: number) {
        super(SCENERY.def('travel_agency_front'), x, y);
        this.setOrigin(0, 0);

        // We'll never create a travel agency without a travel agent!
        const travelAgent: GTravelAgentSprite = new GTravelAgentSprite(0, 0);
        const agentX: number = x + 178;
        const agentY: number = y + 242;

        GFF.AdventureContent.spawnPerson(travelAgent, {x: agentX, y: agentY});
    }

}