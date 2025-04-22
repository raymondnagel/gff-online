import { RANDOM } from "./random";
import { GFF } from "./main";
import { GCharSprite } from "./objects/chars/GCharSprite";
import { GChoiceBubble } from "./objects/GChoiceBubble";
import { GSpeechBubble } from "./objects/GSpeechBubble";
import { GThoughtBubble } from "./objects/GThoughtBubble";
import { PLAYER } from "./player";
import { CBlurb, CLabeledChar, COption, Dir9, GBubble, GPerson } from "./types";
import { GPlayerSprite } from "./objects/chars/GPlayerSprite";
import { GPersonSprite } from "./objects/chars/GPersonSprite";
import { FRUITS } from "./fruits";
import { GChurch } from "./GChurch";
import { GTown } from "./GTown";

type LeveledDynamicBlurb = {
    level: number;
    variants: string[];
};

const CMD_FUNCTIONS: Record<string, (...args: any[]) => any> = {
    /**
     * Pre/post commands (no return value): encoded in the JSON as
     * 'preCmd' or 'postCmd', depending on whether they should be
     * executed before the blurb appears, or after it disappears.
     */
    playPiano: (_player: GPlayerSprite, _someone: GCharSprite, songName: string) => {
        GFF.AdventureContent.getSound().setMusicVolume(0.6);
        GFF.AdventureContent.getSound().playMusic(songName);
        PLAYER.getSprite().play('adam_piano_ne', false);
    },
    stopPiano: (_player: GPlayerSprite, _someone: GCharSprite, ) => {
        GFF.AdventureContent.getSound().stopMusic();
        PLAYER.getSprite().play('adam_sit_ne', false);
    },
    endPiano: (_player: GPlayerSprite, _someone: GCharSprite, ) => {
        GFF.AdventureContent.playerFinishPiano();
    },
    prefFormalName: (_player: GPlayerSprite, someone: GCharSprite) => {
        if (someone instanceof GPersonSprite) {
            someone.getPerson().nameLevel = 1;
            someone.getPerson().preferredName = someone.getFormalName();
        }
    },
    prefInformalName: (_player: GPlayerSprite, someone: GCharSprite) => {
        if (someone instanceof GPersonSprite) {
            someone.getPerson().nameLevel = 2;
            someone.getPerson().preferredName = someone.getFirstName();
        }
    },
    preachFaith: (player: GPlayerSprite, someone: GCharSprite) => {
        const faithChange: number = RANDOM.randInt(5, 10 + FRUITS.getCount());
        CMD_FUNCTIONS.changeFaith(player, someone, faithChange);
    },
    changeFaith: (_player: GPlayerSprite, someone: GCharSprite, amount: number) => {
        if (someone instanceof GPersonSprite) {
            const sinner: GPerson = someone.getPerson();
            sinner.familiarity++;
            if (sinner.reprobate) {
                sinner.faith -= amount;
                sinner.faith = Math.max(sinner.faith, 0);
            } else {
                sinner.faith += amount;
                sinner.faith = Math.min(sinner.faith, 100);
            }

            if (sinner.faith >= 100) {
                // Conversion!
                const town: GTown = (sinner.homeTown as GTown);
                town.transferPersonToChurch(sinner);
                sinner.preferredName = someone.getSaintName();
            }
        }
    },
    useSeed: (player: GPlayerSprite, _someone: GCharSprite) => {
        player.showFloatingText('-1 seed');
        PLAYER.changeSeeds(-1);
    },
    familiarize: (_player: GPlayerSprite, someone: GCharSprite) => {
        if (someone instanceof GPersonSprite) {
            someone.getPerson().familiarity++;
        }
    },

    /**
     * Fork functions (return id of next blurb as a string): encoded in
     * the JSON as 'fork', these check a condition and return the id of the
     * next blurb to be executed.
     */
    branchToAny(_player: GPlayerSprite, _someone: GCharSprite, ...ids: string[]): string {
        return RANDOM.randElement(ids);
    },
    introCheck: (_player: GPlayerSprite, someone: GCharSprite, passId: string, failId: string): string => {
        if (someone instanceof GPersonSprite) {
            const chanceToIntro: number = someone.getPerson().faith + (someone.getPerson().familiarity * 10);
            if (chanceToIntro > RANDOM.randInt(0, 100)) {
                return passId;
            }
        }
        return failId;
    },
    isConvert: (_player: GPlayerSprite, someone: GCharSprite, passId: string, failId: string): string => {
        if (someone instanceof GPersonSprite) {
            if (someone.getPerson().faith >= 100) {
                return passId;
            }
        }
        return failId;
    },
    seedCheck: (_player: GPlayerSprite, _someone: GCharSprite, passId: string, failId: string): string => {
        return PLAYER.getSeeds() > 0 ? passId : failId;
    },
    coinFlip: (_player: GPlayerSprite, _someone: GCharSprite, headsId: string, tailsId: string): string => {
        return RANDOM.flipCoin() ? headsId : tailsId;
    },
    personMet: (_player: GPlayerSprite, someone: GCharSprite, metId: string, unmetId: string): string => {
        if (someone instanceof GPersonSprite) {
            return someone.getPerson().familiarity > 0 ? metId : unmetId;
        }
        return unmetId;
    },
    personKnown: (_player: GPlayerSprite, someone: GCharSprite, knownId: string, unknownId: string): string => {
        if (someone instanceof GPersonSprite) {
            return someone.getPerson().nameLevel > 0 ? knownId : unknownId;
        }
        return unknownId;
    },
    personCasual: (_player: GPlayerSprite, someone: GCharSprite, casualId: string, formalId: string): string => {
        if (someone instanceof GPersonSprite) {
            return someone.getPerson().nameLevel > 1 ? casualId : formalId;
        }
        return formalId;
    },

    /**
     * Level functions (return a level ID as a number): encoded in the
     * JSON as 'dynamicLevel', these allow creating dynamic blurb texts
     * based on a scale. For example, responses of people with high faith
     * vs. low faith.
     */
    faithLevel: (_player: GPlayerSprite, someone: GCharSprite): number => {
        if (someone instanceof GPersonSprite) {
            const faith: number = someone.getPerson().faith;
            const faithLevel: number = Math.floor(faith / 10);
            return Math.min(faithLevel, 10); // Return a max of 10, which indicates a convert
        }
        return 0;
    },

    // Example functions:
    // someFunc: (strParam: string, numParam: number) => {
    // },
    // anotherFunc: (num1: number, num2: number, num3: number) => {
    // },
    // noParamFunc: () => {
    // }
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
        if (chance === undefined || chance > RANDOM.randPct()) {

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

            // Create the bubble (can be skipped if no text or choice):
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
        const forkFunction: string|undefined = this.currentBlurb.fork;
        if (nextId !== undefined) {
            // We have the ID for next; use it to get the next blurb:
            const nextBlurb = this.getBlurbById(nextId);
            if (nextBlurb !== undefined) {
                this.currentBlurb = nextBlurb;
            } else {
                throw new Error(`Blurb id "${nextId}" not found!`);
            }
        } else {
            // There is no next; check for a choice or fork function:
            if (chosenOption !== undefined) {
                // An option was chosen; process it.
                const nextBlurb = this.getBlurbById(chosenOption);
                if (nextBlurb !== undefined) {
                    this.currentBlurb = nextBlurb;
                } else {
                    throw new Error(`Blurb id "${chosenOption}" not found!`);
                }
            } else if (forkFunction !== undefined) {
                // A fork function was called; execute it and get the next blurb:
                const nextId = this.executeForkFunctionCall(forkFunction);
                const nextBlurb = this.getBlurbById(nextId);
                if (nextBlurb !== undefined) {
                    this.currentBlurb = nextBlurb;
                } else {
                    throw new Error(`Blurb id "${nextId}" not found!`);
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
            // Dynamic text: random variant from a given class
            preparedText = this.getRandomDynamicText(this.currentBlurb.dynamic);
        } else if (this.currentBlurb.dynamicLevel !== undefined) {
            // Dynamic-by-level: random variant from a class, scaled by a given level
            preparedText = this.getDynamicTextByLevel(this.currentBlurb.dynamicLevel);
        } else if (this.currentBlurb.text !== undefined) {
            // Static text, exactly as we have it in the JSON
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
            const choice: COption[]|undefined = structuredClone(this.currentBlurb.choice);
            if (choice !== undefined) {
                // Create choice bubble
                choice.forEach(c => {
                    c.choiceText = this.replaceLabels(c.choiceText);
                });
                this.currentBubble = new GChoiceBubble(this.currentSpeaker, choice);
            } else {
                // No text or choice; this blurb is empty.
                this.finishBlurb(false);
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
            // If the speaker is idle, face south so we can see his face.
            if (this.currentSpeaker.isDoing('idle')) {
                this.currentSpeaker.faceDirection(Dir9.S, true);
            }

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
        let newText = text
            .replaceAll('SPEAKER_FIRST', this.currentSpeaker.getFirstName())
            .replaceAll('SPEAKER_LAST', this.currentSpeaker.getLastName())
            .replaceAll('SPEAKER_FULL', this.currentSpeaker.getName())
            .replaceAll('SPEAKER_FORMAL', this.currentSpeaker.getFormalName())
            .replaceAll('SPEAKER_SAINT', this.currentSpeaker.getSaintName())
            .replaceAll('SPEAKER_SEXTYPE', this.currentSpeaker.getSexType())
            .replaceAll('SPEAKER_POLITE', this.currentSpeaker.getPoliteType())
            .replaceAll('SPEAKER_HONOR', this.currentSpeaker.getHonorific())
            .replaceAll('SPEAKER_PREF', this.currentSpeaker.getPreferredName());
        if (this.currentHearer !== undefined) {
            newText = newText
                .replaceAll('HEARER_FIRST', this.currentHearer.getFirstName())
                .replaceAll('HEARER_LAST', this.currentHearer.getLastName())
                .replaceAll('HEARER_FULL', this.currentHearer.getFirstName())
                .replaceAll('HEARER_FORMAL', this.currentHearer.getFormalName())
                .replaceAll('HEARER_SAINT', this.currentHearer.getSaintName())
                .replaceAll('HEARER_SEXTYPE', this.currentHearer.getSexType())
                .replaceAll('HEARER_POLITE', this.currentHearer.getPoliteType())
                .replaceAll('HEARER_HONOR', this.currentHearer.getHonorific())
                .replaceAll('HEARER_PREF', this.currentHearer.getPreferredName());
        }
        return newText;
    }

    private getRandomDynamicText(dynamicClass: string): string {
        return RANDOM.randElement(GFF.GAME.cache.json.get(dynamicClass));
    }

    private getBlurbById(id: string): CBlurb|undefined {
        return this.blurbs.find(blurb => blurb.id === id);
    }

    private getRandomCharByLabel(label: string): GCharSprite {
        return RANDOM.randElement(this.getCharsByLabel(label));
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

    /**
     * This parsing works, but it is not very robust.
     * It will not correctly handle commas inside strings arguments, for example.
     */
    private parseCommand(command: string): {functionName: string, args: any[]} {
        // Match the function name and the arguments in parentheses
        const functionCallTokens: string[] = command.split('(');
        const functionName: string = functionCallTokens[0].trim();
        const argsString: string = functionCallTokens[1].slice(0, -1).trim();

        // Extract individual arguments by splitting on commas
        const args = argsString.split(',').map(arg => {
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

        return { functionName, args };
    }

    private executeFunctionCall(command: string): void {
        // Parse the command to get the function name and arguments
        const { functionName, args } = this.parseCommand(command);

        // Retrieve the function from CMD_FUNCTIONS
        const func = CMD_FUNCTIONS[functionName];

        if (typeof func !== "function") {
            throw new Error(`Function ${functionName} not found`);
        }

        const someone: GCharSprite|undefined = this.currentSpeaker !== PLAYER.getSprite() ?
        this.currentSpeaker :
        this.currentHearer;

        // Add player and the other person as arguments,
        // along with those parsed from the command string:
        const newArgs: any[] = [PLAYER.getSprite(), someone, ...args];
        func(...newArgs) as string;
    }

    /**
     * A 'fork' function will return the id for the next blurb.
     */
    private executeForkFunctionCall(command: string): string {
        // Parse the command to get the function name and arguments
        const { functionName, args } = this.parseCommand(command);

        // Retrieve the function from CMD_FUNCTIONS
        const func = CMD_FUNCTIONS[functionName];

        if (typeof func !== "function") {
            throw new Error(`Function ${functionName} not found`);
        }

        const someone: GCharSprite|undefined = this.currentSpeaker !== PLAYER.getSprite() ?
            this.currentSpeaker :
            this.currentHearer;

        // Add player and the other person as arguments,
        // along with those parsed from the command string:
        const newArgs: any[] = [PLAYER.getSprite(), someone, ...args];
        return func(...newArgs) as string;
    }

    /**
     * For dynamicLevel, we get the result of a given function, and
     * use that as an id ("level") to look up a dynamic text. We'll
     * return the text for the current blurb.
     */
    private getDynamicTextByLevel(dynamicLevel: string): string {
        // Separate the blurb class (file)
        const tokens: string[] = dynamicLevel.split(':');

        // Parse the command to get the function name and arguments
        const { functionName, args } = this.parseCommand(tokens[1]);

        // Retrieve the function from CMD_FUNCTIONS
        const func = CMD_FUNCTIONS[functionName];

        if (typeof func !== "function") {
            throw new Error(`Function ${functionName} not found`);
        }

        const someone: GCharSprite|undefined = this.currentSpeaker !== PLAYER.getSprite() ?
            this.currentSpeaker :
            this.currentHearer;

        // Add player and the other person as arguments,
        // along with those parsed from the command string:
        const newArgs: any[] = [PLAYER.getSprite(), someone, ...args];
        const levelId: number = func(...newArgs) as number;

        // Lookup the dynamic text using the levelId:
        const dynamicsByLevel: LeveledDynamicBlurb[] = GFF.GAME.cache.json.get(tokens[0]);
        const levelDynamics: LeveledDynamicBlurb = dynamicsByLevel.find(b => b.level === levelId) as LeveledDynamicBlurb;
        return RANDOM.randElement(levelDynamics.variants) as string;
    }
}