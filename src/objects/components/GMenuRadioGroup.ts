import { GMenuRadioOption } from "./GMenuRadioOption";
import { GTextOptionButton } from "./GTextOptionButton";

export class GMenuRadioGroup {

    private options: GMenuRadioOption[] = [];

    constructor(initialOptions: GMenuRadioOption[] = []) {
        initialOptions.forEach(option => this.addOption(option));
    }

    public getOptions(): GMenuRadioOption[] {
        return this.options;
    }

    /**
     * Don't use this method directly, use GMenuRadioOption.setRadioGroup() instead.
     */
    public addOption(option: GMenuRadioOption): void {
        option.setCheckState(false);
        this.options.push(option);
    }

    /**
     * This will be called by the option button when it is selected.
     * It will deselect all other options in the group.
     */
    public setSelection(option: GMenuRadioOption): void {
        for (const opt of this.options) {
            if (opt !== option) {
                opt.setCheckState(false);
            }
        }
    }

    public getSelection(): GMenuRadioOption|undefined {
        return this.options.find(opt => opt && opt.isChecked());
    }
}