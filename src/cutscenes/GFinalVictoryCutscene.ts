import { AREA } from "../area";
import { COLOR, GColor } from "../colors";
import { DEPTH } from "../depths";
import { GRoom } from "../GRoom";
import { GFF } from "../main";
import { GSerpentSprite } from "../objects/chars/GSerpentSprite";
import { PEOPLE } from "../people";
import { PLAYER } from "../player";
import { REGISTRY } from "../registry";
import { Dir9, GPerson, GPoint2D, GSceneryPlan } from "../types";
import { GCutscene } from "./GCutscene";

type CongregationSlot = {
    point: GPoint2D
};

const SERPENT_TRANSFORM_ANIM: string = 'serpent_transform';
const SERPENT_TOP_LEFT_X_OFFSET: number = 31;
const SERPENT_TOP_LEFT_Y_OFFSET: number = 22;
const SERPENT_WIDTH: number = 40;
const SERPENT_HEIGHT: number = 85;
const TITLE_DEPTH: number = DEPTH.FLOAT_TEXT + 200;
const WHITE_SCREEN_TEXT_DEPTH: number = DEPTH.TRANSITION + 1;
const FINAL_SCENE_DEPTH: number = DEPTH.BACKGROUND;
const THE_LAMB_DEPTH: number = DEPTH.SPECIAL_EFFECT;
const SHINING_BURST_DEPTH: number = THE_LAMB_DEPTH + 1;
const RAINBOW_SPARKLE_DEPTH: number = SHINING_BURST_DEPTH + 2;
const THE_LAMB_X: number = 512;
const THE_LAMB_Y: number = 324;
const HEAVEN_CONGREGATION_BODY_WIDTH: number = 36;
const HEAVEN_CONGREGATION_BODY_HEIGHT: number = 16;
const HEAVEN_CONGREGATION_ZONE = {
    x: 152,
    y: 560,
    width: 720,
    height: 120
};
const HEAVEN_CONGREGATION_TARGET_ASPECT: number = 4.5;
const HEAVEN_CONGREGATION_MIN_HORZ_SPACE: number = HEAVEN_CONGREGATION_BODY_WIDTH;
const HEAVEN_CONGREGATION_MIN_VERT_SPACE: number = 20;
const HEAVEN_CONGREGATION_MAX_HORZ_SPACE: number = 90;
const HEAVEN_CONGREGATION_MAX_VERT_SPACE: number = 42;
const HEAVEN_PROCESSION_SPAWN_PT: GPoint2D = { x: 512, y: 800 };
const HEAVEN_PROCESSION_STAGGER: number = 350;
const RAINBOW_SPARKLE_MASK_KEY: string = 'rainbow_sparkle_mask';
const RAINBOW_SPARKLE_KEY: string = 'emerald_sparkle';
const RAINBOW_SPARKLE_SAMPLE_RATE: number = 1;
const TITLE_LINE_HEIGHT: number = 64;
const RESURRECTION_TEXT_LINE_HEIGHT: number = 52;
const PLAYER_REJOICE_PARTIAL_ANIM: string = 'adam_soldier_rejoice_s_partial';
const RESURRECTION_GLOW_KEY: string = 'adam_resurrection_glow';
const RESURRECTION_GLOW_X_OFFSET: number = -3;
const RESURRECTION_GLOW_Y_OFFSET: number = -2;
const STONE_DIAMETER: number = 154;
const STONE_RADIUS: number = STONE_DIAMETER / 2;
const CAVE_HEIGHT: number = 260;
const CAVE_CENTER_X: number = 260;
const EARTHQUAKE_RAMP_UP_TIME: number = 2000;
const EARTHQUAKE_PEAK_TIME: number = 3000;
const EARTHQUAKE_RAMP_DOWN_TIME: number = 3000;
const EARTHQUAKE_MAX_SHAKE: number = 8;
const STONE_SHAKE_TIME: number = 2000;
const STONE_SHAKE_INTENSITY: number = 4;
const STONE_ROLL_DISTANCE: number = 130;
const RESURRECTION_TEXTS: { text: string, holdTime: number }[] = [
    {
        text: 'So when this corruptible shall have put on\nincorruption, and this mortal shall have put\non immortality, then shall be brought to pass\nthe saying that is written...',
        holdTime: 12000
    },
    {
        text: 'Death is swallowed up in victory!',
        holdTime: 7000
    },
    {
        text: 'For the wages of sin is death;\nbut the gift of God is eternal life\nthrough Jesus Christ our Lord.',
        holdTime: 10000
    },
    {
        text: 'For if we have been planted together in the\nlikeness of his death, we shall be also in the\nlikeness of his resurrection.',
        holdTime: 11000
    },
    {
        text: 'If we suffer, we shall also reign with him...',
        holdTime: 7000
    }
];

/**
 * This cutscene begins after Adam defeats the Dragon.
 * The cave room is still loaded in Adventure mode, so this picks up from
 * the same room state that led into the Dragon battle.
 */
export class GFinalVictoryCutscene extends GCutscene {

    private rollingStone: Phaser.GameObjects.Image;
    private rollingStoneLight: Phaser.GameObjects.Image;
    private rainbowSparklePoints: GPoint2D[] = [];

