import { BoundedGameObject, GPoint2D, GRect } from "./types";

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
            return object as BoundedGameObject;
        }
        return null;
    }

    export function getPhysicalCenter(object: BoundedGameObject): GPoint2D|null {
        // Calculate relative to position using body offset and size;
        // don't use body.center, as it may not be accurate if the object
        // was just repositioned.
        if (object.body) {
            const body: Phaser.Physics.Arcade.Body = object.body as Phaser.Physics.Arcade.Body;
            let originOffsetX = 0;
            let originOffsetY = 0;
            if ('originX' in object && 'originY' in object) {
                originOffsetX = object.width * (object.originX as number);
                originOffsetY = object.height * (object.originY as number);
            }
            return {
                x: (object.x - originOffsetX) + body.offset.x + body.width / 2,
                y: (object.y - originOffsetY) + body.offset.y + body.height / 2
            };
        }
        return null;
    }

    export function getPhysicalTop(object: BoundedGameObject): number|null {
        // Calculate relative to position using body offset and size.
        if (object.body) {
            const body: Phaser.Physics.Arcade.Body = object.body as Phaser.Physics.Arcade.Body;
            return object.y + body.offset.y;
        }
        return null;
    }

    export function getPhysicalBottom(object: BoundedGameObject): number|null {
        // Calculate relative to position using body offset and size.
        if (object.body) {
            const body: Phaser.Physics.Arcade.Body = object.body as Phaser.Physics.Arcade.Body;
            return object.y + body.offset.y + body.height;
        }
        return null;
    }

    export function getPhysicalLeft(object: BoundedGameObject): number|null {
        // Calculate relative to position using body offset and size.
        if (object.body) {
            const body: Phaser.Physics.Arcade.Body = object.body as Phaser.Physics.Arcade.Body;
            return object.x + body.offset.x;
        }
        return null;
    }

    export function getPhysicalRight(object: BoundedGameObject): number|null {
        // Calculate relative to position using body offset and size.
        if (object.body) {
            const body: Phaser.Physics.Arcade.Body = object.body as Phaser.Physics.Arcade.Body;
            return object.x + body.offset.x + body.width;
        }
        return null;
    }

    export function centerPhysically(object: BoundedGameObject, point: GPoint2D) {
        if (object.body && 'setPosition' in object) {
            const body: Phaser.Physics.Arcade.Body = object.body as Phaser.Physics.Arcade.Body;
            const x: number = point.x - (body.width / 2) - body.offset.x;
            const y: number = point.y - (body.height / 2) - body.offset.y;
            object.setPosition(x, y);
        }
    }

    export function isCenterWithin(object: BoundedGameObject, area: GRect) {
        const ctr: GPoint2D = getPhysicalCenter(object) as GPoint2D;
        return isPointWithin(ctr.x, ctr.y, area);
    }

    export function isPointWithin(x: number, y: number, rect: GRect) {
        return x >= rect.x
            && x < rect.x + rect.width
            && y >= rect.y
            && y < rect.y + rect.height;
    }

    export function getDistanceBetween(object1: BoundedGameObject, object2: BoundedGameObject) {
        const ctr1: GPoint2D = getPhysicalCenter(object1) as GPoint2D;
        const ctr2: GPoint2D = getPhysicalCenter(object2) as GPoint2D;
        return Phaser.Math.Distance.BetweenPoints(ctr1, ctr2);
    }

    export function setPositionRelativeTo(relObject: BoundedGameObject, refObject: BoundedGameObject, diffX: number, diffY: number) {
        relObject.setPosition(refObject.x + diffX, refObject.y + diffY);
    }
}