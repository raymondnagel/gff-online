    // private doMapExport(fromX: number, fromY: number) {
    //     const area = this.getCurrentArea();
    //     const w = area.getWidth();
    //     const h = area.getHeight();
    //     const finalX = fromX;
    //     const finalY = fromY;
    //     const n = (finalY * w) + finalX;
    //     console.log(`Working on ${area.getName()}__${finalX}_${finalY}.png`);
    //     this.setCurrentRoom(finalX, finalY);
    //     this.sys.game.renderer.snapshotArea(
    //         0, 0, GFF.ROOM_W, GFF.ROOM_H,
    //         (image: HTMLImageElement|Phaser.Display.Color) => {
    //             // Save the image as a base64 data URL
    //             let dataUrl = (image as HTMLImageElement).src;

    //             // Trigger a download
    //             let a = document.createElement('a');
    //             a.href = dataUrl;
    //             a.download = `Room-${n}__${finalX},${finalY}.png`;
    //             document.body.appendChild(a);
    //             a.click();
    //             document.body.removeChild(a);

    //             let nextX = finalX;
    //             let nextY = finalY;
    //             if (nextX < w-1) {
    //                 nextX++;
    //             } else {
    //                 nextX = 0;
    //                 nextY++;
    //             }
    //             if (nextY < h) {
    //                 // Recurse
    //                 this.doMapExport(nextX, nextY);
    //             }
    //         }
    //     );
    // }


    // public doMapExport(fromX: number, fromY: number) {
    //     // if (this.mapRt === undefined) {
    //     //     this.mapRt = new Phaser.GameObjects.RenderTexture(this, 0, 0, 2000, 1200);
    //     // }

    //     const area = this.getCurrentArea();
    //     const w = area.getWidth();
    //     const h = area.getHeight();
    //     const finalX = fromX;
    //     const finalY = fromY;
    //     const n = (finalY * w) + finalX;
    //     this.setCurrentRoom(finalX, finalY);
    //     this.sys.game.renderer.snapshotArea(
    //         0, 0, GFF.ROOM_W, GFF.ROOM_H,
    //         (image: HTMLImageElement|Phaser.Display.Color) => {
    //             // Save the image as a base64 data URL
    //             let dataUrl = (image as HTMLImageElement).src;

    //             // Trigger a download
    //             let a = document.createElement('a');
    //             a.href = dataUrl;
    //             a.download = `Room-${n}__${finalX},${finalY}.png`;
    //             document.body.appendChild(a);
    //             a.click();
    //             document.body.removeChild(a);

    //             let nextX = finalX;
    //             let nextY = finalY;
    //             if (nextX < w-1) {
    //                 nextX++;
    //             } else {
    //                 nextX = 0;
    //                 nextY++;
    //             }
    //             if (nextY < h) {
    //                 // Recurse
    //                 this.doMapExport(nextX, nextY);
    //             }
    //         }
    //     );
    // }