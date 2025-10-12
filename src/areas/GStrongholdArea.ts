import { GRoom } from "../GRoom";
import { GFF } from "../main";
import { GStrongholdRegion } from "../regions/GStrongholdRegion";
import { GBuildingArea } from "./GBuildingArea";

export class GStrongholdArea extends GBuildingArea {
    private entranceRoom: GRoom;

    constructor(strongholdName: string, width: number, height: number, floorImageKeys: string[]) {
        super(
            strongholdName,
            'stronghold',
            floorImageKeys.length,
            width,
            height
        );

        this.loadFloors(floorImageKeys);
    }

    public isSafe(): boolean {
        return false;
    }

    public getEntranceRoom(): GRoom {
        return this.entranceRoom;
    }

    protected initRoom(room: GRoom): void {
        super.initRoom(room);
        room.setRegion(new GStrongholdRegion());
    }

    protected loadFloors(floorImageKeys: string[]): void {
        const canvasTex = GFF.GAME.textures.createCanvas('floorPxMapCanvas', this.getWidth(), this.getHeight()) as Phaser.Textures.CanvasTexture;
        const ctx = canvasTex.getContext();
        for (let i = 0; i < floorImageKeys.length; i++) {
            const floorImageKey = floorImageKeys[i];
            this.loadFloor(floorImageKey, i, ctx);
        }
        GFF.GAME.textures.remove('floorPxMapCanvas');
    }

    protected loadFloor(floorImageKey: string, floorIndex: number, ctx: CanvasRenderingContext2D): void {
        const img = GFF.GAME.textures.get(floorImageKey).getSourceImage() as HTMLImageElement;
        ctx.clearRect(0, 0, this.getWidth(), this.getHeight());
        ctx.drawImage(img, 0, 0);
        for (let y = 0; y < this.getHeight(); y++) {
                for (let x = 0; x < this.getWidth(); x++) {
                const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
                const key = `${r},${g},${b}`;
                // console.log(`Pixel at (${x},${y}) - RGB: ${key}`);
                switch (key) {
                    case '0,0,0': // Black (wall / no room)
                        break;
                    case '255,255,255': // White (basic room)
                        this.createRoom(floorIndex, x, y);
                        break;
                    case '255,0,0': // Red (entrance room)
                        this.entranceRoom = this.createRoom(floorIndex, x, y);
                        break;
                }
            }
        }
        this.createOuterBorder(floorIndex);
    }

    protected createRoom(floor: number, x: number, y: number): GRoom {
        const room = new GRoom(floor, x, y, this);
        this.setRoom(floor, x, y, room);
        this.initRoom(room);
        return room;
    }
}
