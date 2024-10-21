import { GArea } from "../GArea";
import { GRegion } from "../GRegion";
import { GRoom } from "../GRoom";

export class GWorldArea extends GArea {

    private defaultRegion: GRegion;

    constructor() {
        super(
            'Land of Allegoria',
            'togodglory',
            16,
            16,
            [
                'oak_tree',
                'pine_tree',
                'campfire'
            ]
        );

        this.defaultRegion = new GRegion('Default Region', 'grass_bg', 'map_grass');
        this.createRooms();
    }

    public initRoom(room: GRoom): void {
        room.setRegion(this.defaultRegion);

        // Keep room @ 0,0 clear for testing right now:
        if (room.getX() === 0 && room.getY() === 0) {
            return;
        }

        super.initRoom(room);
    }
}