    constructor() {
        super('final victory cutscene', true);
    }

    private getDragonImage(): Phaser.GameObjects.Image {
        return GFF.AdventureContent.children.list.find(gameObject =>
            gameObject instanceof Phaser.GameObjects.Image &&
            gameObject.texture.key === 'dragon_char'
        ) as Phaser.GameObjects.Image;
    }

    private transformDragonToSerpent(): void {
        const advScene = GFF.AdventureContent;
        const dragonImage = this.getDragonImage();
        const dragonTopLeft = dragonImage.getTopLeft();

        advScene.sound.play('lucifer_morph');

        if (!advScene.anims.exists(SERPENT_TRANSFORM_ANIM)) {
            advScene.anims.create({
                key: SERPENT_TRANSFORM_ANIM,
                frames: advScene.anims.generateFrameNumbers(SERPENT_TRANSFORM_ANIM),
                frameRate: 8
            });
        }

        const morphSprite = advScene.add.sprite(
            dragonTopLeft.x,
            dragonTopLeft.y,
            SERPENT_TRANSFORM_ANIM,
            0
        )
            .setOrigin(0, 0)
            .setDepth(dragonImage.depth + 2)
            .setAlpha(0);

        advScene.tweens.add({
            targets: morphSprite,
            alpha: 1,
            duration: 1000,
            ease: 'Linear',
            onComplete: () => {
                dragonImage.setVisible(false);
                morphSprite.play(SERPENT_TRANSFORM_ANIM);
            }
        });

        morphSprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            const serpent = new GSerpentSprite(
                dragonTopLeft.x + SERPENT_TOP_LEFT_X_OFFSET + (SERPENT_WIDTH / 2),
                dragonTopLeft.y + SERPENT_TOP_LEFT_Y_OFFSET + (SERPENT_HEIGHT / 2)
            );
            serpent.setDepth(dragonImage.depth + 1);
            this.registry.set('serpentSprite', serpent);

            advScene.tweens.add({
                targets: morphSprite,
                alpha: 0,
                duration: 1000,
                ease: 'Linear',
                onComplete: () => {
                    morphSprite.destroy();
                    this.registry.set('serpentTransformDone', true);
                }
            });
        });
    }

    private showVictoryTitle(text: string, y: number): void {
        const titleObjects = this.createTitleTextLines(text, y, '72px', TITLE_DEPTH, TITLE_LINE_HEIGHT);
        GFF.AdventureContent.tweens.add({
            targets: titleObjects,
            alpha: 1,
            duration: 1500
        });
    }

    private createTitleTextLines(
        text: string,
        centerY: number,
        fontSize: string,
        depth: number,
        lineHeight: number,
        foregroundStrokeThickness: number = 6,
        haloStrokeThickness: number = 14,
        haloShadowBlur: number = 18,
        foregroundColor: GColor = COLOR.GOLD_5,
        edgeColor: GColor = COLOR.BLACK
    ): Phaser.GameObjects.Text[] {
        const textObjects: Phaser.GameObjects.Text[] = [];
        const lines = text.split('\n');
        const startY = centerY - (((lines.length - 1) * lineHeight) / 2);

        lines.forEach((line, index) => {
            const y = startY + (index * lineHeight);
            const halo = GFF.AdventureContent.add.text(512, y, line, {
                fontFamily: 'olde',
                fontSize,
                color: edgeColor.str(),
                stroke: edgeColor.str(),
                strokeThickness: haloStrokeThickness,
                align: 'center'
            }).setOrigin(0.5).setDepth(depth - 1).setAlpha(0).setShadow(0, 0, edgeColor.str(), haloShadowBlur, true, true).setPadding({
                left: 60,
                right: 60,
                top: 40,
                bottom: 40
            });
            const title = GFF.AdventureContent.add.text(512, y, line, {
                fontFamily: 'olde',
                fontSize,
                color: foregroundColor.str(),
                stroke: edgeColor.str(),
                strokeThickness: foregroundStrokeThickness,
                align: 'center'
            }).setOrigin(0.5).setDepth(depth).setAlpha(0).setPadding({
                left: 20,
                right: 20,
                top: 0,
                bottom: 0
            });

            textObjects.push(halo, title);
        });

        return textObjects;
    }

    private placeStoneAtCaveEntrance(): void {
        const advScene = GFF.AdventureContent;
        const cavePlan = advScene.getCurrentRoom()!.getPlanByKey('cave_entrance') as GSceneryPlan;

        const stoneX = cavePlan.x + CAVE_CENTER_X;
        const stoneY = cavePlan.y + CAVE_HEIGHT - STONE_RADIUS;
        this.rollingStone = advScene.add.image(stoneX, stoneY, 'unlit_rolling_stone')
            .setOrigin(0.5, 0.5)
            .setDepth(DEPTH.SPECIAL_EFFECT);

        this.rollingStoneLight = advScene.add.image(stoneX, stoneY, 'rolling_stone_lighting')
            .setOrigin(0.5, 0.5)
            .setDepth(DEPTH.SPECIAL_EFFECT + 1);
    }

    private placePlayerBehindStone(): void {
        const cavePlan = GFF.AdventureContent.getCurrentRoom()!.getPlanByKey('cave_entrance') as GSceneryPlan;
        const player = PLAYER.getSprite();

        player.centerPhysically({
            x: cavePlan.x + CAVE_CENTER_X,
            y: cavePlan.y + CAVE_HEIGHT - 26
        });
        player.setUseAutoDepth(false);
        player.setImmobile(true);
        player.setDepth(DEPTH.OH_DECOR);
        player.faceDirection(Dir9.S, true);
        player.play('adam_soldier_pause_se');
        player.getBody().setEnable(false);
    }

    private startEarthquake(): void {
        const advScene = GFF.AdventureContent;
        const camera = advScene.cameras.main;
        const baseX = camera.x;
        const baseY = camera.y;
        const totalTime = EARTHQUAKE_RAMP_UP_TIME + EARTHQUAKE_PEAK_TIME + EARTHQUAKE_RAMP_DOWN_TIME;
        let elapsed = 0;

        const sound = advScene.getSound();
        sound.playSound('earthquake');
        advScene.time.delayedCall(1500, () => {
            sound.playJingle('adam_res', undefined, 1000);
        });

        const shakeTimer = advScene.time.addEvent({
            delay: 16,
            loop: true,
            callback: () => {
                elapsed += 16;

                let intensityRatio: number;
                if (elapsed <= EARTHQUAKE_RAMP_UP_TIME) {
                    intensityRatio = elapsed / EARTHQUAKE_RAMP_UP_TIME;
                } else if (elapsed <= EARTHQUAKE_RAMP_UP_TIME + EARTHQUAKE_PEAK_TIME) {
                    intensityRatio = 1;
                } else {
                    const rampDownElapsed = elapsed - EARTHQUAKE_RAMP_UP_TIME - EARTHQUAKE_PEAK_TIME;
                    intensityRatio = 1 - (rampDownElapsed / EARTHQUAKE_RAMP_DOWN_TIME);
                }

                if (elapsed >= totalTime) {
                    camera.setPosition(baseX, baseY);
                    shakeTimer.remove(false);
                    this.registry.set('earthquakeDone', true);
                    return;
                }

                const intensity = EARTHQUAKE_MAX_SHAKE * Math.max(0, intensityRatio);
                camera.setPosition(
                    baseX + Phaser.Math.Between(-intensity, intensity),
                    baseY + Phaser.Math.Between(-intensity, intensity)
                );
            }
        });
    }

    private shakeStoneThenRollAway(): void {
        const advScene = GFF.AdventureContent;
        const startX = this.rollingStone.x;
        const startY = this.rollingStone.y;
        const startRotation = this.rollingStone.rotation;
        let elapsed = 0;

        advScene.getSound().playSound('stone_rumble');

        const shakeTimer = advScene.time.addEvent({
            delay: 32,
            loop: true,
            callback: () => {
                elapsed += 32;

                if (elapsed >= STONE_SHAKE_TIME) {
                    shakeTimer.remove(false);
                    this.rollingStone.setPosition(startX, startY);
                    this.rollingStoneLight.setPosition(startX, startY);
                    this.rollStoneAway(startX, startY, startRotation);
                    return;
                }

                const offsetX = Phaser.Math.Between(-STONE_SHAKE_INTENSITY, STONE_SHAKE_INTENSITY);
                const offsetY = Phaser.Math.Between(-STONE_SHAKE_INTENSITY, STONE_SHAKE_INTENSITY);
                this.rollingStone.setPosition(startX + offsetX, startY + offsetY);
                this.rollingStoneLight.setPosition(startX + offsetX, startY + offsetY);
            }
        });
    }

    private rollStoneAway(startX: number, startY: number, startRotation: number): void {
        const advScene = GFF.AdventureContent;
        const finalX = startX + STONE_ROLL_DISTANCE;
        const overshootRightX = finalX + 18;
        const overshootLeftX = finalX - 7;

        const updateStoneRotation = () => {
            const distance = this.rollingStone.x - startX;
            this.rollingStone.rotation = startRotation + (distance / STONE_RADIUS);
        };

        advScene.tweens.chain({
            targets: [this.rollingStone, this.rollingStoneLight],
            tweens: [
                {
                    x: overshootRightX,
                    y: startY,
                    duration: 1600,
                    ease: 'Linear',
                    onUpdate: updateStoneRotation,
                    onComplete: () => {
                        advScene.getSound().playSound('stone_thud');
                    }
                },
                {
                    x: overshootLeftX,
                    y: startY,
                    duration: 260,
                    ease: 'Sine.easeOut',
                    onUpdate: updateStoneRotation
                },
                {
                    x: finalX,
                    y: startY,
                    duration: 180,
                    ease: 'Sine.easeIn',
                    onUpdate: updateStoneRotation
                }
            ],
            onComplete: () => {
                this.rollingStone.x = finalX;
                this.rollingStoneLight.x = finalX;
                this.rollingStone.y = startY;
                this.rollingStoneLight.y = startY;
                updateStoneRotation();
                this.registry.set('stoneRolledAway', true);
            }
        });
    }

    private playPlayerRevealRejoice(): void {
        const player = PLAYER.getSprite();
        const rejoiceAnimKey = 'adam_soldier_rejoice_s';

        if (!GFF.AdventureContent.anims.exists(PLAYER_REJOICE_PARTIAL_ANIM)) {
            GFF.AdventureContent.anims.create({
                key: PLAYER_REJOICE_PARTIAL_ANIM,
                frames: GFF.AdventureContent.anims.generateFrameNumbers(rejoiceAnimKey, { start: 0, end: 4 }),
                frameRate: 10,
                repeat: 0
            });
        }

        const playPartialRejoice = () => {
            player.play(PLAYER_REJOICE_PARTIAL_ANIM, true);
            player.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                player.setTexture(rejoiceAnimKey, 4);
                this.registry.set('playerRevealRejoiceDone', true);
            });
        };

        player.play({ key: rejoiceAnimKey, repeat: 1 }, true);
        player.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            playPartialRejoice();
        });
    }

    private fadeInPlayerResurrectionGlow(): void {
        const advScene = GFF.AdventureContent;
        const ahhSound = advScene.getSound().playSound('ahh');
        const player = PLAYER.getSprite();
        const glowImage = advScene.add.image(
            player.x + RESURRECTION_GLOW_X_OFFSET,
            player.y + RESURRECTION_GLOW_Y_OFFSET,
            RESURRECTION_GLOW_KEY
        )
            .setOrigin(player.originX, player.originY)
            .setScale(player.scaleX, player.scaleY)
            .setDepth(player.depth + 1)
            .setAlpha(0);

        advScene.tweens.add({
            targets: glowImage,
            alpha: 1,
            duration: 4000,
            ease: 'Linear'
        });

        ahhSound.once('complete', () => {
            advScene.time.delayedCall(200, () => {
                this.playAmazingGraceTwice();
            });
        });

        advScene.time.delayedCall(1000, () => {
            advScene.fadeOut(4000, COLOR.WHITE.num(), () => {
                player.setVisible(false);
                player.getBody().setEnable(false);
                this.registry.set('screenFadedToWhite', true);
            });
        });
    }

    private playAmazingGraceTwice(): void {
        const sound = GFF.AdventureContent.getSound();
        const firstPlay = sound.fadeInMusic(1000, 'amazing', undefined, false);

        firstPlay?.once('complete', () => {
            const secondPlay = sound.playMusic('amazing', undefined, false);
            secondPlay.once('complete', () => {
                this.registry.set('amazingGraceDone', true);
            });
        });
    }

    private fadeInFinalScene(): void {
        GFF.AdventureContent.fadeIn(2000, COLOR.WHITE.num(), () => {
            GFF.AdventureContent.getCurrentRoom()?.unload();
            GFF.AdventureContent.add.image(0, 0, 'heaven_bg')
                .setOrigin(0, 0)
                .setDepth(FINAL_SCENE_DEPTH);
            GFF.AdventureContent.add.image(THE_LAMB_X, THE_LAMB_Y, 'the_lamb')
                .setOrigin(0.5, 0.5)
                .setDepth(THE_LAMB_DEPTH);
            this.startShiningGlory();
            this.startRainbowSparkles();
        }, () => {
            this.registry.set('finalSceneFadedIn', true);
        });
    }

    private startRainbowSparkles(): void {
        this.rainbowSparklePoints = this.getRainbowSparklePoints();
        this.scheduleRainbowSparkle();
    }

    private scheduleRainbowSparkle(): void {
        GFF.AdventureContent.time.delayedCall(Phaser.Math.Between(30, 150), () => {
            this.spawnRainbowSparkle();
            this.scheduleRainbowSparkle();
        });
    }

    private getRainbowSparklePoints(): GPoint2D[] {
        const maskTexture = GFF.AdventureContent.textures.get(RAINBOW_SPARKLE_MASK_KEY);
        const maskImage = maskTexture.getSourceImage() as HTMLImageElement | HTMLCanvasElement;
        const points: GPoint2D[] = [];

        for (let y = 0; y < maskImage.height; y += RAINBOW_SPARKLE_SAMPLE_RATE) {
            for (let x = 0; x < maskImage.width; x += RAINBOW_SPARKLE_SAMPLE_RATE) {
                const color = GFF.AdventureContent.textures.getPixel(x, y, RAINBOW_SPARKLE_MASK_KEY);

                if (color && color.alpha > 64 && color.red < 10 && color.green < 10 && color.blue < 10) {
                    points.push({ x, y });
                }
            }
        }

        return points;
    }

    private spawnRainbowSparkle(): void {
        if (this.rainbowSparklePoints.length === 0) {
            return;
        }

        const advScene = GFF.AdventureContent;
        const point = Phaser.Utils.Array.GetRandom(this.rainbowSparklePoints);
        const sparkle = advScene.add.image(point.x, point.y, RAINBOW_SPARKLE_KEY)
            .setOrigin(0.5, 0.5)
            .setDepth(RAINBOW_SPARKLE_DEPTH)
            .setScale(.3)
            .setAngle(Phaser.Math.Between(0, 359))
            .setAlpha(0);
        const angleChange = advScene.time.addEvent({
            delay: 40,
            loop: true,
            callback: () => {
                sparkle.setAngle(Phaser.Math.Between(0, 359));
            }
        });

        advScene.tweens.chain({
            targets: sparkle,
            tweens: [
                {
                    alpha: 1,
                    scale: 1,
                    duration: 200,
                    ease: 'Linear'
                },
                {
                    alpha: 0,
                    scale: .1,
                    duration: 200,
                    ease: 'Linear'
                }
            ],
            onComplete: () => {
                angleChange.destroy();
                sparkle.destroy();
            }
        });
    }

    private startShiningGlory(): void {
        const advScene = GFF.AdventureContent;
        const bursts = [0, 1].map(index =>
            advScene.add.image(THE_LAMB_X, THE_LAMB_Y, 'shining_burst')
                .setOrigin(0.5, 0.5)
                .setDepth(SHINING_BURST_DEPTH + index)
                .setScale(.8)
                .setAlpha(1)
        );

        advScene.time.addEvent({
            delay: 5,
            loop: true,
            callback: () => {
                bursts.forEach(burst => {
                    burst.setAngle(Phaser.Math.Between(0, 359));
                    burst.setAlpha(Phaser.Math.FloatBetween(.75, .95));
                    burst.setScale(Phaser.Math.FloatBetween(.8, 1));
                });
            }
        });
    }

    private getHeavenCongregationDimensions(count: number): { rows: number, cols: number } {
        const usableWidth = HEAVEN_CONGREGATION_ZONE.width - HEAVEN_CONGREGATION_BODY_WIDTH;
        const usableHeight = HEAVEN_CONGREGATION_ZONE.height - HEAVEN_CONGREGATION_BODY_HEIGHT;
        const maxCols = Math.floor(usableWidth / HEAVEN_CONGREGATION_MIN_HORZ_SPACE) + 1;
        const maxRows = Math.floor(usableHeight / HEAVEN_CONGREGATION_MIN_VERT_SPACE) + 1;
        const minRows = count >= 18 ? 3 : count >= 6 ? 2 : 1;
        let bestDimensions = { rows: minRows, cols: Math.ceil(count / minRows) };
        let bestScore = Number.MAX_SAFE_INTEGER;

        for (let rows = minRows; rows <= maxRows; rows++) {
            const cols = Math.ceil(count / rows);
            if (cols > maxCols) {
                continue;
            }

            const score = Math.abs((cols / rows) - HEAVEN_CONGREGATION_TARGET_ASPECT)
                + (rows * .1)
                + (cols % 2 === 0 ? 1.5 : 0);

            if (score < bestScore) {
                bestDimensions = { rows, cols };
                bestScore = score;
            }
        }

        return bestDimensions;
    }

    private getHeavenCongregationSlots(count: number): CongregationSlot[] {
        const { rows, cols } = this.getHeavenCongregationDimensions(count);
        const usableWidth = HEAVEN_CONGREGATION_ZONE.width - HEAVEN_CONGREGATION_BODY_WIDTH;
        const usableHeight = HEAVEN_CONGREGATION_ZONE.height - HEAVEN_CONGREGATION_BODY_HEIGHT;
        const maxCols = Math.floor(usableWidth / HEAVEN_CONGREGATION_MIN_HORZ_SPACE) + 1;
        const frontRowCount = Math.max(1, cols - Math.floor(rows / 2));
        let rowCounts = Array.from({ length: rows }, (_, row) =>
            Math.min(maxCols, frontRowCount + row)
        );

        if (rowCounts[0] % 2 === 0 && rowCounts[0] > 1) {
            rowCounts[0]--;
        }

        if (rowCounts.reduce((total, rowCount) => total + rowCount, 0) < count) {
            for (let row = rows - 1; row >= 0; row--) {
                while (
                    rowCounts.reduce((total, rowCount) => total + rowCount, 0) < count &&
                    rowCounts[row] < maxCols
                ) {
                    rowCounts[row]++;
                }
            }
        }

        const widestRow = Math.max(...rowCounts);
        const horzSpace = cols <= 1
            ? 0
            : Math.min(
                HEAVEN_CONGREGATION_MAX_HORZ_SPACE,
                widestRow <= 1 ? 0 : usableWidth / (widestRow - 1)
            );
        const vertSpace = rows <= 1
            ? 0
            : Math.min(HEAVEN_CONGREGATION_MAX_VERT_SPACE, usableHeight / (rows - 1));
        const groupHeight = (rows - 1) * vertSpace;
        const centerX = HEAVEN_CONGREGATION_ZONE.x + (HEAVEN_CONGREGATION_ZONE.width / 2);
        const startY = HEAVEN_CONGREGATION_ZONE.y + (HEAVEN_CONGREGATION_ZONE.height / 2) - (groupHeight / 2);
        const isStaggeredFromPreviousRow = (previousStartX: number, currentStartX: number): boolean => {
            if (horzSpace === 0) {
                return true;
            }

            const rowOffset = Math.abs(currentStartX - previousStartX) % horzSpace;
            const staggerOffset = Math.min(rowOffset, horzSpace - rowOffset);
            return staggerOffset > horzSpace * .25 && staggerOffset < horzSpace * .75;
        };
        const rowStartXs: number[] = [];
        rowCounts.forEach((rowCount, row) => {
            let rowStartX = centerX - (((rowCount - 1) * horzSpace) / 2);

            if (
                row > 0 &&
                !isStaggeredFromPreviousRow(rowStartXs[row - 1], rowStartX)
            ) {
                rowStartX += horzSpace / 2;
            }

            rowStartXs.push(rowStartX);
        });
        const firstRowCenterCol = Math.floor((rowCounts[0] - 1) / 2);
        const slots: CongregationSlot[] = [{
            point: {
                x: rowStartXs[0] + (firstRowCenterCol * horzSpace),
                y: startY
            }
        }];

        for (let row = 0; row < rows; row++) {
            const rowCount = rowCounts[row];
            const rowStartX = rowStartXs[row];
            const centerCol = Math.floor((rowCount - 1) / 2);

            for (let offset = 0; offset <= Math.max(centerCol, rowCount - centerCol - 1); offset++) {
                const colsToTry = offset === 0
                    ? [centerCol]
                    : [centerCol - offset, centerCol + offset];

                colsToTry.forEach(col => {
                    if (col < 0 || col >= rowCount || (row === 0 && col === centerCol)) {
                        return;
                    }

                    slots.push({
                        point: {
                            x: rowStartX + (col * horzSpace),
                            y: startY + (row * vertSpace)
                        }
                    });
                });
            }
        }

        return slots.slice(0, count);
    }

    private prepareHeavenProcession(converts: GPerson[]): void {
        converts.forEach(convert => {
            this.createActorSprite(convert);
        });

        GFF.AdventureContent.setBottomBoundEnabled(false);
        PLAYER.getSprite().usePlainAnims();
        PLAYER.getSprite().setImmobile(false);
        this.getAllActors().forEach(actor => {
            actor.setUseAutoDepth(true);
            const body = actor.body as Phaser.Physics.Arcade.Body | undefined | null;
            if (body !== undefined && body !== null) {
                body.checkCollision.none = true;
            }
        });
    }

    private addHeavenProcessionEvents(): void {
        const converts = PEOPLE.getPlayerConverts();
        const groupSize = converts.length + 1;
        const slots = this.getHeavenCongregationSlots(groupSize);
        const adamSlot = slots[0];
        const convertSlots = slots.slice(1);

        this.addCutsceneEvent({
            eventId: 'prepareHeavenProcession',
            eventCode: () => {
                this.prepareHeavenProcession(converts);
            },
            after: 'finalSceneFadedIn',
            since: 500
        });

        this.addCutsceneEvent({
            eventId: 'adamHeavenSpawn',
            actor: 'player',
            command: `spawnAt(${HEAVEN_PROCESSION_SPAWN_PT.x},${HEAVEN_PROCESSION_SPAWN_PT.y})`,
            after: 'prepareHeavenProcession',
            since: 1
        });

        this.addCutsceneEvent({
            eventId: 'adamHeavenWalkToPlace',
            actor: 'player',
            command: `walkTo(${adamSlot.point.x},${adamSlot.point.y})`,
            postCode: () => {
                let arrivedCount: number = this.registry.get('heavenProcessionArrivedCount') ?? 0;
                this.registry.set('heavenProcessionArrivedCount', ++arrivedCount);
            },
            after: 'adamHeavenSpawn',
            since: 1
        });

        this.addCutsceneEvent({
            eventId: 'adamHeavenFaceThrone',
            actor: 'player',
            command: 'faceDir(n)',
            after: 'adamHeavenWalkToPlace',
            since: 1
        });

        convertSlots.forEach((slot, index) => {
            const actorNumber = index + 1;
            const previousSpawnEvent = actorNumber === 1
                ? 'adamHeavenSpawn'
                : `heavenConvert_${actorNumber - 1}Spawn`;

            this.addCutsceneEvent({
                eventId: `heavenConvert_${actorNumber}Spawn`,
                actor: `actor_${actorNumber}`,
                command: `spawnAt(${HEAVEN_PROCESSION_SPAWN_PT.x},${HEAVEN_PROCESSION_SPAWN_PT.y})`,
                after: previousSpawnEvent,
                since: HEAVEN_PROCESSION_STAGGER
            });

            this.addCutsceneEvent({
                eventId: `heavenConvert_${actorNumber}WalkToPlace`,
                actor: `actor_${actorNumber}`,
                command: `walkTo(${slot.point.x},${slot.point.y})`,
                postCode: () => {
                    let arrivedCount: number = this.registry.get('heavenProcessionArrivedCount') ?? 0;
                    this.registry.set('heavenProcessionArrivedCount', ++arrivedCount);
                },
                after: `heavenConvert_${actorNumber}Spawn`,
                since: 1
            });

            this.addCutsceneEvent({
                eventId: `heavenConvert_${actorNumber}FaceThrone`,
                actor: `actor_${actorNumber}`,
                command: 'faceDir(n)',
                after: `heavenConvert_${actorNumber}WalkToPlace`,
                since: 1
            });
        });

        this.addCutsceneEvent({
            eventId: 'heavenProcessionArrived',
            condition: () => this.registry.get('heavenProcessionArrivedCount') as number === groupSize,
            after: 'prepareHeavenProcession',
            since: 1
        });
    }

    private showResurrectionTextSequence(): void {
        this.showResurrectionText(0);
    }

    private showResurrectionText(index: number): void {
        if (index >= RESURRECTION_TEXTS.length) {
            this.registry.set('resurrectionTextsDone', true);
            return;
        }

        const advScene = GFF.AdventureContent;
        const resurrectionText = RESURRECTION_TEXTS[index];
        const titleObjects = this.createTitleTextLines(
            resurrectionText.text,
            GFF.ROOM_H / 2,
            '54px',
            WHITE_SCREEN_TEXT_DEPTH + 1,
            RESURRECTION_TEXT_LINE_HEIGHT,
            3,
            7,
            9,
            COLOR.GOLD_2,
            COLOR.GOLD_0
        );

        advScene.tweens.add({
            targets: titleObjects,
            alpha: 1,
            duration: 500,
            ease: 'Linear',
            onComplete: () => {
                advScene.time.delayedCall(resurrectionText.holdTime, () => {
                    advScene.tweens.add({
                        targets: titleObjects,
                        alpha: 0,
                        duration: 500,
                        ease: 'Linear',
                        onComplete: () => {
                            titleObjects.forEach(textObject => textObject.destroy());
                            advScene.time.delayedCall(1000, () => {
                                this.showResurrectionText(index + 1);
                            });
                        }
                    });
                });
            }
        });
    }

    protected initialize(): void {
        const skipToCaveExterior = REGISTRY.getBoolean('skipFinalVictoryToCaveExterior');
        REGISTRY.remove('skipFinalVictoryToCaveExterior');

        if (skipToCaveExterior) {
            this.addCutsceneEvent({
                eventId: 'sceneFadeOutDone',
                eventCode: () => {
                    this.registry.set('sceneFadeOutDone', true);
                },
                after: 'start',
                since: 1
            });
        } else {
            this.addCutsceneEvent({
                eventId: 'transformDragon',
                eventCode: () => {
                    this.transformDragonToSerpent();
                },
                after: 'start',
                since: 1500
            });

            this.addCutsceneEvent({
                eventId: 'serpentTransformDone',
                condition: () => this.registry.has('serpentTransformDone'),
                after: 'transformDragon',
                since: 100
            });

            this.addCutsceneEvent({
                eventId: 'serpentSlither',
                eventCode: () => {
                    const serpent = this.registry.get('serpentSprite') as GSerpentSprite;
                    serpent.slitherThrough([
                        { x: 615, y: 250 },
                        { x: 640, y: 305 },
                        { x: 640, y: 365 },
                        { x: 620, y: 440 }
                    ], () => {
                        this.registry.set('serpentSlitherDone', true);
                    });
                },
                after: 'serpentTransformDone',
                since: 1000
            });

            this.addCutsceneEvent({
                eventId: 'adamFaceSerpentNe',
                actor: 'player',
                command: `faceDir(ne)`,
                after: 'serpentSlither',
                since: 4000
            });

            this.addCutsceneEvent({
                eventId: 'titleAndGodOfPeace',
                eventCode: () => {
                    this.showVictoryTitle('And the God of peace', 100);
                },
                after: 'serpentSlither',
                since: 1000
            });

            this.addCutsceneEvent({
                eventId: 'adamFaceSerpentE',
                actor: 'player',
                command: `faceDir(e)`,
                after: 'adamFaceSerpentNe',
                since: 2500
            });

            this.addCutsceneEvent({
                eventId: 'serpentSlitherDone',
                condition: () => this.registry.has('serpentSlitherDone'),
                after: 'serpentSlither',
                since: 1
            });

            this.addCutsceneEvent({
                eventId: 'adamWalkToSerpent',
                actor: 'player',
                command: `walkDir(e,78)`,
                after: 'serpentSlitherDone',
                since: 10
            });

            this.addCutsceneEvent({
                eventId: 'adamFootStomp',
                eventCode: () => {
                    const serpent = this.registry.get('serpentSprite') as GSerpentSprite;
                    PLAYER.getSprite().footStomp(
                        () => serpent.splat(),
                        () => this.registry.set('adamFootStompDone', true)
                    );
                },
                after: 'adamWalkToSerpent',
                since: 100
            });

            this.addCutsceneEvent({
                eventId: 'adamFootStompDone',
                condition: () => this.registry.has('adamFootStompDone'),
                after: 'adamFootStomp',
                since: 100
            });

            this.addCutsceneEvent({
                eventId: 'adamPauseAfterStomp',
                eventCode: () => {
                    PLAYER.getSprite().play('adam_soldier_pause_se');
                    GFF.AdventureContent.time.delayedCall(5000, () => {
                        this.registry.set('adamPauseAfterStompDone', true);
                    });
                },
                after: 'adamFootStompDone',
                since: 1
            });

            this.addCutsceneEvent({
                eventId: 'titleShallBruiseSatan',
                eventCode: () => {
                    this.showVictoryTitle('shall bruise Satan\nunder your feet shortly.', 210);
                    GFF.AdventureContent.getSound().playSound('victory_fanfare');
                },
                after: 'adamFootStompDone',
                since: 500
            });

            this.addCutsceneEvent({
                eventId: 'adamPauseAfterStompDone',
                condition: () => this.registry.has('adamPauseAfterStompDone'),
                after: 'adamPauseAfterStomp',
                since: 1
            });

            this.addCutsceneEvent({
                eventId: 'adamWalkToExit',
                actor: 'player',
                command: `walkTo(512,690)`,
                after: 'adamPauseAfterStompDone',
                since: 100
            });

            this.addCutsceneEvent({
                eventId: 'sceneFadeOut',
                eventCode: () => {
                    GFF.AdventureContent.fadeOut(2000, COLOR.BLACK.num(), () => {
                        this.registry.set('sceneFadeOutDone', true);
                    });
                },
                after: 'adamWalkToExit',
                since: 100
            });

            this.addCutsceneEvent({
                eventId: 'sceneFadeOutDone',
                condition: () => this.registry.has('sceneFadeOutDone'),
                after: 'sceneFadeOut',
                since: 1
            });
        }

        this.addCutsceneEvent({
            eventId: 'transitionToCaveExterior',
            eventCode: () => {
                const caveRoom: GRoom = AREA.CAVE_AREA.getRoomAt(0, 0, 0) as GRoom;
                const caveExteriorRoom = caveRoom.getPortalRoom() as GRoom;
                GFF.AdventureContent.transitionRoomDuringCutscene(caveExteriorRoom, false, true, false);
                // Enable full vision so we can watch the entire scene unfold:
                GFF.AdventureContent.setVision(true);
                this.placeStoneAtCaveEntrance();
                this.placePlayerBehindStone();
                GFF.AdventureContent.shroud(COLOR.BLACK);
            },
            after: 'sceneFadeOutDone',
            since: 100
        });

        this.addCutsceneEvent({
            eventId: 'sceneFadeIn',
            eventCode: () => {
                GFF.AdventureContent.fadeIn(3000, COLOR.BLACK.num(), undefined, () => {
                    this.registry.set('sceneFadeInDone', true);
                });
            },
            after: 'transitionToCaveExterior',
            since: 1500
        });

        this.addCutsceneEvent({
            eventId: 'sceneFadeInDone',
            condition: () => this.registry.has('sceneFadeInDone'),
            after: 'sceneFadeIn',
            since: 1
        });

        this.addCutsceneEvent({
            eventId: 'earthquake',
            eventCode: () => {
                this.startEarthquake();
            },
            after: 'sceneFadeInDone',
            since: 1000
        });

        this.addCutsceneEvent({
            eventId: 'earthquakeDone',
            condition: () => this.registry.has('earthquakeDone'),
            after: 'earthquake',
            since: 1
        });

        this.addCutsceneEvent({
            eventId: 'stoneShake',
            eventCode: () => {
                this.shakeStoneThenRollAway();
            },
            after: 'earthquake',
            since: 5000
        });

        this.addCutsceneEvent({
            eventId: 'stoneRolledAway',
            condition: () => this.registry.has('stoneRolledAway'),
            after: 'stoneShake',
            since: 1
        });

        this.addCutsceneEvent({
            eventId: 'playerRevealRejoice',
            eventCode: () => {
                this.playPlayerRevealRejoice();
            },
            after: 'stoneRolledAway',
            since: 1000
        });

        this.addCutsceneEvent({
            eventId: 'playerRevealRejoiceDone',
            condition: () => this.registry.has('playerRevealRejoiceDone'),
            after: 'playerRevealRejoice',
            since: 1
        });

        this.addCutsceneEvent({
            eventId: 'playerResurrectionGlow',
            eventCode: () => {
                this.fadeInPlayerResurrectionGlow();
            },
            after: 'playerRevealRejoiceDone',
            since: 100
        });

        this.addCutsceneEvent({
            eventId: 'screenFadedToWhite',
            condition: () => this.registry.has('screenFadedToWhite'),
            after: 'playerResurrectionGlow',
            since: 1
        });

        this.addCutsceneEvent({
            eventId: 'resurrectionTexts',
            eventCode: () => {
                this.showResurrectionTextSequence();
            },
            after: 'screenFadedToWhite',
            since: 1000
        });

        this.addCutsceneEvent({
            eventId: 'resurrectionTextsDone',
            condition: () => this.registry.has('resurrectionTextsDone'),
            after: 'resurrectionTexts',
            since: 1
        });

        this.addCutsceneEvent({
            eventId: 'readyForFinalScene',
            condition: () => this.registry.has('resurrectionTextsDone') && this.registry.has('amazingGraceDone'),
            after: 'resurrectionTextsDone',
            since: 1
        });

        this.addCutsceneEvent({
            eventId: 'finalSceneFadeIn',
            eventCode: () => {
                this.fadeInFinalScene();
            },
            after: 'readyForFinalScene',
            since: 100
        });

        this.addCutsceneEvent({
            eventId: 'finalSceneFadedIn',
            condition: () => this.registry.has('finalSceneFadedIn'),
            after: 'finalSceneFadeIn',
            since: 1
        });

        this.addHeavenProcessionEvents();

        this.addCutsceneEvent({
            eventId: 'endCutscene',
            eventCode: () => {
                this.end();
            },
            after: 'heavenProcessionArrived',
            since: 10000
        });
    }

    protected finalize(): void {
    }
}
