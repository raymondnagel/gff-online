import { COLOR } from "../../colors";
import { BoundedGameObject } from "../../types";

const SCROLLBAR_WIDTH: number = 16;
const SCROLLBAR_THUMB_HEIGHT: number = 30;

export class GScrollPane extends Phaser.GameObjects.Container {
    private maskGraphics: Phaser.GameObjects.Graphics;
    private content: Phaser.GameObjects.Container;
    private scrollbarTrack: Phaser.GameObjects.Rectangle;
    private scrollbarThumb: Phaser.GameObjects.Rectangle;
    private scrollY: number = 0;
    private viewportHeight: number;
    private contentHeight: number;
    private padding: number;
    private nextY: number;

    /**
     * This class implements a simple scroll pane that allows
     * vertical scrolling of content. It's expected to be used for:
     * - Bible subscreen, for scrolling through selected chapter
     * - People subscreen, for scrolling through person entries
     * - Glossary subscreen, for scrolling through glossary entries
     *
     * In all use cases, children of this container will automatically
     * be positioned vertically as they are added, and resized to fit horizontally.
     */

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, padding: number = 10) {
        super(scene, x, y);
        this.padding = padding;
        this.nextY = padding;
        this.viewportHeight = height;

        // Background image
        const bg = scene.add.image(0, 0, 'darkrock_bg');
        bg.setOrigin(0);
        bg.setCrop(0, 0, width, height);
        this.add(bg);

        // Mask
        this.maskGraphics = scene.add.graphics();
        this.maskGraphics.fillStyle(COLOR.GREY_2.num()).fillRect(x, y, width, height);
        const mask = this.maskGraphics.createGeometryMask();
        this.setMask(mask);

        // Content container
        this.content = scene.add.container();
        this.add(this.content);

        // Scrollbar
        this.scrollbarTrack = scene.add.rectangle(width - SCROLLBAR_WIDTH, 0, SCROLLBAR_WIDTH, height, 0x444444).setOrigin(0);
        this.scrollbarThumb = scene.add.rectangle(width - SCROLLBAR_WIDTH, 0, SCROLLBAR_WIDTH, 30, 0xaaaaaa).setOrigin(0);
        this.add(this.scrollbarTrack);
        this.add(this.scrollbarThumb);

        // Scroll interaction (mouse wheel)
        scene.input.on('wheel', (_pointer: any, _gameObjects: any, _dx: number, dy: number) => {
            this.scrollBy(dy);
        });

        this.setSize(width, height);
        scene.add.existing(this);
    }

    addContent(child: BoundedGameObject) {
        this.content.add(child);
        child.setPosition(this.padding, this.nextY);
        if ('setSize' in child && typeof child.setSize === 'function') {
            child.setSize(this.width - SCROLLBAR_WIDTH - (2 * this.padding), child.height);
            this.nextY += child.height + this.padding;
        }
        this.updateContentHeight();
    }

    private updateContentHeight() {
        const bounds = this.content.getBounds();
        this.contentHeight = bounds.height + this.padding * 2;
    }

    private updateScrollThumb() {
        const scrollRatio = this.scrollY / Math.max(1, this.contentHeight - this.viewportHeight);
        const maxThumbY = this.viewportHeight - this.scrollbarThumb.height;
        this.scrollbarThumb.y = scrollRatio * maxThumbY;
    }

    private scrollBy(deltaY: number) {
        const maxScroll = Math.max(0, this.contentHeight - this.viewportHeight);
        this.scrollY = Phaser.Math.Clamp(this.scrollY + deltaY, 0, maxScroll);
        this.content.y = -this.scrollY;
        this.updateScrollThumb();
    }
}