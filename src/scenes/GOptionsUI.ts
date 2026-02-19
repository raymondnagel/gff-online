import { COLOR } from "../colors";
import { GInputMode } from "../GInputMode";
import { GFF } from "../main";
import { GCheckBox } from "../objects/components/GCheckBox";
import { GSlider } from "../objects/components/GSlider";
import { GTextButton } from "../objects/components/GTextButton";
import { REGISTRY } from "../registry";
import { GUIScene } from "./GUIScene";

const INPUT_DEFAULT: GInputMode = new GInputMode('options.default');
const PANEL_W: number = 298;
const PANEL_H: number = 576;
const PANEL_PADDING: number = 20;
const PANEL_TITLE_Y: number = 100;
const PANEL_TITLE_FONT: number = 30;
const SETTING_FONT: number = 18;
const TITLE_GAP: number = 12;
const SETTING_GAP: number = 20;
const GAMEPLAY_OFFSET_X: number = 33;
const AUDIO_OFFSET_X: number = 363;
const VIDEO_OFFSET_X: number = 693;

export class GOptionsUI extends GUIScene {

    // Gameplay settings:
    private talkSpeedSlider: GSlider;
    private battleAnimationSpeedSlider: GSlider;

    // Audio settings:
    private masterVolumeSlider: GSlider;
    private musicVolumeSlider: GSlider;
    private sfxVolumeSlider: GSlider;
    private speechVolumeSlider: GSlider;

    // Video settings:
    private fullscreenCheck: GCheckBox;

    // Reset button:
    private resetButton: GTextButton;

    constructor() {
        super("OptionsUI");

        this.setContainingMode(GFF.OPTIONS_MODE);
    }

    public preload(): void {
    }

    public create(): void {
        super.create();
        this.add.image(0, 0, 'options_subscreen_bg').setOrigin(0, 0);
        this.add.text(512, 20, 'Options', {
            color: COLOR.GREY_1.str(),
            fontFamily: 'dyonisius',
            fontSize: '48px'
        }).setOrigin(.5, 0);

        this.add.text(GAMEPLAY_OFFSET_X + (PANEL_W / 2), PANEL_TITLE_Y, 'Gameplay', {
            color: COLOR.GREY_1.str(),
            fontFamily: 'dyonisius',
            fontSize: `${PANEL_TITLE_FONT}px`
        }).setOrigin(.5, 0);

        this.add.text(AUDIO_OFFSET_X + (PANEL_W / 2), PANEL_TITLE_Y, 'Audio', {
            color: COLOR.GREY_1.str(),
            fontFamily: 'dyonisius',
            fontSize: `${PANEL_TITLE_FONT}px`
        }).setOrigin(.5, 0);

        this.add.text(VIDEO_OFFSET_X + (PANEL_W / 2), PANEL_TITLE_Y, 'Video', {
            color: COLOR.GREY_1.str(),
            fontFamily: 'dyonisius',
            fontSize: `${PANEL_TITLE_FONT}px`
        }).setOrigin(.5, 0);

        const settingsYStart: number = 156;

        this.createGameplayPanel(settingsYStart);
        this.createAudioPanel(settingsYStart);
        this.createVideoPanel(settingsYStart);
        this.createResetButton();

        this.setSubscreen();
        this.initInputMode();
    }

    private createGameplayPanel(currentY: number): void {
        // Conversation speed:
        this.add.text(GAMEPLAY_OFFSET_X + (PANEL_W / 2), currentY, 'Talk Speed', {
            color: COLOR.GREY_1.str(),
            fontFamily: 'dyonisius',
            fontSize: `${SETTING_FONT}px`
        }).setOrigin(.5, 0);
        this.talkSpeedSlider = new GSlider(this, GAMEPLAY_OFFSET_X + PANEL_PADDING, currentY + SETTING_FONT + TITLE_GAP, PANEL_W - (2 * PANEL_PADDING));
        this.talkSpeedSlider.setLabels([
            { t: 0, text: '1x' },
            { t: .33, text: '2x' },
            { t: .66, text: '3x' },
            { t: 1, text: '4x' }
        ], 'labels');
        this.add.existing(this.talkSpeedSlider);
        this.initTalkSpeed();

        // Battle animation speed:
        currentY += SETTING_FONT + TITLE_GAP + this.talkSpeedSlider.height + SETTING_GAP;
        this.add.text(GAMEPLAY_OFFSET_X + (PANEL_W / 2), currentY, 'Battle Speed', {
            color: COLOR.GREY_1.str(),
            fontFamily: 'dyonisius',
            fontSize: `${SETTING_FONT}px`
        }).setOrigin(.5, 0);
        this.battleAnimationSpeedSlider = new GSlider(this, GAMEPLAY_OFFSET_X + PANEL_PADDING, currentY + SETTING_FONT + TITLE_GAP, PANEL_W - (2 * PANEL_PADDING));
        this.battleAnimationSpeedSlider.setLabels([
            { t: 0, text: '1x' },
            { t: .33, text: '2x' },
            { t: .66, text: '3x' },
            { t: 1, text: '4x' }
        ], 'labels');
        this.add.existing(this.battleAnimationSpeedSlider);
        this.initBattleSpeed();
    }

