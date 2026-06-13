import 'phaser';
import { COLOR } from "../colors";
import { GCreditsMode } from "../game_modes/GCreditsMode";
import { GFF } from "../main";
import { GContentScene } from "./GContentScene";

type CreditBlock = {
    title?: string;
    lines: string[];
};

const TITLE_Y: number = 64;
const CREDITS_FADE_DEPTH: number = 1000;
const CREDITS_TITLE_DEPTH: number = CREDITS_FADE_DEPTH + 1;
const CREDITS_TEXT_DEPTH: number = 100;
const CREDITS_FONT_SIZE: string = '36px';
const CREDITS_SMALL_FONT_SIZE: string = '28px';
const CREDITS_SCROLL_SPEED: number = 70;
const CREDITS_START_Y: number = 840;
const CREDITS_LINE_GAP: number = 8;
const CREDITS_BLOCK_GAP: number = 252;
const CREDITS_WRAP_W: number = 920;
const CREDITS_MEMORIAL_WRAP_W: number = 1000;
const CREDITS_SKIP_ENABLE_TIME: number = 5000;

const CREDIT_BLOCKS: CreditBlock[] = [
    {
        title: `All glory and praise:`,
        lines: [
            `To the Lamb that was slain,`,
            `Who has borne all our sins,`,
            `And has cleansed every stain.`,
            `Hallelujah! Thine the glory!`,
            `Hallelujah! Amen!`,
        ]
    },
    {
        title: `Game Design:`,
        lines: [
            `Raymond Nagel`,
        ],
    },
    {
        title: `Inspiration:`,
        lines: [
            `Jonathan Fundudis`,
        ],
    },
    {
        title: `Main Character Inspiration:`,
        lines: [
            `Adam Cesar`,
        ],
    },
    {
        title: `Game Programming:`,
        lines: [
            `Raymond Nagel`,
        ],
    },
    {
        title: `Graphics Design:`,
        lines: [
            `Raymond Nagel`,
        ],
    },
    {
        title: `Sermon Content:`,
        lines: [
            `Raymond Nagel`,
            `Adam Cesar`,
        ],
    },
    {
        title: `Music:`,
        lines: [
            `Raymond Nagel`,
            `Adam Cesar`,
        ],
    },
    {
        title: `Sound Mixing:`,
        lines: [
            `Raymond Nagel`,
            `(original sounds from Freesound.org via GPL)`,
        ],
    },
    {
        title: `Logo Design:`,
        lines: [
            `Jonathan Fundudis`,
        ],
    },
    {
        title: `Website Design:`,
        lines: [
            `Jonathan Fundudis`,
            `Maryellen Archambault`,
        ],
    },
    {
        title: `Website Construction:`,
        lines: [
            `Maryellen Archambault`,
        ],
    },
    {
        title: `Testing & Feedback:`,
        lines: [
            `Adam Cesar`,
            `Adelaide Cesar`,
            `Hudson Cesar`,
            `Kevin Rickner`,
        ],
    },
    {
        title: `AI Assistance:`,
        lines: [
            `"Cherry" (ChatGPT)`,
            `"Mira" (Codex)`,
        ],
    },
    {
        title: `Character Graphics built using:`,
        lines: [
            `8D Character Creator`,
        ],
    },
    {
        lines: [
            `In Loving Memory of Sister Kate Decker, our most enthusiastic supporter,`,
            `who went before us into the presence of the Lord Jesus.`,
        ]
    }
];

export class GCreditsContent extends GContentScene {

    private creditsContainer?: Phaser.GameObjects.Container;
    private creditsBottomY: number = 0;
    private creditsFinished: boolean = false;
    private creditsScrollDone: boolean = false;
    private creditsMusicDone: boolean = false;
    private creditsMusicShouldContinue: boolean = false;
    private canSkipCredits: boolean = false;

    constructor() {
        super("CreditsContent");
        this.setContainingMode(GFF.CREDITS_MODE);
    }

    public preload(): void {
    }

