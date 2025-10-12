import { CHURCH } from "./church";
import { FRUITS } from "./fruits";
import { GChurch } from "./GChurch";
import { GRoom } from "./GRoom";
import { GFF } from "./main";
import { PEOPLE } from "./people";
import { PHYSICS } from "./physics";
import { PLAYER } from "./player";
import { REGISTRY } from "./registry";
import { IntegerStatName, STATS } from "./stats";
import { NINE } from "./types";

export namespace CONSOLE {

    // Commands that can be executed in the test console
    const CMD_FUNCTIONS: Record<string, (...args: any[]) => string> = {
        cheatFaith: (amount: number) => {
            PLAYER.setFaith(amount);
            playSuccess();
            return 'Ok';
        },
        cheatGrace: (amount: number) => {
            PLAYER.setGrace(amount);
            playSuccess();
            return 'Ok';
        },
        cheatExp: (amount: number) => {
            PLAYER.addXp(amount);
            playSuccess();
            return 'Ok';
        },
        cheatFruit: (amount: number) => {
            let fruitsToQueue: number = amount;
            for (const church of CHURCH.getChurches()) {
                const fruitNum: NINE = church.getFruitNum() as NINE;
                const fruitQueued: boolean = FRUITS.isFruitQueued(church.getFruitNum() as NINE);
                const canGainFruit: boolean = ((!fruitQueued) && !FRUITS.hasFruitOfChurch(church));
                if (canGainFruit) {
                    FRUITS.queueFruit(fruitNum);
                    fruitsToQueue--;
                }
            }
            playSuccess();
            return `Queued fruits: ${amount - fruitsToQueue}`;
        },
        cheatSeeds: (amount: number) => {
            PLAYER.changeSeeds(amount);
            playSuccess();
            return 'Ok';
        },
        cheatSermons: (amount: number) => {
            PLAYER.changeSermons(amount);
            playSuccess();
            return 'Ok';
        },
        cheatStandards: (amount: number) => {
            PLAYER.changeStandards(amount);
            playSuccess();
            return 'Ok';
        },
        cheatDivide: () => {
            let sheep: number = 0;
            let goats: number = 0;
            PEOPLE.getPersons().forEach(person => {
                if (person.reprobate) {
                    person.faith = 0;
                    goats++;
                } else if (person.faith < 100) {
                    person.faith = 99;
                    sheep++;
                }
            });
            playSuccess();
            return `Sheep: ${sheep}, Goats: ${goats}`;
        },
        setRegistry(key: string, value: any) {
            REGISTRY.set(key, value);
            playSuccess();
            return `Set "${key}" => "${value}"`;
        },
        getRegistry(key: string) {
            const value = REGISTRY.get(key);
            if (value === undefined) {
                playError();
                return `Key "${key}" not found!`;
            } else {
                playSuccess();
                return `"${key}" = "${value}"`;
            }
        },
        changeStat(key: string, delta: number) {
            try {
                STATS.changeInt(key as IntegerStatName, delta);
                playSuccess();
                return `Stat "${key}" += ${delta} => ${STATS.getIntegerStat(key as IntegerStatName)}`;
            } catch (error) {
                playError();
                return `Stat "${key}" does not exist!`;
            }
        },
        getStat(key: string) {
            try {
                const value = STATS.getIntegerStat(key as IntegerStatName);
                playSuccess();
                return `"${key}" = ${value}`;
            } catch (error) {
                playError();
                return `Stat "${key}" does not exist!`;
            }
        },
        tourist() {
            // This command enables a bunch of cheats for testing purposes,
            // allowing the tester to explore leisurely and check things out.
            PLAYER.changeSeeds(20);
            PLAYER.changeSermons(20);
            PLAYER.changeStandards(20);
            REGISTRY.set('isNoImps', true);
            REGISTRY.set('isDebug', true);
            playSuccess();
            return 'Ok';
        },
        spyFruit() {
            const currentRoom = GFF.AdventureContent.getCurrentRoom() as GRoom;
            const church: GChurch|null = currentRoom.getChurch();
            if (church) {
                const fruitNum: number|null = church.getFruitNum() as NINE;
                if (fruitNum !== null) {
                    const fruitQueued: boolean = FRUITS.isFruitQueued(fruitNum as NINE);
                    playSuccess();
                    return `Fruit ${fruitNum}: ${FRUITS.hasFruitOfChurch(church) ? 'Yes' : 'No'}, Queued: ${fruitQueued ? 'Yes' : 'No'}`;
                } else {
                    playError();
                    return 'This church has no fruit.';
                }
            } else {
                playError();
                return 'No church in this room.';
            }
        },
        mapExport() {
            GFF.AdventureContent.hideTestConsole();
            GFF.AdventureContent.doMapExport();
            playSuccess();
            return 'Ok';
        },
        warp(x: number, y: number, floor: number = GFF.AdventureContent.getCurrentFloor()) {
            const room = GFF.AdventureContent.getCurrentArea().getRoomAt(floor, x, y);
            if (room) {
                GFF.AdventureContent.hideTestConsole();
                GFF.AdventureContent.warpToRoom(room as GRoom);
                playSuccess();
                return 'Ok';
            } else {
                playError();
                return 'Room not found!';
            }
        },
        listObjects() {
            const objectList = GFF.AdventureContent.children.list;
            objectList.forEach((obj, index) => {
                const physical = PHYSICS.asBoundedGameObject(obj);
                if (physical) {
                    GFF.log(`#${index}: ${obj.name} @${physical.x}, ${physical.y} (Type: ${obj.type})`);
                } else {
                    GFF.log(`#${index}: ${obj.name} (Type: ${obj.type})`);
                }
            });
            playSuccess();
            return `Listed ${objectList.length} objects.`;
        }
    };