    private createAudioPanel(currentY: number): void {
        // Master volume:
        this.add.text(AUDIO_OFFSET_X + (PANEL_W / 2), currentY, 'Master Volume', {
            color: COLOR.GREY_1.str(),
            fontFamily: 'dyonisius',
            fontSize: `${SETTING_FONT}px`
        }).setOrigin(.5, 0);
        this.masterVolumeSlider = new GSlider(this, AUDIO_OFFSET_X + PANEL_PADDING, currentY + SETTING_FONT + TITLE_GAP, PANEL_W - (2 * PANEL_PADDING));
        this.masterVolumeSlider.setLabels([
            { t: 0, text: '0%' },
            { t: .25, text: '25%' },
            { t: .5, text: '50%' },
            { t: .75, text: '75%' },
            { t: 1, text: '100%' }
        ], 'none');
        this.add.existing(this.masterVolumeSlider);
        this.initMasterVolume();

        // Music volume:
        currentY += SETTING_FONT + TITLE_GAP + this.masterVolumeSlider.height + SETTING_GAP;
        this.add.text(AUDIO_OFFSET_X + (PANEL_W / 2), currentY, 'Music Volume', {
            color: COLOR.GREY_1.str(),
            fontFamily: 'dyonisius',
            fontSize: `${SETTING_FONT}px`
        }).setOrigin(.5, 0);
        this.musicVolumeSlider = new GSlider(this, AUDIO_OFFSET_X + PANEL_PADDING, currentY + SETTING_FONT + TITLE_GAP, PANEL_W - (2 * PANEL_PADDING));
        this.musicVolumeSlider.setLabels([
            { t: 0, text: '0%' },
            { t: .25, text: '25%' },
            { t: .5, text: '50%' },
            { t: .75, text: '75%' },
            { t: 1, text: '100%' }
        ], 'none');
        this.add.existing(this.musicVolumeSlider);
        this.initMusicVolume();

        // Sound effects volume:
        currentY += SETTING_FONT + TITLE_GAP + this.musicVolumeSlider.height + SETTING_GAP;
        this.add.text(AUDIO_OFFSET_X + (PANEL_W / 2), currentY, 'Sound FX Volume', {
            color: COLOR.GREY_1.str(),
            fontFamily: 'dyonisius',
            fontSize: `${SETTING_FONT}px`
        }).setOrigin(.5, 0);
        this.sfxVolumeSlider = new GSlider(this, AUDIO_OFFSET_X + PANEL_PADDING, currentY + SETTING_FONT + TITLE_GAP, PANEL_W - (2 * PANEL_PADDING));
        this.sfxVolumeSlider.setLabels([
            { t: 0, text: '0%' },
            { t: .25, text: '25%' },
            { t: .5, text: '50%' },
            { t: .75, text: '75%' },
            { t: 1, text: '100%' }
        ], 'none');
        this.add.existing(this.sfxVolumeSlider);
        this.initSfxVolume();

        // Speech volume:
        currentY += SETTING_FONT + TITLE_GAP + this.sfxVolumeSlider.height + SETTING_GAP;
        this.add.text(AUDIO_OFFSET_X + (PANEL_W / 2), currentY, 'Speech Volume', {
            color: COLOR.GREY_1.str(),
            fontFamily: 'dyonisius',
            fontSize: `${SETTING_FONT}px`
        }).setOrigin(.5, 0);
        this.speechVolumeSlider = new GSlider(this, AUDIO_OFFSET_X + PANEL_PADDING, currentY + SETTING_FONT + TITLE_GAP, PANEL_W - (2 * PANEL_PADDING));
        this.speechVolumeSlider.setLabels([
            { t: 0, text: '0%' },
            { t: .25, text: '25%' },
            { t: .5, text: '50%' },
            { t: .75, text: '75%' },
            { t: 1, text: '100%' }
        ], 'none');
        this.add.existing(this.speechVolumeSlider);
        this.initSpeechVolume();
    }

    private createVideoPanel(currentY: number): void {
        // Fullscreen:
        const currentState: boolean = GFF.GAME.scale.isFullscreen;
        this.fullscreenCheck = new GCheckBox(this, VIDEO_OFFSET_X + PANEL_PADDING, currentY, ' Full Screen', currentState, true, (_label: string, check: boolean) => {
            this.fullscreenCheck.setCheckState(check);
            if (check) {
                GFF.GAME.scale.startFullscreen();
            } else {
                GFF.GAME.scale.stopFullscreen();
            }
        });
        this.fullscreenCheck.setColorScheme(COLOR.GREY_1, COLOR.GREY_2, COLOR.GREY_3);
        this.add.existing(this.fullscreenCheck);
    }

