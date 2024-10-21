import { BoundedGameObject } from "../../types";

export class GDistributionContainer extends Phaser.GameObjects.Container {

    private orientation: 'horizontal'|'vertical';

    constructor(scene: Phaser.Scene, x: number, y: number, orientation: 'horizontal'|'vertical') {
        super(scene, x, y);
        this.orientation = orientation;
    }

    public arrange(sizeAllowed: number) {
        const children: Phaser.GameObjects.GameObject[] = this.getAll();
        if (this.orientation === "horizontal") {
            this.width = sizeAllowed;
            let totalWidths: number = 0;
            let bObj: BoundedGameObject;
            children.forEach(o => {
                bObj = o as BoundedGameObject;
                this.height = Math.max(this.height, bObj.height);
                totalWidths += bObj.width;
            });
            const totalSpace: number = sizeAllowed - totalWidths;
            const spaceBetween: number = totalSpace / (children.length + 1);
            let x: number = spaceBetween;
            children.forEach(o => {
                bObj = o as BoundedGameObject;
                bObj.y = 0;
                bObj.x = x;
                x += bObj.width + spaceBetween;
            });
        } else {
            this.height = sizeAllowed;
            let totalHeights: number = 0;
            let bObj: BoundedGameObject;
            children.forEach(o => {
                bObj = o as BoundedGameObject;
                this.width = Math.max(this.width, bObj.width);
                totalHeights += bObj.height;
            });
            const totalSpace: number = sizeAllowed - totalHeights;
            const spaceBetween: number = totalSpace / (children.length + 1);
            let y: number = spaceBetween;
            children.forEach(o => {
                bObj = o as BoundedGameObject;
                bObj.y = y;
                bObj.x = 0;
                y += bObj.height + spaceBetween;
            });
        }
    }
}