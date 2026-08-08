import { GBaseGameMode } from "./GBaseGameMode";

type GSubscreenExitDestination = 'adventure'|'mainMenu';

export class GOptionsMode extends GBaseGameMode{

    private exitDestination: GSubscreenExitDestination = 'adventure';

    constructor() {
        super('Options Mode', undefined, 'OptionsUI');
    }

    public switchTo(fromMode?: GBaseGameMode): void {
        this.exitDestination = this.getDestinationFromMode(fromMode);
        super.switchTo(fromMode);
    }

    public getExitDestination(): GSubscreenExitDestination {
        return this.exitDestination;
    }

    private getDestinationFromMode(fromMode?: GBaseGameMode): GSubscreenExitDestination {
        if (fromMode?.getName() === 'Main Menu Mode') {
            return 'mainMenu';
        }

        const priorDestination = fromMode && 'getExitDestination' in fromMode
            ? (fromMode.getExitDestination as () => GSubscreenExitDestination)()
            : undefined;

        return priorDestination === 'mainMenu' ? 'mainMenu' : 'adventure';
    }

}
