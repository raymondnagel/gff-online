import { GRoom } from "../GRoom";
import { RANDOM } from "../random";
import { GCityResMonoDistrict } from "./GCityResMonoDistrict";
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
 * A suburban residential district with similarly-styled houses.
 * Buildings are typically more spread out, with sizable yards.
 *
 * For mono districts, pick a random set use it to initialize
 * the building keys.
 */
export class GSuburbResMonoDistrict extends GTownDistrict {

    private static sets: MonoSet[] = [
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

    private fenceStyle: 'fence_link'|'fence_picket';

    constructor() {
        super('Suburban Residential Monotype District');
    }

    public initForRoom(room: GRoom, requiresTravelAgency: boolean) {
        super.initForRoom(room, requiresTravelAgency);

        // Select a random set from the predefined sets
        const selectedSet = RANDOM.randElement(GSuburbResMonoDistrict.sets);

        // Initialize building keys based on the selected set
        this.setFrontBuildingKeys([selectedSet.frontKey]);
        this.setBackBuildingKeys([selectedSet.backKey]);
        this.setSideBuildingKeys([selectedSet.sideKey]);

        // Randomly choose a fence style for this district
        this.fenceStyle = RANDOM.flipCoin() ? 'fence_link' : 'fence_picket';
    }

    public getFenceStyle(): 'fence_link'|'fence_picket' {
        return this.fenceStyle;
    }

    public getFenceSpacing(): number {
        return RANDOM.randInt(6, 12);
    }
}