import { GStronghold } from "./GStronghold";

export namespace STRONGHOLD {
    let strongholds: GStronghold[] = [];

    export function addGStronghold(stronghold: GStronghold) {
        strongholds.push(stronghold);
    }

    export function getGStrongholds() {
        return strongholds;
    }
}