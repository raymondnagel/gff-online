import 'phaser';
import { COLOR } from "../colors";
import { GFF } from "../main";
import { GContentScene } from "./GContentScene";

export class GGameOverContent extends GContentScene {

    constructor() {
        super("GameOverContent");
        this.setContainingMode(GFF.GAMEOVER_MODE);
    }

    public preload(): void {
    }

    public create(): void {
        GFF.setMouseVisible(false);

        this.add.rectangle(0, 0, GFF.GAME_W, GFF.GAME_H, COLOR.BLACK.num())
            .setOrigin(0, 0);

        this.add.text(GFF.GAME_W / 2, GFF.GAME_H / 2 - 36, 'THE END', {
            color: COLOR.GOLD_2.str(),
            fontFamily: 'olde',
            fontSize: '72px',
            stroke: COLOR.BLACK.str(),
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5, 0.5);

        this.add.text(GFF.GAME_W / 2, GFF.GAME_H / 2 + 52, 'The grace of our Lord Jesus Christ be with you all. Amen.', {
            color: COLOR.GOLD_1.str(),
            fontFamily: 'averia_serif',
            fontSize: '26px',
            align: 'center'
        }).setOrigin(0.5, 0.5);

        this.fadeIn(1000);
    }

    public update(): void {
    }
}