    /**
     * This parsing works, but it is not very robust.
     * It will not correctly handle commas inside string arguments, for example.
     */
    function parseCommand(command: string): {functionName: string, args: any[]}|null {
        try {
            // Verify format: functionName(arg1, arg2, ...)
            const regex = /^[a-zA-Z_]\w*\s*\(.*\)$/;
            if (!regex.test(command)) {
                throw new Error("Invalid command format");
            }

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

                // Check if the argument is a boolean (true/false)
                if (arg.toLowerCase() === 'true' || arg.toLowerCase() === 'false') {
                    return Boolean(arg);
                }

                // Otherwise, parse it as a number
                const parsedNumber = Number(arg);
                if (isNaN(parsedNumber)) {
                    throw new Error("Invalid number argument");
                }
                return parsedNumber;
            });

            return { functionName, args };
        } catch (error) {
            GFF.log(`Error parsing console command: ${error}`);
            return null; // Return null if parsing fails
        }
    }

    function playSuccess() {
        GFF.AdventureContent.getSound().playSound('success');
    }

    function playError() {
        GFF.AdventureContent.getSound().playSound('error_buzz');
    }

    export function exec(command: string): string[] {
        // Check for 'exit' command;
        // Yes, you can press [Esc]; but as a programmer, I'm used to typing 'exit' to close consoles.
        if (command.trim().toLowerCase() === 'exit') {
            GFF.AdventureContent.hideTestConsole();
            return ['exit', 'Console closed.'];
        }

        const returnedLines: string[] = [command];
        const parsedCommand = parseCommand(command);
        if (parsedCommand === null) {
            returnedLines.push(`Command parsing failed!`);
            playError();
            return returnedLines;
        }

        const { functionName, args } = parsedCommand;
        const cmdFunction = CMD_FUNCTIONS[functionName];
        if (cmdFunction) {
            returnedLines.push(cmdFunction(...args));
        } else {
            returnedLines.push(`Unknown command.`);
            playError();
        }
        return returnedLines;
    }
}