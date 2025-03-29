import { BoundedGameObject, GPoint, GRect } from "./types";

export namespace PHYSICS {

    /**
     * Physically operations generally require a BoundedGameObject - a GameObject with location
     * and dimension. Phaser doesn't seem to have a native way to group objects like this, which
     * can be descended from GameObject differently (e.g. Image vs. Sprite). So we have our own version.
     *
     * This function takes a GameObject and returns a Bounded version, if possible; otherwise, it
     * returns null. This allows the calling code to perform a physical operation on a GameObject
     * only if it turns out to be physical (i.e. bounded).
     */
    export function asBoundedGameObject(object: Phaser.GameObjects.GameObject): BoundedGameObject|null {
        if (
            'x' in object && typeof object.x === "number" &&
            'y' in object && typeof object.y === "number" &&
            'width' in object && typeof object.width === "number" &&
            'height' in object && typeof object.height === "number" &&
            'setPosition' in object && typeof object.setPosition === "function"
        ) {
            console.log(`Verified object: x:${object.x} y:${object.y} w:${object.width} h:${object.height}`)
            return object as BoundedGameObject;
        }
        return null;
    }

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

    export function isCenterWithin(object: BoundedGameObject, area: GRect) {
        const ctr: GPoint = getPhysicalCenter(object) as GPoint;
        return ctr.x >= area.x
            && ctr.x < area.x + area.width
            && ctr.y >= area.y
            && ctr.y < area.y + area.height;
    }

    export function getDistanceBetween(object1: BoundedGameObject, object2: BoundedGameObject) {
        const ctr1: GPoint = getPhysicalCenter(object1) as GPoint;
        const ctr2: GPoint = getPhysicalCenter(object2) as GPoint;
        return Phaser.Math.Distance.BetweenPoints(ctr1, ctr2);
    }

    export function setPositionRelativeTo(relObject: BoundedGameObject, refObject: BoundedGameObject, diffX: number, diffY: number) {
        relObject.setPosition(refObject.x + diffX, refObject.y + diffY);
    }
}