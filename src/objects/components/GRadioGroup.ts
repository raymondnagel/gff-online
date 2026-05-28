import { GRadioOption } from "./GRadioOption";

export class GRadioGroup {

    private options: GRadioOption[] = [];

    constructor(initialOptions: GRadioOption[] = []) {
        initialOptions.forEach(option => this.addOption(option));
    }

    public getOptions(): GRadioOption[] {
        return this.options;
    }

    /**
     * Don't use this method directly, use GRadioOption.setRadioGroup() instead.
     */
    public addOption(option: GRadioOption): void {
        option.setCheckState(false);
        this.options.push(option);
    }

    /**
     * This will be called by the option button when it is selected.
     * It will deselect all other options in the group.
     */
    public setSelection(option: GRadioOption): void {
        for (const opt of this.options) {
            if (opt !== option) {
                opt.setCheckState(false);
            }
        }
    }

    public getSelection(): GRadioOption|undefined {
        return this.options.find(opt => opt && opt.isChecked());
    }
}