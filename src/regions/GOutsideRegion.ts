import { GTown } from "../GTown";
import { RANDOM } from "../random";
import { Dir9, GSceneryDef } from "../types";
import { GRegion } from "./GRegion";

export abstract class GOutsideRegion extends GRegion{

    public isInterior(): boolean {
        return false;
    }

    public abstract getWalls(): Record<Dir9, GSceneryDef|null>;

    /**
     * There are several options for generating the full name of a region.
     * - we can do {generic_noun} of {town_name}
     * - we can do {town_adjective} {generic_noun}
     * - we can grab a predefined name
     */
    public generateFullName(town?: GTown) {
        if (town && RANDOM.flipCoin()) {
            if (RANDOM.flipCoin()) {
                this.setFullName(`${this.getGenericNounForName()} of ${town.getName()}`);
            } else {
                this.setFullName(`${town.getAdjective()} ${this.getGenericNounForName()}`);
            }
        } else {
            if (RANDOM.flipCoin()) {
                this.setFullName(`${this.getGenericNounForName()} of ${this.getStockRegionName()}`);
            } else {
                this.setFullName(`${this.getStockRegionAdjective()} ${this.getGenericNounForName()}`);
            }
        }
    }

    protected abstract getGenericNounForName(): string;
    protected abstract getStockRegionName(): string;
    protected abstract getStockRegionAdjective(): string;
}
