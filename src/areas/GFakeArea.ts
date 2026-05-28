import { GRoom } from "../GRoom";
import { GChurchRegion } from "../regions/GChurchRegion";
import { GBuildingArea } from "./GBuildingArea";

export class GFakeArea extends GBuildingArea {

    constructor() {
        super(
            'Fake Area',
            'togodglory',
            1, // floor
            1,
            1
        );
    }

    public generate(): void {
        super.generate();
        this.createRooms();
    }

    public isSafe(): boolean {
        return true;
    }

    protected initRoom(room: GRoom): void {
        super.initRoom(room);
    }

}