import { GDirection } from "./GDirection";
import { GRandom } from "./GRandom";
import { GFF } from "./main";
import { GCharSprite } from "./objects/chars/GCharSprite";
import { GChoiceBubble } from "./objects/GChoiceBubble";
import { GSpeechBubble } from "./objects/GSpeechBubble";
import { GThoughtBubble } from "./objects/GThoughtBubble";
import { PLAYER } from "./player";
import { CBlurb, CLabeledChar, COption, GBubble } from "./types";

const CMD_FUNCTIONS: Record<string, (...args: any[]) => any> = {
    // Sample functions:
    // someFunc: (strParam: string, numParam: number) => {
    // },
    // anotherFunc: (num1: number, num2: number, num3: number) => {
    // },
    // noParamFunc: () => {
    // }
    setMusic: (music: string) => {
        GFF.AdventureContent.getSound().playMusic(music);
    },
};

export class GConversation {

    private blurbs: CBlurb[];
    private participants: CLabeledChar[];
    private currentBlurb: CBlurb;
    private currentSpeaker: GCharSprite;
    private currentHearer: GCharSprite|undefined;
    private currentBubble: GBubble;
    private previousMusicVolume: number;
    private advance: boolean = false;

    constructor(blurbs: CBlurb[], participants?: CLabeledChar[]) {
        GFF.AdventureContent.setConversation(this);
        this.blurbs = blurbs;

        // Can create a conversation without a list of participants;
        // but in any case, it will always have at least the player:
        this.participants = participants ?? [];
        this.participants.push({ label: 'player', char: PLAYER.getSprite() });

        // Let's fade the music to the background:
        this.previousMusicVolume = GFF.AdventureContent.getSound().getMusicVolume();
        GFF.AdventureContent.getSound().setMusicVolume(.2);

        // Turn off nametags so they don't get in the way of bubbles:
        GFF.showNametags = false;

        // Pause all participants so they will pay attention!
        this.pauseParticipants();

        // Begin the first blurb of the conversation:
        this.startBlurb();
    }

    /**
     * Begins the current blurb.
     * If the conversation is just starting, there is no
     * current blurb yet, and the first one becomes current.
     */
    public startBlurb() {
        // Start with the first blurb:
        if (this.currentBlurb === undefined) {
            this.currentBlurb = this.blurbs[0];
        }

        // Only process this blurb if it always occurs,
        // or its chance was rolled:
        const chance: number|undefined = this.currentBlurb.chance;
        if (chance === undefined || chance > GRandom.randPct()) {

            // Run pre-command, if it exists:
            const preCmd: string|undefined = this.currentBlurb.preCmd;
            if (preCmd !== undefined) {
                this.runCommand(preCmd);
            }

            // Set the speaker:
            this.setSpeaker(this.currentBlurb.speaker);

            // Set hearer (could be undefined):
            this.setHearer(this.currentBlurb.hearer);

            // Orient the participants:
            this.orientParticipants();

            // Create the bubble:
            this.createBubble();

        } else {
            // Skip the entire blurb, including postCmd:
            this.finishBlurb(false);
        }

    }

    /**
     * Finishes the current blurb.
     * Should be called when [Enter] has been pressed, either
     * to continue on speech bubble or to make a selection on
     * a choice bubble.
     */
    public finishBlurb(runPostCmd: boolean, chosenOption?: string) {
        this.currentBubble?.destroy();

        // Run post-command, if it exists:
        const postCmd: string|undefined = this.currentBlurb.postCmd;
        if (postCmd !== undefined) {
            this.runCommand(postCmd);
        }

        const nextId: string|undefined = this.currentBlurb.next;
        if (nextId !== undefined) {
            // We have the ID for next; use it to get the next blurb:
            const nextBlurb = this.getBlurbById(nextId);
            if (nextBlurb !== undefined) {
                this.currentBlurb = nextBlurb;
            } else {
                throw new Error(`Blurb id "${nextId}" not found!`);
            }
        } else {
            // There is no next; check for a choice:
            if (chosenOption !== undefined) {
                // An option was chosen; process it.
                const nextBlurb = this.getBlurbById(chosenOption);
                if (nextBlurb !== undefined) {
                    this.currentBlurb = nextBlurb;
                } else {
                    throw new Error(`Blurb id "${chosenOption}" not found!`);
                }
            } else {
                // There's no way to move forward to another blurb;
                // we have reached the end of the conversation.
                this.end();
                return;
            }
        }

        // Blurb is finished: start the next blurb:
        this.startBlurb();
    }

