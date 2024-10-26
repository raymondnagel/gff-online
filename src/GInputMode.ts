import { GKeyList } from "./types";

export class GInputMode {

    private name: string;
    private scene: Phaser.Scene;
    private allowedEvents: string[] = [];
    private pollKeys: GKeyList = {};
    private heldKeys: Set<string> = new Set();
    private repeatPressKeys: string[] = [];
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

    public allowRepeats(keys: string|string[]) {
        if (Array.isArray(keys)) {
            this.repeatPressKeys.push(...keys);
        } else {
            this.repeatPressKeys.push(keys);
        }
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

    public clearKeypressStates() {
        // console.log(`${this.name}: cleared key states!`);
        this.heldKeys.clear();
    }

    public processKeyDown(keyEvent: KeyboardEvent) {
        if (!this.heldKeys.has(keyEvent.key)) {
            // Key wasn't already held; hold down and continue:
            this.heldKeys.add(keyEvent.key);
        } else {
            // console.log(`Key already held! ${keyEvent.key}`);
            // Key was already held...
            if (!this.repeatPressKeys.includes(keyEvent.key)) {
                // Repeat not allowed for this key; return:
                return;
            }
            // Repeat is allowed for this key; continue
        }
        if (this.onProcessKeyDown !== undefined) {
            // console.log(`${this.name}: keyDown(${keyEvent.key})`);
            this.onProcessKeyDown.call(this.scene, keyEvent);
        }
    }

    public processKeyUp(keyEvent: KeyboardEvent) {
        this.heldKeys.delete(keyEvent.key);
        if (this.onProcessKeyUp !== undefined) {
            // console.log(`${this.name}: keyUp(${keyEvent.key})`);
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