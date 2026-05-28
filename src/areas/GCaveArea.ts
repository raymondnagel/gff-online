import { GRoom } from "../GRoom";
import { GCaveRegion } from "../regions/GCaveRegion";
import { REGISTRY } from "../registry";
import { GBuildingArea } from "./GBuildingArea";

export class GCaveArea extends GBuildingArea {

    constructor() {
        super(
            'Gloomy Tomb',
            'cavern',
            1, // floor
            1,
            1
        );
    }

    public getName(): string {
        if (REGISTRY.getBoolean('invitedToCave')) {
            return 'Gloomy Tomb';
        } else {
            return 'Cave';
        }
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
        room.setRegion(new GCaveRegion());
    }

}