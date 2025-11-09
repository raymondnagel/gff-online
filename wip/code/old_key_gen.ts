    // private createKeys(): void {
    //     const lockLocations: RoomBorder[] = [];
    //     const totalRooms = this.getRooms();
    //     this.exploreContiguous(this.getEntranceRoom());
    //     let discoveredRooms = this.getRooms().filter(r => r.isDiscovered());
    //     let explorations = 0;
    //     GFF.genLog(`Exploration ${++explorations}: ${discoveredRooms.length} / ${totalRooms.length} rooms discovered.`);
    //     while (discoveredRooms.length < totalRooms.length) {
    //         // We haven't explored all rooms yet, so there must be locked door(s)

    //         // Create a key room that is already accessible
    //         this.createAccessibleKeyRoom(discoveredRooms);

    //         // Find a locked door in a discovered room
    //         const lockedDoors: RoomBorder[] = [];
    //         for (let room of discoveredRooms) {
    //             const lockedDoor = room.getAnyLockedDoor();
    //             if (lockedDoor) {
    //                 lockedDoors.push(lockedDoor);
    //             }
    //         }

    //         // Unlock the door for another round of exploration
    //         const doorToUnlock = RANDOM.randElement(lockedDoors) as RoomBorder|undefined;
    //         if (!doorToUnlock) {
    //             console.error('No locked door found, but there are still undiscovered rooms!');
    //             break;
    //         }
    //         lockLocations.push(doorToUnlock);
    //         this.setLockedDoorByRoom(doorToUnlock.room, doorToUnlock.dir, false);
    //         GFF.genLog(`Unlocked door at (${doorToUnlock.room.getX()},${doorToUnlock.room.getY()},${doorToUnlock.room.getFloor()}) dir ${doorToUnlock.dir}`);

    //         // Get the room on the other side of the door
    //         const neighboringRoom = doorToUnlock.room.getNeighbor(doorToUnlock.dir) as GRoom;

    //         // Explore all newly accessible rooms
    //         this.exploreContiguous(neighboringRoom);
    //         discoveredRooms = this.getRooms().filter(r => r.isDiscovered());
    //         GFF.genLog(`Exploration ${++explorations}: ${discoveredRooms.length} / ${totalRooms.length} rooms discovered.`);
    //     }

    //     // Finally, re-lock all locked doors for gameplay
    //     for (let lockLocation of lockLocations) {
    //         this.setLockedDoorByRoom(lockLocation.room, lockLocation.dir, true);
    //     }

    //     // Reset all rooms to undiscovered for gameplay
    //     for (let room of this.getRooms()) {
    //         room.conceal();
    //     }
    // }