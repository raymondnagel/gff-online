// private initInputMode() {
//     INPUT_DEFAULT.onKeyDown((keyEvent) => {
//         if (keyEvent.key === 'a') {
//             this.doZoneTest();
//         }
//         if (keyEvent.key === 'd') {
//             this.clearRects();
//         }
//         this.sendPotentialHotkey(keyEvent);
//     });
//     INPUT_DEFAULT.addAllowedEvent('MOUSE_UI_BUTTON');
//     this.setInputMode(INPUT_DEFAULT);
// }

// private sceneryZones: GRect[] = [
//     {x: 100, y: 100, width: 300, height: 300}
// ];
// private objects: GRect[] = [];

// private doZoneTest() {
//     this.sceneryZones.forEach(z => {
//         // Add red rectangle for each zone:
//         this.add.rectangle(z.x, z.y, z.width, z.height, 0xff0000, 0).setOrigin(0, 0).setStrokeStyle(1, 0xff0000, 1);
//     });

//     this.objects.forEach(o => {
//         // Add black rectangle for each existing object:
//         this.add.rectangle(o.x, o.y, o.width, o.height, 0x000000, 0).setOrigin(0, 0).setStrokeStyle(1, 0x000000, 1);
//     });

//     const oWidth: number = GRandom.randInt(20, 60);
//     const oHeight: number = GRandom.randInt(20, 60);
//     this.detectPlacementAreas(oWidth, oHeight, this.objects, this.sceneryZones);
//     console.log(`${this.objects.length} objects`);
// }

// private clearRects() {
//     let objs: Phaser.GameObjects.GameObject[] = this.children.getChildren();

//     for (let n = objs.length - 1; n >= 0; n--) {
//         if (objs[n] instanceof Phaser.GameObjects.Rectangle) {
//             objs[n].destroy();
//         }
//     }
// }

// private detectPlacementAreas(oWidth: number, oHeight: number, objects: GRect[], zones: GRect[]) {
//     for (let zone of zones) {
//         this.detectPlaceableAreasInZone(oWidth, oHeight, objects, zone);
//     }
// }

// private detectPlaceableAreasInZone(oWidth: number, oHeight: number, objects: GRect[], zone: GRect) {
//     let areas: GRect[] = this.getFillers(zone, objects);
//     console.log(`${areas.length} areas`);

//     // areas = areas.filter((value: GRect, index: number, array: GRect[]) => {
//     //     return value.width >= oWidth && value.height >= oHeight;
//     // });

//     areas.forEach(a => {
//         // Add green rectangle for each "filler" area:
//         this.add.rectangle(a.x, a.y, a.width, a.height, 0x00ff00, .2).setOrigin(0, 0).setStrokeStyle(1, 0x00ff00, .7);
//     });

//     if (areas.length > 0) {
//         const area: GRect = GRandom.randElement(areas);
//         const x: number = GRandom.randInt(area.x, area.x + area.width - oWidth);
//         const y: number = GRandom.randInt(area.y, area.y + area.height - oHeight);
//         const newObject: GRect = {x, y, width: oWidth, height: oHeight};
//         objects.push(newObject);
//         // Add blue rectangle for new object placed:
//         this.add.rectangle(newObject.x, newObject.y, newObject.width, newObject.height, 0x0000ff, 0).setOrigin(0, 0).setStrokeStyle(1, 0x0000ff, 1);
//     }
// }

// private getFillers(zone: GRect, objects: GRect[]): GRect[] {
//     const fillers: GRect[] = [];

//     // 1. Sort objects by their x, then y coordinates for efficient area division
//     const sortedObjects = objects.slice().sort((a, b) => (a.x - b.x) || (a.y - b.y));

//     // 2. Helper function to split a region by an object rectangle
//     function splitRegion(region: GRect, object: GRect): GRect[] {
//         const newRegions: GRect[] = [];

//         const spaceAbove = object.y - region.y;
//         const spaceBelow = (region.y + region.height) - (object.y + object.height);
//         const spaceLeft = object.x - region.x;
//         const spaceRight = (region.x + region.width) - (object.x + object.width);

//         // Determine if we have more vertical space or horizontal space
//         const maxVerticalSpace = Math.max(spaceAbove, spaceBelow);
//         const maxHorizontalSpace = Math.max(spaceLeft, spaceRight);

//         // Prefer splitting in the direction that keeps regions closer to square
//         if (maxVerticalSpace >= maxHorizontalSpace) {
//             // Split vertically, creating top and bottom regions
//             if (spaceAbove > 0) {
//                 newRegions.push({
//                     x: region.x,
//                     y: region.y,
//                     width: region.width,
//                     height: spaceAbove - 1  // 1-pixel buffer
//                 });
//             }
//             if (spaceBelow > 0) {
//                 newRegions.push({
//                     x: region.x,
//                     y: object.y + object.height + 1,  // 1-pixel buffer
//                     width: region.width,
//                     height: spaceBelow - 1
//                 });
//             }
//         } else {
//             // Split horizontally, creating left and right regions
//             if (spaceLeft > 0) {
//                 newRegions.push({
//                     x: region.x,
//                     y: region.y,
//                     width: spaceLeft - 1,  // 1-pixel buffer
//                     height: region.height
//                 });
//             }
//             if (spaceRight > 0) {
//                 newRegions.push({
//                     x: object.x + object.width + 1,  // 1-pixel buffer
//                     y: region.y,
//                     width: spaceRight - 1,
//                     height: region.height
//                 });
//             }
//         }

//         return newRegions;
//     }

//     // 3. Start with the entire parent rectangle as the initial empty region
//     let emptyRegions: GRect[] = [zone];

//     // 4. For each object, update empty regions by splitting any region that intersects with it
//     for (const object of sortedObjects) {
//         const newEmptyRegions: GRect[] = [];

//         for (const region of emptyRegions) {
//             if (
//                 object.x < region.x + region.width &&
//                 object.x + object.width > region.x &&
//                 object.y < region.y + region.height &&
//                 object.y + object.height > region.y
//             ) {
//                 // Split region into smaller regions around the object
//                 newEmptyRegions.push(...splitRegion(region, object));
//             } else {
//                 // If there's no overlap, keep the region as is
//                 newEmptyRegions.push(region);
//             }
//         }

//         emptyRegions = newEmptyRegions;
//     }

//     // 5. Create the largest possible filler rectangles for each remaining empty region
//     for (const region of emptyRegions) {
//         fillers.push(region);
//     }

//     return fillers;
// }