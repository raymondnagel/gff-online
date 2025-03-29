import { GRegion } from "./GRegion";

export abstract class GInsideRegion extends GRegion{

    public isInterior(): boolean {
        return true;
    }

}
