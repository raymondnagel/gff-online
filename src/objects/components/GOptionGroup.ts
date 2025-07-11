import { GTextOptionButton } from "./GTextOptionButton";

export class GOptionGroup {

    private options: GTextOptionButton[] = [];

    constructor(initialOptions: GTextOptionButton[] = []) {
        initialOptions.forEach(option => this.addOption(option));
    }

    public getOptions(): GTextOptionButton[] {
        return this.options;
    }

    /**
     * Don't use this method directly, use GTextOptionButton.setOptionGroup() instead.
     */
    public addOption(option: GTextOptionButton): void {
        option.deselect();
        this.options.push(option);
    }

    public removeAllOptions(): void {
        this.options = [];
    }

    /**
     * This will be called by the option button when it is selected.
     * It will deselect all other options in the group.
     */
    public setSelection(option: GTextOptionButton): void {
        for (const opt of this.options) {
            if (opt !== option) {
                opt.deselect();
            }
        }
    }

    public getSelection(): GTextOptionButton|undefined {
        return this.options.find(opt => opt && opt.isSelected());
    }

    public selectPrevious(callFunction: boolean = true) {
        const currentSelection = this.getSelection();
        if (currentSelection) {
            const currentIndex = this.options.indexOf(currentSelection);
            const previousIndex = (currentIndex - 1 + this.options.length) % this.options.length;
            this.options[previousIndex].select(callFunction);
        } else if (this.options.length > 0) {
            this.options[0].select(callFunction);
        }
    }

    public selectNext(callFunction: boolean = true) {
        const currentSelection = this.getSelection();
        if (currentSelection) {
            const currentIndex = this.options.indexOf(currentSelection);
            const nextIndex = (currentIndex + 1) % this.options.length;
            this.options[nextIndex].select(callFunction);
        } else if (this.options.length > 0) {
            this.options[0].select(callFunction);
        }
    }
}