    /**
     * Creates one of three types of bubbles, depending on the blurb content
     */
    private createBubble() {
        let preparedText: string|undefined;
        if (this.currentBlurb.dynamic !== undefined) {
            // Dynamic text: look up and assign to text, something like this:
            preparedText = this.getRandomDynamicText(this.currentBlurb.dynamic);
        } else if (this.currentBlurb.text !== undefined) {
            preparedText = this.currentBlurb.text;
        }

        if (preparedText !== undefined) {
            // Replace any labels used in the text:
            preparedText = this.replaceLabels(preparedText);

            if (preparedText.startsWith('(T)')) {
                preparedText = preparedText.replace('(T)', '');
                // Create thought bubble
                this.currentBubble = new GThoughtBubble(this.currentSpeaker, preparedText);
            } else {
                // Create speech bubble
                this.currentBubble = new GSpeechBubble(this.currentSpeaker, preparedText);
            }
        } else {
            const choice: COption[]|undefined = this.currentBlurb.choice;
            if (choice !== undefined) {
                // Create choice bubble
                this.currentBubble = new GChoiceBubble(this.currentSpeaker, choice);
            }
        }
    }

    private setSpeaker(speaker: string) {
        switch(speaker) {
            case 'player':
            case 'churchgoer':
            case 'other':
            case 'preacher':
                this.currentSpeaker = this.getRandomCharByLabel(speaker);
                break;
            default:
                throw new Error(`Unknown speaker type: ${speaker}`);
        }
    }

    private setHearer(hearer: string|undefined) {
        if (hearer === undefined) {
            this.currentHearer = undefined;
            return;
        }
        switch(hearer) {
            case 'player':
            case 'churchgoer':
            case 'other':
            case 'preacher':
                this.currentHearer = this.getRandomCharByLabel(hearer);
                break;
            default:
                throw new Error(`Unknown hearer type: ${hearer}`);
        }
    }

    private orientParticipants() {
        // If there is a hearer defined, this is a 1-on-1 conversation:
        if (this.currentHearer !== undefined) {
            // Let the speaker and the hearer face each other.
            this.currentSpeaker.faceChar(this.currentHearer, true);
            this.currentHearer.faceChar(this.currentSpeaker, true);

        // If there's only one participant, it is the player:
        } else if (this.participants.length === 1) {
            // Let the speaker face south so we can see his face.
            this.currentSpeaker.faceDirection(GDirection.Dir9.S, true);

        // Otherwise, it's a group conversation:
        } else {
            // Let everyone who isn't the speaker face the speaker:
            this.participants.forEach(p => {
                p.char.faceChar(this.currentSpeaker, true);
            });
        }
    }

    private runCommand(cmd: string) {
        // Commands won't be anything fancy, but will enable calling functions
        // with arguments.
        const codeLines: string[] = cmd.split(';');
        codeLines.forEach(c => {
            this.executeFunctionCall(c);
        });
    }

    private replaceLabels(text: string): string {
        text = text
            .replaceAll('SPEAKER_FIRST', this.currentSpeaker.getFirstName())
            .replaceAll('SPEAKER_FULL', this.currentSpeaker.getName())
            .replaceAll('SPEAKER_FORMAL', GConversation.getFormalName(this.currentSpeaker))
            .replaceAll('SPEAKER_CHURCH', GConversation.getChurchName(this.currentSpeaker))
            .replaceAll('SPEAKER_SEXTYPE', GConversation.getSexType(this.currentSpeaker))
            .replaceAll('SPEAKER_POLITE', GConversation.getPoliteType(this.currentSpeaker))
            .replaceAll('SPEAKER_HONOR', GConversation.getHonorific(this.currentSpeaker));
        if (this.currentHearer !== undefined) {
            text = text
                .replaceAll('HEARER_FIRST', this.currentHearer.getFirstName())
                .replaceAll('HEARER_FULL', this.currentHearer.getFirstName())
                .replaceAll('HEARER_FORMAL', GConversation.getFormalName(this.currentHearer))
                .replaceAll('HEARER_CHURCH', GConversation.getChurchName(this.currentHearer))
                .replaceAll('HEARER_SEXTYPE', GConversation.getSexType(this.currentHearer))
                .replaceAll('HEARER_POLITE', GConversation.getPoliteType(this.currentHearer))
                .replaceAll('HEARER_HONOR', GConversation.getHonorific(this.currentHearer));
        }
        return text;
    }

