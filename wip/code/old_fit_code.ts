// public fitScenery(objectWidth: number, objectHeight: number, objects: GRect[], zones?: GRect[]): GRect|null {
//     // Helper to calculate the bounding box where an object can fit in a zone without overlap
//     const getAvailableArea = (zone: GRect): GRect => ({
//         x: zone.x,
//         y: zone.y,
//         width: zone.width - objectWidth,
//         height: zone.height - objectHeight,
//     });

//     // Subtract occupied space from an area by splitting it into available areas around the object
//     const subtractObjectFromArea = (area: GRect, obj: GRect): GRect[] => {
//         const newAreas: GRect[] = [];

//         // Split around the object only if there is an overlap
//         if (obj.x > area.x) {
//             const leftArea = { x: area.x, y: area.y, width: obj.x - area.x, height: area.height };
//             if (leftArea.width >= objectWidth) newAreas.push(leftArea);
//         }
//         if (obj.y > area.y) {
//             const topArea = { x: area.x, y: area.y, width: area.width, height: obj.y - area.y };
//             if (topArea.height >= objectHeight) newAreas.push(topArea);
//         }
//         if (obj.x + obj.width < area.x + area.width) {
//             const rightArea = {
//                 x: obj.x + obj.width,
//                 y: area.y,
//                 width: area.x + area.width - (obj.x + obj.width),
//                 height: area.height,
//             };
//             if (rightArea.width >= objectWidth) newAreas.push(rightArea);
//         }
//         if (obj.y + obj.height < area.y + area.height) {
//             const bottomArea = {
//                 x: area.x,
//                 y: obj.y + obj.height,
//                 width: area.width,
//                 height: area.y + area.height - (obj.y + obj.height),
//             };
//             if (bottomArea.height >= objectHeight) newAreas.push(bottomArea);
//         }

//         return newAreas;
//     };

//     // Create a default zone if zones is undefined:
//     if (zones === undefined) {
//         zones = [ {x: GFF.ROOM_X, y: GFF.ROOM_Y, width: GFF.ROOM_W, height: GFF.ROOM_H} ];
//     }

//     // Calculate all potential placement areas by starting with zones and subtracting objects
//     let potentialAreas: GRect[] = zones.map(getAvailableArea);

//     // Subtract each placed object from each available area
//     objects.forEach(obj => {
//         potentialAreas = potentialAreas.flatMap(area =>
//             (area.x < obj.x + obj.width && area.x + area.width > obj.x &&
//              area.y < obj.y + obj.height && area.y + area.height > obj.y)
//                 ? subtractObjectFromArea(area, obj)
//                 : [area]
//         );
//     });

//     // Filter out areas that are too small to fit the object
//     potentialAreas = potentialAreas.filter(area => area.width >= objectWidth && area.height >= objectHeight);

//     // If there are valid areas remaining, select one randomly and place the object
//     if (potentialAreas.length > 0) {
//         const selectedArea: GRect = GRandom.randElement(potentialAreas);

//         // Choose a random X, Y within the selected area for the new object placement
//         const newX = GRandom.randInt(selectedArea.x, selectedArea.x + selectedArea.width - objectWidth);
//         const newY = GRandom.randInt(selectedArea.y, selectedArea.y + selectedArea.height - objectHeight);

//         // Placement successful
//         const placement: GRect = {x: newX, y: newY, width: objectWidth, height: objectHeight};
//         objects.push(placement);
//         return placement;
//     }

//     // No space available
//     return null;
// }