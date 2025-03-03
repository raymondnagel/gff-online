import { COLOR } from "../colors";
import { GInputMode } from "../GInputMode";
import { GFF } from "../main";
import { GUIScene } from "./GUIScene";

const INPUT_DEFAULT: GInputMode = new GInputMode('options.default');

export class GOptionsUI extends GUIScene {

    constructor() {
        super("OptionsUI");

        this.setContainingMode(GFF.OPTIONS_MODE);
    }

    public preload(): void {
    }

    public create(): void {
        super.create();
        this.add.image(0, 0, 'rock_bg').setOrigin(0, 0);
        this.add.text(512, 20, 'Options', {
            color: COLOR.GREY_1.str(),
            fontFamily: 'dyonisius',
            fontSize: '48px'
        }).setOrigin(.5, 0);

        this.setSubscreen();
        this.initInputMode();
        //this.createTileGuidelines();
    }

    private initInputMode() {
        INPUT_DEFAULT.onKeyDown((keyEvent) => {
            if (keyEvent.key === 'd') {
                if (GFF.debugMode) {
                    this.getSound().playSound('debug_off');
                } else {
                    this.getSound().playSound('debug_on');
                }
                GFF.debugMode = !GFF.debugMode;
            }
            this.sendPotentialHotkey(keyEvent);
        });
        INPUT_DEFAULT.addAllowedEvent('MOUSE_UI_BUTTON');
        this.setInputMode(INPUT_DEFAULT);
    }
}