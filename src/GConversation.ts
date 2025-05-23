import { RANDOM } from "./random";
import { GFF } from "./main";
import { GCharSprite } from "./objects/chars/GCharSprite";
import { GChoiceBubble } from "./objects/GChoiceBubble";
import { GSpeechBubble } from "./objects/GSpeechBubble";
import { GThoughtBubble } from "./objects/GThoughtBubble";
import { PLAYER } from "./player";
import { CBlurb, CLabeledChar, ConversationType, COption, Dir9, GBubble, GPerson, LeveledDynamicBlurb } from "./types";
import { GPlayerSprite } from "./objects/chars/GPlayerSprite";
import { GPersonSprite } from "./objects/chars/GPersonSprite";
import { FRUITS } from "./fruits";
import { GTown } from "./GTown";
import { GRejoiceGoal } from "./goals/GRejoiceGoal";
import { PEOPLE } from "./people";
import { GRoom } from "./GRoom";
import { AREA } from "./area";
import { GStronghold } from "./GStronghold";
import { GPopup } from "./objects/components/GPopup";
import { COLOR } from "./colors";
import { EFFECTS } from "./effects";
import { DEPTH } from "./depths";

const CMD_FUNCTIONS: Record<string, (...args: any[]) => any> = {
    /**
     * Pre/post commands (no return value): encoded in the JSON as
     * 'preCmd' or 'postCmd', depending on whether they should be
     * executed before the blurb appears, or after it disappears.
     */
    playSound: (_player: GPlayerSprite, _someone: GCharSprite, soundName: string) => {
        GFF.AdventureContent.getSound().playSound(soundName);
    },
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
        someone.getPerson().nameLevel = 1;
        someone.getPerson().preferredName = PEOPLE.getFormalName(someone.getPerson());
    },
    prefInformalName: (_player: GPlayerSprite, someone: GCharSprite) => {
        someone.getPerson().nameLevel = 2;
        someone.getPerson().preferredName = someone.getFirstName();
    },
    preachFaith: (player: GPlayerSprite, someone: GCharSprite) => {
        const faithChange: number = RANDOM.randInt(5, 10 + FRUITS.getCount());
        CMD_FUNCTIONS.changeFaith(player, someone, faithChange, true);
    },
    changeFaith: (_player: GPlayerSprite, someone: GCharSprite, amount: number, canConvert: boolean = false) => {
        const sinner: GPerson = someone.getPerson();
        sinner.familiarity++;
        if (sinner.reprobate) {
            sinner.faith -= amount;
            sinner.faith = Math.max(sinner.faith, 0);
        } else {
            sinner.faith += amount;
            sinner.faith = Math.min(sinner.faith, 100);
        }
        if (!canConvert) {
            sinner.faith = Math.min(sinner.faith, 99);
        }
        if (sinner.faith >= 100) {
            someone.setImmobile(true);
            someone.kneel();
        }
    },
    conversionMiracle: (player: GPlayerSprite, someone: GCharSprite) => {
        CMD_FUNCTIONS.useSeed(player, someone);
        const convert: GPerson = someone.getPerson();
        const town: GTown = (convert.homeTown as GTown);
        town.transferPersonToChurch(convert);
        convert.preferredName = PEOPLE.getSaintName(convert);
        (someone as GPersonSprite).generateBio(true);
        (someone as GPersonSprite).setNewConvert();
        (someone as GPersonSprite).setReadyToTalk(true);
        GFF.AdventureContent.getSound().playSound('hallelujah');
        GFF.AdventureContent.fadeOut(500, COLOR.WHITE.num(), () => {
            GFF.AdventureContent.fadeIn(500, COLOR.WHITE.num(), () => {
                CMD_FUNCTIONS.rejoiceEvermore(player, someone);
            });
        });
    },
    useSeed: (player: GPlayerSprite, _someone: GCharSprite) => {
        player.showFloatingText('-1 seed');
        PLAYER.changeSeeds(-1);
    },
    giftSeed: (_player: GPlayerSprite, _someone: GCharSprite) => {
        GFF.canGiftSeed = false;
        GFF.AdventureContent.forceAdventureInputMode();
        GPopup.createItemPopup('seed').onClose(() => {
            PLAYER.changeSeeds(1);
        });
    },
    familiarize: (_player: GPlayerSprite, someone: GCharSprite) => {
        someone.getPerson().familiarity++;
    },
    inviteCompanion: (_player: GPlayerSprite, someone: GCharSprite) => {
        PLAYER.setCompanion(someone.getPerson());
    },
    dismissCompanion: (_player: GPlayerSprite, _someone: GCharSprite) => {
        PLAYER.setCompanion(null);
    },
    rejoiceEvermore: (_player: GPlayerSprite, someone: GCharSprite) => {
        const rejoice: GRejoiceGoal = new GRejoiceGoal();
        rejoice.setInterruptable(false);
        someone.setGoal(rejoice);
    },
    preachSonic: (player: GPlayerSprite, _someone: GCharSprite) => {
        const sX: number = player.x + 42;
        const sY: number = player.y + 42;
        EFFECTS.doEffect('preach_sonic', GFF.AdventureContent, sX, sY, 0.5, 0.5)
            .setDepth(DEPTH.SPECIAL_EFFECT);
    },
    cheatFaith: (_player: GPlayerSprite, _someone: GCharSprite) => {
        PLAYER.setFaith(PLAYER.getMaxFaith());
    },
    cheatNoFaith: (_player: GPlayerSprite, _someone: GCharSprite) => {
        PLAYER.setFaith(1);
    },
    cheatSeeds: (_player: GPlayerSprite, _someone: GCharSprite) => {
        PLAYER.changeSeeds(100);
    },
    cheatSermons: (_player: GPlayerSprite, _someone: GCharSprite) => {
        PLAYER.changeSermons(100);
    },
    cheatChatty: (_player: GPlayerSprite, _someone: GCharSprite) => {
        GFF.chatty = true;
    },
    cheatNoImps: (_player: GPlayerSprite, _someone: GCharSprite) => {
        GFF.impRepellant = true;
    },
    cheatDivide: (_player: GPlayerSprite, _someone: GCharSprite) => {
        PEOPLE.getPersons().forEach(person => {
            if (person.reprobate) {
                person.faith = 0;
            } else if (person.faith < 100) {
                person.faith = 99;
            }
        });
    },
    cheatDebug: (_player: GPlayerSprite, _someone: GCharSprite) => {
        GFF.debugMode = true;
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
        const chanceToIntro: number = someone.getPerson().faith + (someone.getPerson().familiarity * 10);
        if (chanceToIntro > RANDOM.randInt(0, 100)) {
            return passId;
        }
        return failId;
    },
    isConvert: (_player: GPlayerSprite, someone: GCharSprite, passId: string, failId: string): string => {
        if (someone.getPerson().faith >= 100) {
            return passId;
        }
        return failId;
    },
    isCompanion: (_player: GPlayerSprite, someone: GCharSprite, passId: string, failId: string): string => {
        if ((someone as GPersonSprite).isCompanion()) {
            return passId;
        }
        return failId;
    },
    seedCheck: (_player: GPlayerSprite, _someone: GCharSprite, passId: string, failId: string): string => {
        return PLAYER.getSeeds() > 0 ? passId : failId;
    },
    canGiftSeed: (_player: GPlayerSprite, _someone: GCharSprite, passId: string, failId: string): string => {
        return GFF.canGiftSeed ? passId : failId;
    },
    coinFlip: (_player: GPlayerSprite, _someone: GCharSprite, headsId: string, tailsId: string): string => {
        return RANDOM.flipCoin() ? headsId : tailsId;
    },
    personMet: (_player: GPlayerSprite, someone: GCharSprite, metId: string, unmetId: string): string => {
        return someone.getPerson().familiarity > 0 ? metId : unmetId;
    },
    personKnown: (_player: GPlayerSprite, someone: GCharSprite, knownId: string, unknownId: string): string => {
        return someone.getPerson().nameLevel > 0 ? knownId : unknownId;
    },
    personCasual: (_player: GPlayerSprite, someone: GCharSprite, casualId: string, formalId: string): string => {
        return someone.getPerson().nameLevel > 1 ? casualId : formalId;
    },

    /**
     * Level functions (return a level ID as a number): encoded in the
     * JSON as 'dynamicLevel', these allow creating dynamic blurb texts
     * based on a scale. For example, responses of people with high faith
     * vs. low faith.
     */
    faithLevel: (_player: GPlayerSprite, someone: GCharSprite): number => {
        const faith: number = someone.getPerson().faith;
        const faithLevel: number = Math.floor(faith / 10);
        return Math.min(faithLevel, 10); // Return a max of 10, which indicates a convert
    },
    faithLevelBroad: (_player: GPlayerSprite, someone: GCharSprite): number => {
        const faith: number = someone.getPerson().faith;
        const faithLevel: number = Math.floor(faith / 25);
        return Math.min(faithLevel, 3); // Return a max of 3, which indicates someone near conversion
    },

    /**
     * Direct text functions (return text for the blurb): encoded in the
     * JSON as 'textFunc', these allow blurb text to be generated by
     * a function.
     */
    bio: (_player: GPlayerSprite, someone: GCharSprite, bioNum: number): string => {
        if (bioNum === 1) {
            return someone.getPerson().bio1 ?? '';
        } else if (bioNum === 2) {
            return someone.getPerson().bio2 ?? '';
        }
        return '';
    },
    inform: (_player: GPlayerSprite, someone: GCharSprite): string => {
        const town: GTown = someone.getPerson().homeTown as GTown;
        if (town.getPeople().length > 0) {
            const otherPerson: GPerson = RANDOM.randElement(town.getPeople()) as GPerson;
            return PEOPLE.getInformText(someone.getPerson(), PLAYER.getSprite().getPerson(), otherPerson);
        }
        return `Hmm... nobody is really coming to mind. Sorry.`;
    },
    favoriteBook: (_player: GPlayerSprite, someone: GCharSprite): string => {
        return `My favorite book? I would have to say ${someone.getPerson().favoriteBook}. It really speaks to my heart, and I know its contents quite well.`;
    },
    markChest: (_player: GPlayerSprite, someone: GCharSprite): string => {
        const originRoom: GRoom = GFF.AdventureContent.getCurrentRoom() as GRoom;
        const chestRoom: GRoom|null = originRoom.getArea().findNearestRoomWith(originRoom, room => {
            return room.hasPremiumChest();
        });
        let markedText: string = `Hmm... I'm not sure where to find another one.`;
        if (chestRoom !== null) {
            if (chestRoom === PLAYER.getMarkedChestRoom()) {
                markedText = `Hmm... I know of a treasure chest nearby, but you already have it marked on your map.`;
            } else {
                const chestText: string = chestRoom.hasPlanKey('red_chest')
                    ? 'one of the 10 commandments, which will help to enlighten your path'
                    : 'a book of the Bible, which will strengthen you to face the enemy';
                const distText: string = AREA.describeDistanceBetweenRooms(originRoom, chestRoom);
                markedText = `Okay, I've marked a treasure chest on your map, ${distText}. I think it's ${chestText}.`;
                const replaceMarkedChest: boolean = PLAYER.setMarkedChestRoom(chestRoom);
                if (replaceMarkedChest) {
                    markedText = `${markedText}\n(I replaced the one that was already marked on your map, so you don't get confused.)`;
                }
            }
        }
        return markedText;
    },
    locateStronghold: (_player: GPlayerSprite, someone: GCharSprite): string => {
        const originRoom: GRoom = GFF.AdventureContent.getCurrentRoom() as GRoom;
        const strongholdRoom: GRoom|null = originRoom.getArea().findNearestRoomWith(originRoom, room => {
            return room.getStronghold() !== null;
        });
        if (strongholdRoom !== null) {
            const strongholdName: string = (strongholdRoom.getStronghold() as GStronghold).getName();
            const distText: string = AREA.describeDistanceBetweenRooms(originRoom, strongholdRoom);
            return `The nearest enemy stronghold is the ${strongholdName}. It lies ${distText}. The stronghold is a place of great evil and danger; but be of good courage: we are more than conquerors through him that loved us!`;
        }
        return `Hmm... there don't seem to be any strongholds. That's good, I suppose...?`;
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
    private convType: ConversationType = 'default';
    private faithPerSermonBlurb: number[] = [];

    constructor(blurbs: CBlurb[], participants?: CLabeledChar[], convType: ConversationType = 'default') {
        GFF.AdventureContent.setConversation(this);
        this.convType = convType;
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

        // If this is a sermon, we need to count how many blurbs the preacher will speak:
        if (this.convType === 'sermon') {
            this.calculateFaithPerSermonBlurb();
        }

        // Begin the first blurb of the conversation:
        this.startBlurb();
    }

    private calculateFaithPerSermonBlurb() {
        const missingFaith: number = PLAYER.getMaxFaith() - PLAYER.getFaith();
        const sermonBlurbCount: number = this.blurbs.filter(blurb => {
            return blurb.speaker === 'preacher';
        }).length;

        // Calculate the minimum faith per sermon blurb:
        const minFaithPerSermon: number = Math.floor(missingFaith / sermonBlurbCount);
        const remainder: number = missingFaith % sermonBlurbCount;

        // Create an array of faith per sermon blurb:
        this.faithPerSermonBlurb = Array(sermonBlurbCount).fill(minFaithPerSermon);
        // Add the remainder to the last index, which will be popped first:
        this.faithPerSermonBlurb[sermonBlurbCount - 1] += remainder;
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
        } else if (this.currentBlurb.textFunc !== undefined) {
            // Text function: get text directly from a function
            preparedText = this.getTextByFunction(this.currentBlurb.textFunc);
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
            case 'preacher':
                // Each time the preacher speaks a blurb during a sermon,
                // we'll increase the player's faith.
                if (this.convType === 'sermon') {
                    this.restorePlayerFaith(this.faithPerSermonBlurb.pop() as number);
                }
            case 'player':
            case 'intercessor':
            case 'saint':
            case 'sinner':
            case 'other':
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
            case 'preacher':
            case 'intercessor':
            case 'saint':
            case 'sinner':
            case 'other':
                this.currentHearer = this.getRandomCharByLabel(hearer);
                break;
            default:
                throw new Error(`Unknown hearer type: ${hearer}`);
        }
    }

    private orientParticipants() {
        // If there is a hearer defined, this is a 1-on-1 conversation:
        if (this.currentHearer !== undefined) {
            // Let the speaker and the hearer face each other (if they are idle):
            if (this.currentSpeaker.isDoing('idle')) {
                this.currentSpeaker.faceChar(this.currentHearer, true);
            }
            if (this.currentHearer.isDoing('idle')) {
                this.currentHearer.faceChar(this.currentSpeaker, true);
            }
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
                if (p.char !== this.currentSpeaker) {
                    p.char.faceChar(this.currentSpeaker, true);
                }
            });
        }
    }

    private restorePlayerFaith(amount: number) {
        const faithWrapper: {value: number} = {value: PLAYER.getFaith()};
        const newFaith: number = Math.min(PLAYER.getMaxFaith(), PLAYER.getFaith() + amount);
        GFF.AdventureContent.tweens.add({
            targets: [faithWrapper],
            duration: 300,
            value: newFaith,
            onUpdate: () => {
                PLAYER.setFaith(Math.floor(faithWrapper.value));
            }
        });
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
        return PEOPLE.replaceLabels(text, this.currentSpeaker.getPerson(), this.currentHearer?.getPerson());
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

    public static fromFile(convKey: string, chars?: CLabeledChar[], convType: ConversationType = 'default'): GConversation {
        let blurbs: CBlurb[] = GFF.GAME.cache.json.get(convKey);
        return new GConversation(blurbs, chars, convType);
    }

    /**
     * This parsing works, but it is not very robust.
     * It will not correctly handle commas inside string arguments, for example.
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
     * A 'text' function will directly return the text for the next blurb.
     */
    private getTextByFunction(command: string): string {
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