    public create(): void {
        this.creditsContainer?.destroy(true);
        this.creditsContainer = undefined;
        this.creditsBottomY = 0;
        this.creditsFinished = false;
        this.creditsScrollDone = false;
        this.creditsMusicDone = false;
        this.creditsMusicShouldContinue = false;
        this.canSkipCredits = false;

        GFF.setMouseVisible(false);

        this.add.rectangle(0, 0, GFF.GAME_W, GFF.GAME_H, COLOR.BLACK.num())
            .setOrigin(0, 0);

        this.add.image(0, 0, 'credits_fade')
            .setOrigin(0, 0)
            .setDepth(CREDITS_FADE_DEPTH);

        this.add.text(GFF.GAME_W / 2, TITLE_Y, 'CREDITS', {
            color: COLOR.GOLD_2.str(),
            fontFamily: 'dyonisius',
            fontSize: '72px',
            stroke: COLOR.BLACK.str(),
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5, 0.5).setDepth(CREDITS_TITLE_DEPTH);

        this.createCreditTexts();
        this.startCreditsMusic();

        this.fadeIn(1000);

        this.input.keyboard?.removeAllListeners('keydown-ENTER');
        this.input.keyboard?.on('keydown-ENTER', this.trySkipCredits, this);
    }

    private startCreditsMusic(): void {
        this.creditsMusicShouldContinue = true;
        this.creditsMusicDone = false;
        this.playCreditsMusicOnce();

        this.time.delayedCall(CREDITS_SKIP_ENABLE_TIME, () => {
            this.canSkipCredits = true;
        });
    }

    private playCreditsMusicOnce(): void {
        const music = this.getSound().playMusic('revive_us', undefined, false);
        music.once('complete', () => {
            if (this.creditsMusicShouldContinue && !this.creditsScrollDone && !this.creditsFinished) {
                this.playCreditsMusicOnce();
                return;
            }

            this.creditsMusicShouldContinue = false;
            this.creditsMusicDone = true;
            this.finishCreditsIfReady();
        });
    }

    private createCreditTexts(): void {
        this.creditsContainer = this.add.container(0, CREDITS_START_Y)
            .setDepth(CREDITS_TEXT_DEPTH);

        let y = 0;
        CREDIT_BLOCKS.forEach((block, blockIndex) => {
            const isLastBlock = blockIndex === CREDIT_BLOCKS.length - 1;
            const fontSize = isLastBlock ? CREDITS_SMALL_FONT_SIZE : CREDITS_FONT_SIZE;
            const wrapWidth = isLastBlock ? CREDITS_MEMORIAL_WRAP_W : CREDITS_WRAP_W;

            if (block.title) {
                const title = this.add.text(GFF.GAME_W / 2, y, block.title, {
                    color: COLOR.GOLD_2.str(),
                    fontFamily: 'dyonisius',
                    fontSize,
                    align: 'center',
                    wordWrap: { width: wrapWidth },
                }).setOrigin(0.5, 0)
                    .setShadow(2, 2, COLOR.GOLD_4.str(), 2, false, true);

                this.creditsContainer?.add(title);
                y += title.height + CREDITS_LINE_GAP;
            }

            block.lines.forEach((line) => {
                const lineText = this.add.text(GFF.GAME_W / 2, y, line, {
                    color: COLOR.WHITE.str(),
                    fontFamily: 'dyonisius',
                    fontSize,
                    align: 'center',
                    wordWrap: { width: wrapWidth },
                }).setOrigin(0.5, 0)
                    .setShadow(2, 2, COLOR.GOLD_2.str(), 2, false, true);

                this.creditsContainer?.add(lineText);
                y += lineText.height + CREDITS_LINE_GAP;
            });

            y += CREDITS_BLOCK_GAP;
        });

        this.creditsBottomY = y;
    }

    private finishCredits(): void {
        if (this.creditsFinished) return;
        this.creditsFinished = true;
        this.creditsMusicShouldContinue = false;
        this.input.keyboard?.off('keydown-ENTER', this.trySkipCredits, this);
        this.getSound().fadeOutMusic(1000);

        this.fadeOut(1000, undefined, () => {
            const creditsMode = GFF.CREDITS_MODE as GCreditsMode;
            switch (creditsMode.getExitDestination()) {
                case 'gameOver':
                    GFF.GAMEOVER_MODE.switchTo(GFF.CREDITS_MODE);
                    break;
                case 'mainMenu':
                    GFF.MAINMENU_MODE.switchTo(GFF.CREDITS_MODE);
                    break;
            }
        });
    }

    private trySkipCredits(): void {
        if (this.canSkipCredits) {
            this.finishCredits();
        }
    }

    private finishCreditsIfReady(): void {
        if (this.creditsScrollDone && this.creditsMusicDone) {
            this.finishCredits();
        }
    }

    public update(_time: number, delta: number): void {
        if (!this.creditsContainer || this.creditsFinished) return;

        if (!this.creditsScrollDone) {
            this.creditsContainer.y -= CREDITS_SCROLL_SPEED * (delta / 1000);
            if (this.creditsContainer.y + this.creditsBottomY < 0) {
                this.creditsScrollDone = true;
                this.creditsMusicShouldContinue = false;
                this.finishCreditsIfReady();
            }
        }
    }
}
