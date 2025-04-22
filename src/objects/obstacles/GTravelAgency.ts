import { GFF } from "../../main";
import { SCENERY } from "../../scenery";
import { GTravelAgentSprite } from "../chars/GTravelAgentSprite";
import { GObstacleStatic } from "./GObstacleStatic";

export class GTravelAgency extends GObstacleStatic {

    constructor(x: number, y: number) {
        super(SCENERY.def('travel_agency'), x, y);
        this.setOrigin(0, 0);

        // We'll never create a travel agency without a travel agent!
        const travelAgent: GTravelAgentSprite = new GTravelAgentSprite(0, 0);
        const agentX: number = x + 190;
        const agentY: number = y + 310;

        console.log(`Spawn travel agency at ${x}, ${y}`);
        console.log(`Travel agency size: ${this.width} x ${this.height}.`)
        console.log(`Spawn travel agent at ${agentX}, ${agentY}`);
        GFF.AdventureContent.spawnPerson(travelAgent, {x: agentX, y: agentY});
    }

}