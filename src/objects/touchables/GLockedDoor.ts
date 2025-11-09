
import { GStrongholdArea } from "../../areas/GStrongholdArea";
import { DEPTH } from "../../depths";
import { DIRECTION } from "../../direction";
import { GRoom } from "../../GRoom";
import { GFF } from "../../main";
import { PLAYER } from "../../player";
import { SCENERY } from "../../scenery";
import { CardDir, Dir9 } from "../../types";
import { GPopup } from "../components/GPopup";
import { GTouchable } from "./GTouchable";


export class GLockedDoor extends GTouchable {

    private verseRef: string;
    private direction: CardDir;
    private isUnlocking: boolean = false;

    constructor(key: string, verseRef: string, vertDir?: 'N'|'S') {
        super(SCENERY.def(key), 0, 0);
        this.setOrigin(0, 0);
        this.verseRef = verseRef;

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
        const room: GRoom = GFF.AdventureContent.getCurrentRoom() as GRoom;
        const area: GStrongholdArea = room.getArea() as GStrongholdArea;
        const keys = PLAYER.getKeys(area.getStrongholdIndex());
        GPopup.createUnlockPopup(this.verseRef, keys > 0).onClose(() => {
            if (PLAYER.getKeys(area.getStrongholdIndex()) < keys) {
                // The player has used a key to unlock the door
                this.isUnlocking = true;
                area.setLockedDoorByRoom(room, this.direction, null);

                // Show floating text to indicate the key verse was used:
                PLAYER.getSprite().showFloatingText('-1 key verse', 'info');

                // Fade out the door and destroy it once fully transparent:
                GFF.AdventureContent.getSound().playSound('stronghold_open');
                GFF.AdventureContent.tweens.add({
                    targets: this,
                    alpha: 0,
                    duration: 200,
                    onComplete: () => {
                        this.destroy();
                    }
                });
            }
        });
    }
}