    private getRandomDynamicText(dynamicClass: string): string {
        return GRandom.randElement(GFF.GAME.cache.json.get(dynamicClass));
    }

    private getBlurbById(id: string): CBlurb|undefined {
        return this.blurbs.find(blurb => blurb.id === id);
    }

    private getRandomCharByLabel(label: string): GCharSprite {
        return GRandom.randElement(this.getCharsByLabel(label));
    }

    private getCharsByLabel(label: string): GCharSprite[] {
        const foundChars: GCharSprite[] = this.participants.filter(
            labeledChar => labeledChar.label === label
        ).map(
            labeledChar => labeledChar.char
        );
        if (foundChars.length > 0) {
            return foundChars;
        } else {
            throw new Error(`No characters found for conversation label: ${label}`);
        }
    }

    private pauseParticipants() {
        this.participants.forEach(p => {
            p.char.setBusyTalking(true);
        });
    }

    private unpauseParticipants() {
        this.participants.forEach(p => {
            p.char.setBusyTalking(false);
        });
    }

    public sendKey(key: 'Enter'|'ArrowUp'|'ArrowDown') {
        switch(key) {
            case 'Enter':
                if (this.currentBubble.isComplete()) {
                    this.advance = true;
                }
                break;
            case 'ArrowUp':
            case 'ArrowDown':
                if (this.currentBubble instanceof GChoiceBubble) {
                    this.currentBubble.changeSelection(key.replace('Arrow', '') as 'Up'|'Down');
                }
                break;
        }
    }

    public update(): void {
        this.currentBubble.update();
        if (this.advance) {
            this.advance = false;

            let chosenOption: string|undefined = undefined;
            if (this.currentBubble instanceof GChoiceBubble) {
                chosenOption = this.currentBubble.getSelectedOption();
            }
            this.finishBlurb(true, chosenOption);
        }
    }

    private end() {
        // Cleanup anything that might be left
        GFF.AdventureContent.getSound().setMusicVolume(this.previousMusicVolume);
        GFF.AdventureContent.clearConversation();
        this.unpauseParticipants();
    }

    public static fromFile(convKey: string, chars?: CLabeledChar[]): GConversation {
        let blurbs: CBlurb[] = GFF.GAME.cache.json.get(convKey);
        return new GConversation(blurbs, chars);
    }

    private static getFormalName(char: GCharSprite): string {
        return (
            char.getGender() === 'm'
            ? 'Mr. '
            : 'Ms. '
        ) + char.getLastName();
    }
    private static getChurchName(char: GCharSprite): string {
        return (
            char.getGender() === 'm'
            ? 'Brother '
            : 'Sister '
        ) + char.getFirstName();
    }
    private static getSexType(char: GCharSprite): string {
        return (
            char.getGender() === 'm'
            ? 'man'
            : 'woman'
        );
    }
    private static getPoliteType(char: GCharSprite): string {
        return (
            char.getGender() === 'm'
            ? 'gentleman'
            : 'lady'
        );
    }
    private static getHonorific(char: GCharSprite): string {
        return (
            char.getGender() === 'm'
            ? 'sir'
            : 'madam'
        );
    }

    private executeFunctionCall(command: string) {
        // Match the function name and the arguments in parentheses
        const functionCallRegex = /^([a-zA-Z_][a-zA-Z0-9_]*)\((.*)\)$/;
        const match = command.match(functionCallRegex);

        if (!match) {
            throw new Error("Invalid function call format");
        }

        const functionName = match[1];
        const argsString = match[2];

        // Extract individual arguments by splitting on commas, taking care of quotes
        const args = argsString.split(/,(?![^']*')/).map(arg => {
            arg = arg.trim();

            // Check if the argument is a string (starts and ends with a single quote)
            if (arg.startsWith("'") && arg.endsWith("'")) {
                return arg.slice(1, -1); // Remove the quotes
            }

            // Otherwise, parse it as a number
            const parsedNumber = Number(arg);
            if (isNaN(parsedNumber)) {
                throw new Error("Invalid number argument");
            }

            return parsedNumber;
        });

        // Retrieve the function from CMD_FUNCTIONS
        const func = CMD_FUNCTIONS[functionName];

        if (typeof func !== "function") {
            throw new Error(`Function ${functionName} not found`);
        }

        // Call the function with the parsed arguments
        func(...args);
    }
}