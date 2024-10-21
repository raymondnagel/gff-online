import { GAdventureContent } from "../../scenes/GAdventureContent";
import { GObstacleSprite } from "./GObstacleSprite";

export class GCampfire extends GObstacleSprite{

    constructor(scene: GAdventureContent, x: number, y: number) {
        super(
            scene,
            'campfire',
            7,
            10,
            x,
            y,
            0,
            98,
            112,
            50
        );
    }
}