import { GStronghold } from "./strongholds/GStronghold";

export namespace STRONGHOLD {
    const strongholds: GStronghold[] = [];

    export function addStronghold(stronghold: GStronghold) {
        strongholds.push(stronghold);
    }

    export function getStrongholds() {
        return strongholds;
    }
}