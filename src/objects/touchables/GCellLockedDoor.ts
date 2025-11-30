
import { GStrongholdArea } from "../../areas/GStrongholdArea";
import { GReleaseCaptiveCutscene } from "../../cutscenes/GReleaseCaptiveCutscene";
import { GRoom } from "../../GRoom";
import { GFF } from "../../main";
import { PLAYER } from "../../player";
import { SCENERY } from "../../scenery";
import { Dir9 } from "../../types";
import { GPersonSprite } from "../chars/GPersonSprite";
import { GPopup } from "../components/GPopup";
import { GTouchable } from "./GTouchable";


export class GCellLockedDoor extends GTouchable {

    private isUnlocking: boolean = false;

    constructor(x: number, y: number) {
        super(SCENERY.def('cell_locked_door'), x, y);
    }

    /**
     * The cell is guarded; it can only be unlocked when there are no enemies present.
     */
    public canTouch(): boolean {
        return !this.isUnlocking && GFF.AdventureContent.getEnemies().length === 0;
    }

    public doTouch() {
        GFF.AdventureContent.stopChars();
        PLAYER.getSprite().faceDirection(Dir9.N, true);

        const room: GRoom = GFF.AdventureContent.getCurrentRoom() as GRoom;
        const area: GStrongholdArea = room.getArea() as GStrongholdArea;
        const verseRef: string = room.getCellVerseRef()!;
        const keys = PLAYER.getKeys(area.getStrongholdIndex());
        GPopup.createUnlockPopup(verseRef, keys > 0).onClose(() => {
            if (PLAYER.getKeys(area.getStrongholdIndex()) < keys) {
                // The player has used a key to unlock the door
                this.isUnlocking = true;
                room.removePlanByKey('cell_locked_door');
                room.setPrisoner(null); // Cell is now empty; prisoner will no longer be there

                // Show floating text to indicate the key verse was used:
                PLAYER.getSprite().showFloatingText('-1 key verse', 'info');

                // Give a large grace boost for freeing the captive:
                PLAYER.giveGrace('major');

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

                // Start the cutscene to release the captive:
                const captive = GFF.AdventureContent.getPersons().find(p => p.isPrisoner()) as GPersonSprite;
                new GReleaseCaptiveCutscene(captive).play();
            }
        });
    }
}