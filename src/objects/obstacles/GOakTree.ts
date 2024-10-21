import { GAdventureContent } from "../../scenes/GAdventureContent";
import { GObstacleStatic } from "./GObstacleStatic";

export class GOakTree extends GObstacleStatic{

    constructor(scene: GAdventureContent, x: number, y: number) {
        super(
            scene,
            'oak_tree',
            x,
            y,
            76,
            200,
            116,
            36
        );
    }
}