import { COLOR } from "../../colors";
import { PHYSICS } from "../../physics";
import { BoundedGameObject, GRect } from "../../types";

const SCROLLBAR_WIDTH: number = 16;
const SCROLLBAR_THUMB_HEIGHT: number = 30;

export class GScrollPane extends Phaser.GameObjects.Container {
    private maskGraphics: Phaser.GameObjects.Graphics;
    private content: Phaser.GameObjects.Container;
    private scrollbarTrack: Phaser.GameObjects.Rectangle;
    private scrollbarThumb: Phaser.GameObjects.Rectangle;
    private scrollY: number = 0;
    private contentHeight: number;
    private padding: number;
    private nextY: number;
    private thumbDragOffset: number = 0;
    private viewport: GRect;

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
        this.viewport = {
            x, y, width, height
        };

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
        this.scrollbarThumb = scene.add.rectangle(width - SCROLLBAR_WIDTH, 0, SCROLLBAR_WIDTH, SCROLLBAR_THUMB_HEIGHT, 0xaaaaaa).setOrigin(0);
        this.add(this.scrollbarTrack);
        this.add(this.scrollbarThumb);
        this.scrollbarThumb.setInteractive();
        this.scene.input.setDraggable(this.scrollbarThumb);
        this.scrollbarThumb.on('dragstart', (pointer: Phaser.Input.Pointer) => {
            this.thumbDragOffset = pointer.y - this.scrollbarThumb.y;
        });
        this.scrollbarThumb.on('drag', (pointer: Phaser.Input.Pointer) => {
            const localY = pointer.y - this.thumbDragOffset;
            const maxThumbY = this.viewport.height - this.scrollbarThumb.height;

            // Clamp the thumb position
            const newThumbY = Phaser.Math.Clamp(localY, 0, maxThumbY);
            this.scrollbarThumb.y = newThumbY;

            // Convert thumb position to scrollY
            const scrollRatio = newThumbY / maxThumbY;
            this.scrollY = scrollRatio * (this.contentHeight - this.viewport.height);
            this.content.y = -this.scrollY;
        });

        // Mouse wheel scrolling
        scene.input.on('wheel', (pointer: any, _gameObjects: any, _dx: number, dy: number) => {
            /**
             * It's difficult to catch an event of the mouse entering/exiting the scroll
             * pane, since the content blocks the mouse events from getting through to the container.
             * However, we can use the wheel event on the scene, and only scroll if the mouse is
             * over the scroll pane. This way, we can scroll even if the mouse is over the content.
             */
            if (PHYSICS.isPointWithin(pointer.x, pointer.y, this.viewport)) {
                this.scrollBy(dy);
            }
        });

        this.setSize(width, height);
        scene.add.existing(this);
    }

    public setVisible(visible: boolean): this {
        super.setVisible(visible);
        this.maskGraphics.setVisible(visible);
        this.scrollbarTrack.setVisible(visible);
        this.scrollbarThumb.setVisible(visible && this.contentHeight > this.viewport.height);
        return this;
    }

    public addContent(child: BoundedGameObject) {
        this.content.add(child);
        child.setPosition(this.padding, this.nextY);
        if ('setSize' in child && typeof child.setSize === 'function') {
            child.setSize(this.width - SCROLLBAR_WIDTH - (2 * this.padding), child.height);
            this.nextY += child.height + this.padding;
        }
        this.updateContentHeight();
    }

    public removeAll(destroyChild?: boolean): this {
        this.content.removeAll(destroyChild);
        this.nextY = this.padding;
        this.scrollY = 0;
        this.content.y = 0;
        this.updateContentHeight();
        this.updateScrollThumb();
        return this;
    }

    public ensureIsVisible(child: BoundedGameObject) {
        const childTop = child.y;
        const childBottom = child.y + child.height;

        const viewTop = this.scrollY;
        const viewBottom = this.scrollY + this.viewport.height;

        if (childTop < viewTop) {
            // Scroll up to reveal top of child
            this.scrollY = Phaser.Math.Clamp(childTop, 0, this.contentHeight - this.viewport.height);
        } else if (childBottom > viewBottom) {
            // Scroll down to reveal bottom of child
            this.scrollY = Phaser.Math.Clamp(childBottom - this.viewport.height, 0, this.contentHeight - this.viewport.height);
        }

        // Apply scroll position
        this.content.y = -this.scrollY;
        this.updateScrollThumb();
    }

    private updateContentHeight() {
        const bounds = this.content.getBounds();
        this.contentHeight = bounds.height + this.padding * 2;
        // We can always show the track, but the thumb should only be visible if there is enough content to scroll
        this.scrollbarThumb.setVisible(this.contentHeight > this.viewport.height);
    }

    private updateScrollThumb() {
        const scrollRatio = this.scrollY / Math.max(1, this.contentHeight - this.viewport.height);
        const maxThumbY = this.viewport.height - this.scrollbarThumb.height;
        this.scrollbarThumb.y = scrollRatio * maxThumbY;
    }

    private scrollBy(deltaY: number) {
        const maxScroll = Math.max(0, this.contentHeight - this.viewport.height);
        this.scrollY = Phaser.Math.Clamp(this.scrollY + deltaY, 0, maxScroll);
        this.content.y = -this.scrollY;
        this.updateScrollThumb();
    }
}