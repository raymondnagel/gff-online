import { BoundedGameObject, GPerson, GPoint } from "./types";

export namespace PHYSICS {

    export function getPhysicalCenter(object: BoundedGameObject): GPoint|null {
        // Calculate relative to position using body offset and size;
        // don't use body.center, as it may not be accurate if the object
        // was just repositioned.
        if (object.body) {
            const body: Phaser.Physics.Arcade.Body = object.body as Phaser.Physics.Arcade.Body;
            return {
                x: object.x + body.offset.x + body.width / 2,
                y: object.y + body.offset.y + body.height / 2
            };
        }
        return null;
    }

    export function centerPhysically(object: BoundedGameObject, point: GPoint) {
        if (object.body && 'setPosition' in object) {
            const body: Phaser.Physics.Arcade.Body = object.body as Phaser.Physics.Arcade.Body;
            const x: number = point.x - (body.width / 2) - body.offset.x;
            const y: number = point.y - (body.height / 2) - body.offset.y;
            object.setPosition(x, y);
        }
    }
}