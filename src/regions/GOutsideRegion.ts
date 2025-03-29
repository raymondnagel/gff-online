import { GRegion } from "./GRegion";

export abstract class GOutsideRegion extends GRegion{

    public isInterior(): boolean {
        return false;
    }

}
