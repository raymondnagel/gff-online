/**
 * GBackgroundDecoration is an image that gets rendered directly over
 * the room background, without creating and managing a game
 * object. It doesn't need to be subclassed, because it has
 * no special features or interactions; it's only purpose is
 * to decorate the background.
 *
 * Background decoration images should be flat on the ground (not tall),
 * or at least nearly flat (short), like the shrine pedestal.
 *
 * Examples include a flower patch, carpet, or other visual
 * elements that can be walked over with no consequence.
 *
 * Background decorations ALWAYS appear behind the player.
 */
export class GBackgroundDecoration {

    private imageKey: string;
    private x: number;
    private y: number;
    private stoneTint?: number;

    constructor(imageKey: string, x: number, y: number, renderer: Phaser.GameObjects.RenderTexture, stoneTint?: number) {
        this.imageKey = imageKey;
        this.x = x;
        this.y = y;
        this.stoneTint = stoneTint;

        this.render(renderer);
    }

    public render(texture: Phaser.GameObjects.RenderTexture) {
        texture.draw(this.imageKey, this.x, this.y, 1, this.stoneTint);
    }

    public toString() {
        return this.imageKey;
    }
}