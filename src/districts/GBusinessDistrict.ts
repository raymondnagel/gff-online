import { GRoom } from "../GRoom";
import { RANDOM } from "../random";
import { GTownDistrict } from "./GTownDistrict";

/**
 * A business district will feature a variety of commercial buildings,
 * offices, and retail spaces. Houses and generic buildings
 * can be used as need for sides/backs, since business buildings
 * only have front-facing designs.
 *
 * Apart from Mixed Districts, Business Districts are the only districts
 * that can have a Travel Agency, which is required for every town.
 */
export class GBusinessDistrict extends GTownDistrict {
    constructor() {
        super('Business District');

        this.setFrontBuildingKeys([
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
            'classic_1_front',
            'classic_2_front',
            'factory_front',
            'police_station_front',
            'school_front',
            'shop_front',
            'skyscraper_front',
            'supermarket_front',
            'warehouse_front'
        ]);
    }

    public getFenceStyle(): 'fence_link'|'fence_stockade' {
        if (RANDOM.randInt(1, 3) === 1) {
            return 'fence_stockade';
        } else {
            return 'fence_link';
        }
    }

    public getFenceSpacing(): number {
        return RANDOM.randInt(4, 8);
    }
}