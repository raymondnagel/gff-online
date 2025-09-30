    // public planHorzFence(left: number, y: number, segments: number, mainSegment: string, leftSegment: string = mainSegment, rightSegment: string = mainSegment): number {
    //     const mainDef: GSceneryDef = SCENERY.def(mainSegment);
    //     const leftDef: GSceneryDef = SCENERY.def(leftSegment);
    //     const rightDef: GSceneryDef = SCENERY.def(rightSegment);
    //     let x: number = left;
    //     for (let s: number = 0; s < segments; s++) {
    //         if (s === 0) {
    //             this.planPositionedScenery(leftDef, x, y);
    //             x += leftDef.body.width;
    //         } else if (s === segments - 1) {
    //             this.planPositionedScenery(rightDef, x, y);
    //             x += rightDef.body.width;
    //         } else {
    //             this.planPositionedScenery(mainDef, x, y);
    //             x += mainDef.body.width;
    //         }
    //     }
    //     return x;
    // }

    // public planVertFence(x: number, top: number, segments: number, segmentKey: string): number {
    //     const segmentDef: GSceneryDef = SCENERY.def(segmentKey);
    //     let y: number = top;
    //     for (let s: number = 0; s < segments; s++) {
    //         this.planPositionedScenery(segmentDef, x, y);
    //         y += segmentDef.body.height;
    //     }
    //     return y;
    // }

    // public planFenceBox(x: number, y: number, width: number, height: number, segmentBase: string) {
    //     // Get height of the horizontal segment and the width of the vertical segment:
    //     const horzDef: GSceneryDef = SCENERY.def(`${segmentBase}_h`);
    //     const vertDef: GSceneryDef = SCENERY.def(`${segmentBase}_v_left`);
    //     const hHeight: number = horzDef.body.height;
    //     const vWidth: number = vertDef.body.width;

    //     // Create the back fence (horizontal); return the ending X, so we can use it to position the right fence
    //     // Picket fence is unique in that it has a specialized back
    //     const backFenceSegmentBase = segmentBase === 'fence_picket' ?  `${segmentBase}_h_back` : `${segmentBase}_h`;
    //     const horzFenceEnd = this.planHorzFence(x, y, width, backFenceSegmentBase, `${backFenceSegmentBase}_left`, `${backFenceSegmentBase}_right`);

    //     // Create the left fence (vertical); return the ending Y, so we can use it to position the south fence
    //     const vertFenceEnd = this.planVertFence(x, y + hHeight, height, `${segmentBase}_v_left`);

    //     // Create the right fence (vertical) where the horizontal segments ended
    //     this.planVertFence(horzFenceEnd - vWidth, y + hHeight, height, `${segmentBase}_v_right`);

    //     // Create the front fence (horizontal) where the vertical segments ended
    //     this.planHorzFence(x, vertFenceEnd, width, `${segmentBase}_h`, `${segmentBase}_h_left`, `${segmentBase}_h_right`);
    // }