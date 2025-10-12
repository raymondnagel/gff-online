import { Dir9, GSceneryDef } from "../types";
import { GRegion } from "./GRegion";

export abstract class GOutsideRegion extends GRegion{

    public isInterior(): boolean {
        return false;
    }

    public abstract getWalls(): Record<Dir9, GSceneryDef|null>;
}
