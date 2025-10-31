
import { GStrongholdArea } from "../../areas/GStrongholdArea";
import { DEPTH } from "../../depths";
import { DIRECTION } from "../../direction";
import { GRoom } from "../../GRoom";
import { GFF } from "../../main";
import { PLAYER } from "../../player";
import { SCENERY } from "../../scenery";
import { CardDir, Dir9 } from "../../types";
import { GTouchable } from "./GTouchable";


export class GLockedDoor extends GTouchable {

    private direction: CardDir;
    private isUnlocking: boolean = false;

    constructor(key: string, vertDir?: 'N'|'S') {
        super(SCENERY.def(key), 0, 0);
        this.setOrigin(0, 0);

        switch (`${key}${vertDir ? vertDir : ''}`) {
            case 'vert_locked_doorN':
                this.setPosition(485, 8);
                this.direction = Dir9.N
                break;
            case 'vert_locked_doorS':
                this.setPosition(485, 627);
                this.direction = Dir9.S
                break;
            case 'west_locked_door':
                this.setPosition(50, 249);
                this.direction = Dir9.W;
                break;
            case 'east_locked_door':
                this.setPosition(960, 249);
                this.direction = Dir9.E;
                break;
        }
        this.setDepth(DEPTH.BG_DECOR);
    }

    public canTouch(): boolean {
        return !this.isUnlocking;
    }

    public doTouch() {
        // Unlock the door:
        this.isUnlocking = true;
        const room: GRoom = GFF.AdventureContent.getCurrentRoom() as GRoom;
        const area: GStrongholdArea = room.getArea() as GStrongholdArea;
        area.setLockedDoorByRoom(room, this.direction, false);

        // Fade out the door and destroy it once fully transparent:
        GFF.AdventureContent.getSound().playSound('stronghold_open');
        GFF.AdventureContent.tweens.add({
            targets: this,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                this.destroy();
            }
        });
    }
}