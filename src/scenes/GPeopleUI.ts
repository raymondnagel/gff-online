import { COLOR } from "../colors";
import { GInputMode } from "../GInputMode";
import { GFF } from "../main";
import { GUIScene } from "./GUIScene";

const INPUT_DEFAULT: GInputMode = new GInputMode('people.default');

export class GPeopleUI extends GUIScene {

    constructor() {
        super("PeopleUI");

        this.setContainingMode(GFF.PEOPLE_MODE);
    }

    public preload(): void {
    }

    public create(): void {
        super.create();
        this.add.image(0, 0, 'rock_bg').setOrigin(0, 0);
        this.add.text(512, 20, 'People', {
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
            this.sendPotentialHotkey(keyEvent);
        });
        INPUT_DEFAULT.addAllowedEvent('MOUSE_UI_BUTTON');
        this.setInputMode(INPUT_DEFAULT);
    }
}