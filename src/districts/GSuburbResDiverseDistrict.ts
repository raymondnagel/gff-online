import { GRoom } from "../GRoom";
import { RANDOM } from "../random";
import { GTownDistrict } from "./GTownDistrict";

/**
 * A suburban residential district with mansions, cottages, and differently-styled
 * houses. Buildings are typically more spread out, with sizable yards.
 *
 * For diverse districts, pick a random building from each
 * category for each instance.
 */
export class GSuburbResDiverseDistrict extends GTownDistrict {
    constructor() {
        super('Suburban Residential Diverse District');

        this.setFrontBuildingKeys([
            'mansion_front',
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

        // Don't put more than one mansion in a district
        this.addSingleInstanceKeys(['mansion_front']);
    }

    public getFenceStyle(): 'fence_link'|'fence_picket' {
        if (RANDOM.flipCoin()) {
            return 'fence_picket';
        } else {
            return 'fence_link';
        }
    }

    public getFenceSpacing(): number {
        return RANDOM.randInt(6, 12);
    }
}