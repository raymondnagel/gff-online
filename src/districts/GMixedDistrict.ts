import { GRoom } from "../GRoom";
import { RANDOM } from "../random";
import { GTownDistrict } from "./GTownDistrict";

/**
 * A mixed district can feature buildings of practically every type.
 *
 * Apart from Business Districts, Mixed Districts are the only districts
 * that can have a Travel Agency, which is required for every town.
 */
export class GMixedDistrict extends GTownDistrict {
    constructor() {
        super('Mixed District');

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
            'garage_4_front',
            'classic_1_front',
            'classic_2_front',
            'factory_front',
            'police_station_front',
            'school_front',
            'shop_front',
            'skyscraper_front',
            'supermarket_front',
            'warehouse_front',
        ]);

        this.setBackBuildingKeys([
            'house_1_back',
            'house_2_back',
            'house_3_back',
            'generic_1_back',
            'generic_2_back',
            'generic_3_back',
            'generic_4_back',
        ]);

        this.setSideBuildingKeys([
            'house_1_side',
            'house_1_side_tall',
            'house_2_side',
            'house_3_side',
            'house_3_side_tall',
            // Generic backs also work for side views
            'generic_1_back',
            'generic_2_back',
            'generic_3_back',
            'generic_4_back',
        ]);

        // Don't duplicate any building fronts in this district;
        // shoot for variety, since we have so many different buildings to use
        this.addSingleInstanceKeys([
            'apartments_front',
            'school_front',
            'shop_front',
            'cottage_front',
            'house_1_front',
            'house_2_front',
            'house_3_front',
            'house_4_front',
            'house_5_front',
            'garage_4_front',
            'classic_1_front',
            'classic_2_front',
            'factory_front',
            'police_station_front',
            'school_front',
            'shop_front',
            'skyscraper_front',
            'supermarket_front',
            'warehouse_front',
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
        return RANDOM.randInt(4, 10);
    }
}