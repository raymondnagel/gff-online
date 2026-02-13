import { GRoom } from "../GRoom";
import { GChurchRegion } from "../regions/GChurchRegion";
import { GBuildingArea } from "./GBuildingArea";

export class GChurchArea extends GBuildingArea {

    constructor() {
        super(
            'Church Interior',
            'amazing',
            1, // floor
            1,
            1
        );
    }

    public generate(): void {
        super.generate();
        this.createRooms();
        this.createOuterBorder(0);
    }

    public isSafe(): boolean {
        return true;
    }

    protected initRoom(room: GRoom): void {
        super.initRoom(room);
        room.setRegion(new GChurchRegion());
    }

}