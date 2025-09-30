import { GRoom } from "../GRoom";
import { RANDOM } from "../random";
import { GTownDistrict } from "./GTownDistrict";

/**
 * An urban residential district with apartment buildings and
 * differently-styled houses. Schools and small shops can also
 * appear in urban residential areas. Buildings are fairly close together,
 * with little yard space.
 *
 * For diverse districts, pick a random building from each
 * category for each instance.
 */
export class GCityResDiverseDistrict extends GTownDistrict {
    constructor() {
        super('City Residential Diverse District');

        this.setFrontBuildingKeys([
            'apartments_front',
            'school_front',
            'shop_front',
            'cottage_front',
            'house_1_front',
            'house_2_front',
            'house_3_front',
            'house_4_front',
            'house_5_front',
        ]);

        this.setBackBuildingKeys([
            'house_1_back',
            'house_2_back',
            'house_3_back',
        ]);

        this.setSideBuildingKeys([
            'house_1_side',
            'house_1_side_tall',
            'house_2_side',
            'house_3_side',
            'house_3_side_tall',
        ]);
    }

    public getFenceStyle(): 'fence_link'|'fence_stockade' {
        if (RANDOM.flipCoin()) {
            return 'fence_stockade';
        } else {
            return 'fence_link';
        }
    }

    public getFenceSpacing(): number {
        return RANDOM.randInt(3, 6);
    }
}