import { GInteriorWallPiece, GInteriorWallSet, GSceneryDef } from "../types";
import { GRegion } from "./GRegion";


export abstract class GInsideRegion extends GRegion{

    public isInterior(): boolean {
        return true;
    }

    public abstract getWallPiece(key: GInteriorWallPiece): GSceneryDef|undefined;
}
