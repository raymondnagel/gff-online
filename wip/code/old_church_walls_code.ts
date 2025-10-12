    // private addInsideFullWallObjects(region: GInsideRegion = this.region as GInsideRegion) {
    //     const northWall: boolean = this.hasFullWall(Dir9.N);
    //     const westWall: boolean = this.hasFullWall(Dir9.W);
    //     const eastWall: boolean = this.hasFullWall(Dir9.E);
    //     const southWall: boolean = this.hasFullWall(Dir9.S);
    //     const wallSet: GInteriorWallSet = region.getWalls();

    //     // Add cardinal walls:
    //     if (northWall) {
    //         new GWallNorth(wallSet[Dir9.N] as GSceneryDef);
    //     }
    //     if (westWall) {
    //         new GWallWest(wallSet[Dir9.W] as GSceneryDef);
    //     }
    //     if (eastWall) {
    //         new GWallEast(wallSet[Dir9.E] as GSceneryDef);
    //     }
    //     if (southWall) {
    //         if (this.region instanceof GChurchRegion) {
    //             // For a church interior, southWall is set so it is shown on the map;
    //             // However, we need to do it in sections: the left and right sections
    //             // are solid walls, but the center section is the doorway, which will
    //             // be positioned above the player so he can walk under/through it.
    //             new GWallSouthWithDoor(
    //                 SCENERY.CHURCH_WALL_S_LEFT_DEF,
    //                 SCENERY.CHURCH_WALL_S_RIGHT_DEF,
    //                 SCENERY.CHURCH_WALL_S_DOORWAY_DEF
    //             );
    //         } else {
    //             new GWallSouth(wallSet[Dir9.S] as GSceneryDef);
    //         }
    //     }

    //     // Add any required corner pieces (for aesthetics):
    //     if (northWall && westWall) {
    //         new GWallNW(wallSet[Dir9.NW] as GSceneryDef);
    //     }
    //     if (northWall && eastWall) {
    //         new GWallNE(wallSet[Dir9.NE] as GSceneryDef);
    //     }
    //     if (southWall && westWall) {
    //         new GWallSW(wallSet[Dir9.SW] as GSceneryDef);
    //     }
    //     if (southWall && eastWall) {
    //         new GWallSE(wallSet[Dir9.SE] as GSceneryDef);
    //     }
    // }