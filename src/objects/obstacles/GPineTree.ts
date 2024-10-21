import { GAdventureContent } from "../../scenes/GAdventureContent";
import { GObstacleStatic } from "./GObstacleStatic";

export class GPineTree extends GObstacleStatic{

    constructor(scene: GAdventureContent, x: number, y: number) {
        super(
            scene,
            'pine_tree',
            x,
            y,
            70,
            264,
            78,
            36
        );
    }
}