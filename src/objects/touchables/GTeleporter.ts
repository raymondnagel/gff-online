import { GStrongholdArea } from "../../areas/GStrongholdArea";
import { DEPTH } from "../../depths";
import { EFFECTS } from "../../effects";
import { GFF } from "../../main";
import { PLAYER } from "../../player";
import { SCENERY } from "../../scenery";
import { GPopup } from "../components/GPopup";
import { GTouchable } from "./GTouchable";

export class GTeleporter extends GTouchable {

    constructor(x: number, y: number) {
        const telDef = SCENERY.def('teleporter');
        super(telDef, x, y);
        this.setOrigin(0, 0);
        EFFECTS.doEffect('teleport_aura', GFF.AdventureContent, x + this.width / 2, y + this.height, 0.5, 1).setDepth(this.getBottomCenter().y);
    }

    public canTouch(): boolean {
        return true
    }

    public doTouch() {
        const strongholdName = GFF.AdventureContent.getCurrentArea().getName();
        GPopup.createChoicePopup(`Do you want to leave the ${strongholdName}?`, 'Exit Stronghold', [
            {option: 'Yes', hotkey: 'y', action: () => {
                GFF.AdventureContent.getSound().playSound('dispel');
                GFF.AdventureContent.tweens.add({
                    targets: PLAYER.getSprite(),
                    alpha: 0,
                    duration: 500,
                });
                // After half a second, exit the stronghold.
                GFF.AdventureContent.time.delayedCall(500, () => {
                    GFF.AdventureContent.forceAdventureInputMode();
                    GFF.AdventureContent.playerExitBuilding((GFF.AdventureContent.getCurrentArea() as GStrongholdArea).getEntranceRoom().getPortalRoom());
                });
            }},
            {option: 'No', hotkey: 'n', action: () => {}}
        ]);
    }

}