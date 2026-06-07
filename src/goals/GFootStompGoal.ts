import { GPlayerSprite } from "../objects/chars/GPlayerSprite";
import { GGoal } from "./GGoal";

export class GFootStompGoal extends GGoal {

    private finished: boolean = false;

    constructor() {
        super('foot stomp');
    }

    public start(): void {
        (this.char as GPlayerSprite).footStomp(undefined, () => {
            this.finished = true;
        });
    }

    public doStep(_time: number, _delta: number): void {
    }

    public isAchieved(): boolean {
        return this.finished;
    }
}
