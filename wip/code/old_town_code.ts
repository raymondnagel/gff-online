
    // public planCityBlock(block: GCityBlock, buildingPool: GSceneryDef[]) {
    //     this.addRoomLogEntry(`Block: name:${block.name} ${block.orientation} base:${block.base} start:${block.start} end:${block.end}`);

    //     const totalSpace: number = block.end - block.start;
    //     const buildings: GSceneryDef[] = [];
    //     let usedSpace: number = 0;

    //     // Add some buildings to the block:
    //     while (buildingPool.length > 0 && usedSpace < totalSpace) {
    //         const nextBuilding: GSceneryDef = buildingPool[buildingPool.length-1];
    //         const size: number = this.getBuildingSize(nextBuilding, block);

    //         if (size < totalSpace - usedSpace) {
    //             buildingPool.pop();
    //             buildings.push(nextBuilding);
    //             usedSpace += size;
    //         } else {
    //             // There wasn't room for the next building;
    //             // leave it in the pool and break out of the loop.
    //             break;
    //         }
    //     }

    //     const spaces: number[] = RANDOM.toSlices(totalSpace - usedSpace, buildings.length + 1);

    //     let p: number = block.start;
    //     for (let building of buildings) {
    //         p += (spaces.pop() as number);
    //         p += (this.positionBuilding(building, block, p));
    //     }
    // }

    // private positionBuilding(building: GSceneryDef, block: GCityBlock, p: number): number {
    //     let x: number, y: number, size: number;

    //     switch(block.anchor) {
    //         case 'top':
    //             x = p - building.body.x;
    //             y = block.base - building.body.y;
    //             size = building.body.width;
    //             break;
    //         case 'bottom':
    //             x = p - building.body.x;
    //             y = block.base - building.body.height - building.body.y;
    //             size = building.body.width;
    //             break;
    //         case 'left':
    //             x = block.base - building.body.x;
    //             y = p - building.body.y;
    //             size = building.body.height;
    //             break;
    //         case 'right':
    //             x = block.base - building.body.width - building.body.x;
    //             y = p - building.body.y;
    //             size = building.body.height;
    //             break;
    //     }
    //     this.addSceneryPlan(building.key, x, y);
    //     this.addRoomLogEntry(`Building:${building.key} x:${x} y:${y}`);
    //     return size;
    // }

    // private getBuildingSize(building: GSceneryDef, block: GCityBlock): number {
    //     switch(block.orientation) {
    //         case 'front':
    //         case 'back':
    //             return building.body.width;
    //         case 'side':
    //             return building.body.height;
    //     }
    // }