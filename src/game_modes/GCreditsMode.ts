import { GBaseGameMode } from "./GBaseGameMode";

export type GCreditsExitDestination = 'mainMenu'|'gameOver';

export class GCreditsMode extends GBaseGameMode{

    private exitDestination: GCreditsExitDestination = 'mainMenu';

    constructor() {
        super('Credits Mode', 'CreditsContent');
    }

    public setExitDestination(destination: GCreditsExitDestination): void {
        this.exitDestination = destination;
    }

    public getExitDestination(): GCreditsExitDestination {
        return this.exitDestination;
    }

}
