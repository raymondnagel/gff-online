import { GKeyList } from "./types";

export class GInputMode {

    private name: string;
    private scene: Phaser.Scene;
    private allowedEvents: string[] = [];
    private pollKeys: GKeyList = {};
    private onProcessKeyDown: ((keyEvent: KeyboardEvent) => void)|undefined = undefined;
    private onProcessKeyUp: ((keyEvent: KeyboardEvent) => void)|undefined = undefined;

    constructor(name: string) {
        this.name = name;
    }

    public setScene(scene: Phaser.Scene) {
        this.scene = scene;
    }

    public getName(): string {
        return this.name;
    }

    public addAllowedEvent(eventType: string) {
        this.allowedEvents.push(eventType);
    }

    public isEventAllowed(eventType: string): boolean {
        return this.allowedEvents.includes(eventType);
    }

    public addPollKeys(pollKeys: string[]) {
        pollKeys.forEach(k => {
            // Because this string is used in addKey, it needs to be "Up" here, not "ArrowUp" as in eventKey.key
            this.pollKeys[k] = (this.scene.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin).addKey(k);
        });
    }

    public getPollKeys(): GKeyList {
        return this.pollKeys;
    }

    public pollKey(key: string): boolean {
        return this.pollKeys[key] && (this.scene.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin).checkDown(this.pollKeys[key]);
    }

    public processKeyDown(keyEvent: KeyboardEvent) {
        if (this.onProcessKeyDown !== undefined) {
            this.onProcessKeyDown.call(this.scene, keyEvent);
        }
    }

    public processKeyUp(keyEvent: KeyboardEvent) {
        if (this.onProcessKeyUp !== undefined) {
            this.onProcessKeyUp.call(this.scene, keyEvent);
        }
    }

    public onKeyDown(fn: (keyEvent: KeyboardEvent) => void) {
        this.onProcessKeyDown = fn;
    }

    public onKeyUp(fn: (keyEvent: KeyboardEvent) => void) {
        this.onProcessKeyUp = fn;
    }
}