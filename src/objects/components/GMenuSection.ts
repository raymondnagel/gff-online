import { GBaseScene } from "../../scenes/GBaseScene";
import { BoundedGameObject, GColor } from "../../types";
import { GMenuTextOption } from "./GMenuTextOption";

export class GMenuSection {
    private focusIndex: number = 0;
    private title: Phaser.GameObjects.Text;
    private options: GMenuTextOption[];
    private otherComponents: BoundedGameObject[];

    constructor(scene: GBaseScene, title: string, titleColor: GColor, titleY: number) {
        this.options = [];
        this.otherComponents = [];

        this.title = scene.add.text(512, titleY, title, {
            color: titleColor.str(),
            fontFamily: 'dyonisius',
            fontSize: '64px'
        }).setOrigin(.5, 0);
    }

    public getTitle(): string {
        return this.title.text;
    }

    /**
     * Adds a new option and returns its bottom (Y),
     * so that the next option can be placed below it.
     */
    public addOption(option: GMenuTextOption): number {
        this.options.push(option);
        return option.y + option.height;
    }

    public getOptions(): GMenuTextOption[] {
        return this.options;
    }

    public addOtherComponent(component: BoundedGameObject): number {
        this.otherComponents.push(component);
        return component.y + component.height;
    }

    public getOtherComponents(): BoundedGameObject[] {
        return this.otherComponents;
    }

    /**
     * Clear the highlight, but leave the focus index unchanged.
     * This will typically be called when the user moves the mouse, so the
     * highlight will be controlled by the hover state instead of the focus.
     *
     * If an arrow key is pressed, we'll hide the mouse and highlight the focused
     * option.
     */
    public clearFocusHighlight() {
        this.getFocusedOption()?.removeFocus();
    }

    public restoreFocusHighlight() {
        this.getFocusedOption()?.setFocus();
    }

    public focusFirstOption() {
        if (this.options.length === 0) return;
        this.focusIndex = 0;
        this.getFocusedOption()?.setFocus();
    }

    public focusPreviousOption() {
        if (this.options.length === 0) return;

        this.clearFocusHighlight();
        this.focusIndex = (this.focusIndex - 1 + this.options.length) % this.options.length;
        this.getFocusedOption()?.setFocus();
    }

    public focusNextOption() {
        if (this.options.length === 0) return;

        this.clearFocusHighlight();
        this.focusIndex = (this.focusIndex + 1) % this.options.length;
        this.getFocusedOption()?.setFocus();
    }

    public getFocusIndex(): number {
        return this.focusIndex;
    }

    public getFocusedOption(): GMenuTextOption|undefined {
        return this.options[this.focusIndex];
    }

    public setVisible(visible: boolean) {
        this.title.setVisible(visible);
        for (const option of this.options) {
            option.setVisible(visible);
        }
        for (const component of this.otherComponents) {
            if ('setVisible' in component && typeof component.setVisible === 'function') {
                component.setVisible(visible);
            }
        }
    }
}