    private createResetButton(): void {
        this.resetButton = new GTextButton(this, 0, 0, 'Reset to Defaults', () => {
            this.talkSpeedSlider.setT(0, false);
            this.talkSpeedSlider.simEvent('commit');

            this.battleAnimationSpeedSlider.setT(0, false);
            this.battleAnimationSpeedSlider.simEvent('commit');

            this.masterVolumeSlider.setT(1, false);
            this.masterVolumeSlider.simEvent('change');

            this.musicVolumeSlider.setT(.8, false);
            this.musicVolumeSlider.simEvent('change');

            this.sfxVolumeSlider.setT(.9, false);
            this.sfxVolumeSlider.simEvent('commit');

            this.speechVolumeSlider.setT(.6, false);
            this.speechVolumeSlider.simEvent('commit');
        });
        this.resetButton.setPosition(GAMEPLAY_OFFSET_X + PANEL_PADDING, 614);
    }

    private initInputMode() {
        INPUT_DEFAULT.onKeyDown((keyEvent) => {
            this.sendPotentialHotkey(keyEvent);
        });
        INPUT_DEFAULT.addAllowedEvent('MOUSE_UI_BUTTON');
        this.setInputMode(INPUT_DEFAULT);
    }

    private initTalkSpeed() {
        // Set initial slider value from registry:
        const realTalkSpeed = REGISTRY.getNumber('talkSpeed');
        const t = (realTalkSpeed - 1) / 3;
        this.talkSpeedSlider.setT(t, false);
        // Set up callback to update registry when slider changes:
        this.talkSpeedSlider.setOnCommit((newT) => {
            const newTalkSpeed = 1 + (newT * 3);
            REGISTRY.set('talkSpeed', newTalkSpeed);
        });
    }

    private initBattleSpeed() {
        // Set initial slider value from registry:
        const realBattleSpeed = REGISTRY.getNumber('battleSpeed');
        const t = (realBattleSpeed - 1) / 3;
        this.battleAnimationSpeedSlider.setT(t, false);
        // Set up callback to update registry when slider changes:
        this.battleAnimationSpeedSlider.setOnCommit((newT) => {
            const newBattleSpeed = 1 + (newT * 3);
            REGISTRY.set('battleSpeed', newBattleSpeed);
        });
    }

    private initMasterVolume() {
        // Set initial slider value from registry:
        const masterVolume = REGISTRY.getNumber('masterVolume');
        this.masterVolumeSlider.setT(masterVolume, false);
        // Set up callback to update registry when slider changes:
        this.masterVolumeSlider.setOnChange((newT) => {
            REGISTRY.set('masterVolume', newT);
            // Force currently playing music to update immediately with global (registry) volume:
            const soundManager = GFF.AdventureContent.getSound();
            soundManager.setMusicVolume(soundManager.getMusicVolume());
        });
    }

    private initMusicVolume() {
        // Set initial slider value from registry:
        const musicVolume = REGISTRY.getNumber('musicVolume');
        this.musicVolumeSlider.setT(musicVolume, false);
        // Set up callback to update registry when slider changes:
        this.musicVolumeSlider.setOnChange((newT) => {
            REGISTRY.set('musicVolume', newT);
            // Force currently playing music to update immediately with global (registry) volume:
            const soundManager = GFF.AdventureContent.getSound();
            soundManager.setMusicVolume(soundManager.getMusicVolume());
        });
    }

    private initSfxVolume() {
        // Set initial slider value from registry:
        const sfxVolume = REGISTRY.getNumber('sfxVolume');
        this.sfxVolumeSlider.setT(sfxVolume, false);
        // Set up callback to update registry when slider changes:
        this.sfxVolumeSlider.setOnCommit((newT) => {
            REGISTRY.set('sfxVolume', newT);
            // Play a test sound to demonstrate new volume level:
            const soundManager = GFF.AdventureContent.getSound();
            soundManager.playSound('success');
        });
    }

    private initSpeechVolume() {
        // Set initial slider value from registry:
        const speechVolume = REGISTRY.getNumber('speechVolume');
        this.speechVolumeSlider.setT(speechVolume, false);
        // Set up callback to update registry when slider changes:
        this.speechVolumeSlider.setOnCommit((newT) => {
            REGISTRY.set('speechVolume', newT);
            // Play a test sound to demonstrate new volume level:
            const soundManager = GFF.AdventureContent.getSound();
            soundManager.playSpeech('adam_voice');
        });
    }
}