import 'phaser';
import { GPersonSprite } from '../objects/chars/GPersonSprite';
import { GFF } from '../main';
import { GBaseScene } from './GBaseScene';
import { GImpSprite } from '../objects/chars/GImpSprite';

const LOAD_COLOR: number     = 0xffffff;
const PROGRESS_COLOR: number = 0x00c220;

export class GLoadingScene extends GBaseScene {
    private loadBar: Phaser.GameObjects.Graphics;
    private progressBar: Phaser.GameObjects.Graphics;
    private progressText: Phaser.GameObjects.Text;
    private playButton: Phaser.GameObjects.Image;

    constructor() {
        super("LoadingScene");
    }

    public preload(): void {
        this.setRegistry();
        this.createObjects();
        this.setLoadEvents();
        this.load.json('json-manifest', 'assets/json-manifest.json');
        this.load.json('image-manifest', 'assets/image-manifest.json');
        this.load.json('sprite-manifest', 'assets/sprite-manifest.json');
        this.load.json('audio-manifest', 'assets/audio-manifest.json');
        this.load.xml('kjv', 'assets/xml/kjv.xml');
        this.load.glsl('grayscale', 'assets/shaders/grayscale.frag');
    }

    private createObjects() {
        this.loadBar = this.add.graphics();
        this.loadBar.fillStyle(LOAD_COLOR, 1);
        this.loadBar.fillRect(
            this.cameras.main.width / 4 - 2,
            this.cameras.main.height / 2 - 30,
            this.cameras.main.width / 2 + 4,
            60
        );
        this.progressBar = this.add.graphics();
        this.progressText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'Loading: 0%',
            { fontFamily: 'Arial', fontSize: 24, color: '#000000' }
        );
        this.progressText.setX((this.cameras.main.width / 2) - (this.progressText.width / 2));
        this.progressText.setY((this.cameras.main.height / 2) - (this.progressText.height / 2));
    }

    private setLoadEvents() {
        const thisScene: GLoadingScene = this;
        this.load.on(
            'progress',
            function (value: number) {
                if (value > 0) {
                    thisScene.data.set('inProgress', 'true');
                }
                thisScene.progressBar.clear();
                thisScene.progressBar.fillStyle(PROGRESS_COLOR, 1);
                thisScene.progressBar.fillRect(
                    thisScene.cameras.main.width / 4,
                    thisScene.cameras.main.height / 2 - 28,
                    (thisScene.cameras.main.width / 2) * value,
                    56
                );
                thisScene.progressText.setText(`Loading: ${Math.floor(value * 100)}%`);
                thisScene.progressText.setX(
                    (thisScene.cameras.main.width / 2) - (thisScene.progressText.width / 2)
                );
                thisScene.progressText.setY(
                    (thisScene.cameras.main.height / 2) - (thisScene.progressText.height / 2)
                );
            },
            this
        );
        this.load.on(
            'complete',
            () => {
                thisScene.data.inc('completions');
                if (thisScene.data.get('completions') !== 2) {
                    return;
                }
                thisScene.loadBar.visible = false;
                thisScene.progressBar.visible = false;
                thisScene.progressText.visible = false;

                thisScene.playButton = thisScene.add.image(
                    this.cameras.main.width / 2,
                    this.cameras.main.height / 2,
                    'initial_play'
                ).setInteractive();

                // Create the people:
                GPersonSprite.createAllPeople();

                // Create the imps:
                GImpSprite.createAllImps();

                // Add a listener for the mouse leaving the game canvas:
                GFF.GAME.canvas.addEventListener('mouseleave', () => {
                    GFF.GAME.scene.getScenes().forEach(s => {
                        if ('exitAllButtons' in s) {
                            (s.exitAllButtons as Function)();
                        }
                    });
                });

                thisScene.playButton.on('pointerdown', function (_pointer: any)
                {
                    // The loading scene is unique in that it is not part of a mode,
                    // therefore there is no mode to switch from when we move on:
                    thisScene.scene.remove();
                    GFF.TITLE_MODE.switchTo();
                });
            },
            this
        );
    }

    private loadFonts() {
    }

    private loadJsons() {
        // Loop through the json-manifest and load each JSON file
        const jsonManifest: string[] = this.cache.json.get('json-manifest') as string[];
        jsonManifest.forEach(file => {
            const key = file.replace(/\.[^/.]+$/, "").split('/').pop() as string;
            this.load.json(key, 'assets/' + file);
        });
    }

    private loadImages() {
        // Loop through the image-manifest and load each image
        const imageManifest: string[] = this.cache.json.get('image-manifest') as string[];
        imageManifest.forEach(file => {
            const key = file.replace(/\.[^/.]+$/, "").split('/').pop() as string;
            this.load.image(key, 'assets/' + file);
        });
    }

    private loadSpritesheets() {
        // Loop through the sprite-manifest and load each spritesheet
        const spriteManifest: string[] = this.cache.json.get('sprite-manifest') as string[];
        spriteManifest.forEach(file => {
            const key = file.replace(/\.[^/.]+$/, "").split('/').pop() as string;
            if (file.includes('/chars/')) {
                this.load.spritesheet(
                    key,
                    'assets/' + file,
                    {frameWidth: GFF.CHAR_W, frameHeight: GFF.CHAR_H}
                );
            } else {
                // For non-char sprites, we embded the frame dimension in the filename:
                // e.g. "campfire-112x150.png"
                let spriteData: string[] = key.split('-');
                let frameDim: string[] = spriteData[1].split('x');
                this.load.spritesheet(
                    spriteData[0],
                    'assets/' + file,
                    {frameWidth: parseInt(frameDim[0]), frameHeight: parseInt(frameDim[1])}
                );
            }
        });
    }

    private loadAudios() {
        // Loop through the audio-manifest and load each audio
        const audioManifest: string[] = this.cache.json.get('audio-manifest') as string[];
        audioManifest.forEach(file => {
            const key = file.replace(/\.[^/.]+$/, "").split('/').pop() as string;
            this.load.audio(key, 'assets/' + file);
        });
    }

    private setRegistry() {
        this.registry.set('gameName', 'The Good Fight of Faith');
        this.registry.set('walkSpeed', 150); // Doubled for running
    }

    public create(): void {
        this.loadJsons();
        this.loadFonts();
        this.loadImages();
        this.loadSpritesheets();
        this.loadAudios();

        // Start loading the assets:
        this.load.start();
    }
}