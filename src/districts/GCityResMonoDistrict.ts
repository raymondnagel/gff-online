import { GRoom } from "../GRoom";
import { RANDOM } from "../random";
import { GTownDistrict } from "./GTownDistrict";

/**
 * Define sets for mono residential districts,
 * with matching houses for each side.
 */
type MonoSet = {
    frontKey: string;
    backKey: string;
    sideKey: string;
};

/**
 * An urban residential district with apartment buildings and
 * similarly-styled houses. Buildings are fairly close together,
 * with little yard space.
 *
 * For mono districts, pick a random set use it to initialize
 * the building keys.
 */
export class GCityResMonoDistrict extends GTownDistrict {

    private static sets: MonoSet[] = [
        {
            frontKey: 'apartments_front',
            backKey: 'house_1_back',
            sideKey: 'house_1_side',
        },
        {
            frontKey: 'house_1_front',
            backKey: 'house_1_back',
            sideKey: 'house_1_side',
        },
        {
            frontKey: 'house_4_front',
            backKey: 'house_1_back',
            sideKey: 'house_1_side',
        },
        {
            frontKey: 'house_5_front',
            backKey: 'house_1_back',
            sideKey: 'house_1_side',
        },
        {
            frontKey: 'house_2_front',
            backKey: 'house_2_back',
            sideKey: 'house_2_side',
        },
        {
            frontKey: 'house_3_front',
            backKey: 'house_3_back',
            sideKey: 'house_3_side',
        },
    ];

    private fenceStyle: 'fence_link'|'fence_stockade';

    constructor() {
        super('City Residential Monotype District');
    }

    public initForRoom(room: GRoom, requiresTravelAgency: boolean) {
        super.initForRoom(room, requiresTravelAgency);

        // Select a random set from the predefined sets
        const selectedSet = RANDOM.randElement(GCityResMonoDistrict.sets);

        // Initialize building keys based on the selected set
        this.setFrontBuildingKeys([selectedSet.frontKey]);
        this.setBackBuildingKeys([selectedSet.backKey]);
        this.setSideBuildingKeys([selectedSet.sideKey]);

        // Randomly choose a fence style for this district
        this.fenceStyle = RANDOM.flipCoin() ? 'fence_link' : 'fence_stockade';
    }

    public getFenceStyle(): 'fence_link'|'fence_stockade' {
        return this.fenceStyle;
    }

    public getFenceSpacing(): number {
        return RANDOM.randInt(3, 6);
    }
}