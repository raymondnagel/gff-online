const INDEFINITE: number = -1;

export abstract class GEventTrigger {

    private name: string;
    private maxTimes: number;
    private doneTimes: number = 0;

    constructor(name: string, times: number = INDEFINITE) {
        this.name = name;
        this.maxTimes = times;
    }

    public getName() {
        return this.name;
    }

    public process() {
        if (
            (this.maxTimes === INDEFINITE || this.doneTimes < this.maxTimes) &&
            this.condition()
        ) {
            this.action();
            this.doneTimes++;
        }
    }

    public resetTimes(): void {
        this.doneTimes = 0;
    }

    protected abstract condition(): boolean;

    protected abstract action(): void;

}