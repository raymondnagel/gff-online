import 'phaser';
import { GForegroundDecoration } from './GForegroundDecoration';
import { SCENERY } from '../../scenery';
import { DEPTH } from '../../depths';
import { RANDOM } from '../../random';

/**
 * GCorruptionPatch is essentially a background decoration; but since
 * it has a special animation, it is implemented as a game object.
 */
export class GCorruptionPatch extends GForegroundDecoration {

    private expanding: boolean = true;
    private rotationDirection: number = RANDOM.flipCoin() ? 1 : -1;

    constructor(x: number, y: number, startScale: number) {
        super(SCENERY.def('corruption_patch'), x, y);
        this.setOrigin(.5, .5);
        this.setDepth(DEPTH.BG_DECOR);
        this.setScale(startScale);
    }

    public update(delta: number): void {
        if (this.expanding) {
            this.setScale(this.scale + (0.0003 * delta));
            if (this.scale >= 1.2) {
                this.expanding = false;
            }
        } else {
            this.setScale(this.scale - (0.0003 * delta));
            if (this.scale <= .8) {
                this.expanding = true;
            }
        }
        this.setAlpha(this.scale / 1.2);
        const angle = this.angle + (0.01 * delta) * this.rotationDirection;
        this.setAngle(angle);
    }
}