import { BoundedGameObject } from "../../types";

type PPart = 'top'|'left'|'right'|'bottom'|'ctrX'|'ctrY';

type PRule = {
    object: BoundedGameObject;
    objectPart: PPart;
    attachTo: BoundedGameObject;
    attachToPart: PPart;
    adjustment: number
};

/**
 * This class allows designing a layout without knowing the final size of components
 * or their parent container ahead of time. This is important for dynamic layouts, since
 * the size of the parent will depend on the components size.
 *
 * Usage:
 * 1. Create each component without regard to its initial placement (0,0 is fine)
 * 2. Use addRule() to establish how each component should be arranged relative to others
 * 3. Use the size of the components to determine a size/shape for the dynamic container
 * 4. Resize the dynamic container
 * 5. Call arrangeAll() to set each component in its proper position
 *
 * Note that rules are executed in order as commands, so it is important to order them
 * by dependencies (i.e. indpendent first, dependent on it after).
 */
export class GDynamicPositioner {

    private rules: PRule[] = [];

    public addRule(
        object: BoundedGameObject,
        objectPart: PPart,
        attachTo: BoundedGameObject,
        attachToPart: PPart,
        adjustment: number = 0
    ) {
        this.rules.push({
            object: object,
            objectPart: objectPart,
            attachTo: attachTo,
            attachToPart: attachToPart,
            adjustment: adjustment
        });
    }

    private getCoordinateValue(object: BoundedGameObject, part: PPart): number {
        switch(part) {
            case "top":
                return object.y;
            case "left":
                return object.x;
            case "right":
                return object.x + object.width;
            case "bottom":
                return object.y + object.height;
            case "ctrX":
                return object.x + (object.width / 2);
            case "ctrY":
                return object.y + (object.height / 2);
        }
    }

    private arrange(object: BoundedGameObject, part: PPart, coordinate: number, adjustment: number) {
        switch(part) {
            case "top":
                object.y = coordinate + adjustment;
                break;
            case "left":
                object.x = coordinate + adjustment;
                break;
            case "right":
                object.x = coordinate - object.width + adjustment;
                break;
            case "bottom":
                object.y = coordinate - object.height + adjustment;
                break;
            case "ctrX":
                object.x = coordinate - (object.width / 2) + adjustment;
                break;
            case "ctrY":
                object.y = coordinate - (object.height / 2) + adjustment;
                break;
        }
    }

    public arrangeAll() {
        let coordinate: number;
        this.rules.forEach(a => {
            coordinate = this.getCoordinateValue(a.attachTo, a.attachToPart);
            this.arrange(a.object, a.objectPart, coordinate, a.adjustment);
        });
    }
}