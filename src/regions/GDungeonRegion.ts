import { GRoom } from "../GRoom";
import { RANDOM } from "../random";
import { GStrongholdRegion } from "./GStrongholdRegion";

export class GDungeonRegion extends GStrongholdRegion {

    protected _furnishRoom(room: GRoom): void {
        // Call the parent method for common stronghold furnishing:
        super._furnishRoom(room);

        // Add stone blocks randomly:
        for (let i = 0; i < 5; i++) {
            const x = RANDOM.randInt(1, 14);
            const y = RANDOM.randInt(1, 9);
            room.planTileScenery('stone_block', x, y);
        }

        // Add illusionary blocks randomly:
        for (let i = 0; i < 5; i++) {
            const x = RANDOM.randInt(1, 14);
            const y = RANDOM.randInt(1, 9);
            room.planTileScenery('illusionary_block', x, y);
        }
    }
}
