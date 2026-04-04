import { GFF } from "./main";
import { PLAYER } from "./player";
import { ENEMY } from "./enemy";
import { FIVE, GSpirit, NINE, SIX, TEN } from "./types";
import { RANDOM } from "./random";
import { BOOKS } from "./books";
import { FRUITS } from "./fruits";
import { COMMANDMENTS } from "./commandments";
import { ARMORS } from "./armors";

export namespace BALANCE {

    export function test(untilLevel: number = 50): void {
        let totalBattles = 0;

        // Reset books so we can add them one at a time in the simulation
        BOOKS.removeAllBooks();

        // Create a dummy enemy to compare with the player
        const dummySpirit: GSpirit = {
            type: 'Dummy',
            name: 'Dummy',
            level: 0,
            introduced: false,
            portraitKey: null,
            avatarKey: null,
        };

        // Show a report at each level
        for (let level = 0; level <= untilLevel; level++) {
            const xpNeeded = PLAYER.getXpNeededAtLevel(level);

            // Match the enemy to the player's level
            dummySpirit.level = level;
            ENEMY.init(null, dummySpirit, '', '');

            // Calculate a rough expectation for the player:
            const estimatedProgress = level / 50;
            const pctOfEndgame = Math.round((estimatedProgress * 100));
            const expectedUsedBooks = Math.min(
                GFF.getDifficulty().expectedBooksAtEnd,
                (estimatedProgress * GFF.getDifficulty().expectedBooksAtEnd) + 1
            );
            const expectedTotalBooks = 1 + Math.min(65, Math.round(estimatedProgress * 65));
            const expectedFruits = Math.min(9, Math.round(estimatedProgress * 9));
            const expectedCommandments = Math.min(10, Math.round(estimatedProgress * 10));
            const expectedArmors = Math.min(5, Math.max(0, Math.floor((level - 1) / 7)));

            // Set the player's inventory to match the expected progress:
            while (expectedTotalBooks > BOOKS.getObtainedCount()) {
                acquireNextBook(BOOKS.getObtainedCount() + 1);
            }
            if (expectedFruits >= FRUITS.getCount()) {
                acquireNextFruit(expectedFruits as NINE);
            }
            if (expectedCommandments >= COMMANDMENTS.getCount()) {
                acquireNextCommandment(expectedCommandments as TEN);
            }
            if (expectedArmors >= ARMORS.getCount()) {
                acquireNextArmor(expectedArmors as FIVE);
            }

            // Set the number of books equipped to match our expectation:
            equipBooks(expectedUsedBooks);

            // Show report:
            GFF.log(`= LEVEL ${level} ============================`);
            GFF.log(`- % of progress toward endgame: ${pctOfEndgame}%`);
            GFF.log(`- Expected books obtained: ${expectedTotalBooks}`);
            GFF.log(`- Estimated books used: ${expectedUsedBooks}`);
            GFF.log(`- XP needed to level-up: ${xpNeeded}`);
            GFF.log(`- Eq. enemy fights to level: ${Math.fround(xpNeeded / ENEMY.getXpValue())}`);
            GFF.log(`- Player Faith: ${PLAYER.getMaxFaith()}`);
            GFF.log(`Equal Enemy:`)
            GFF.log(`- Resistance: ${ENEMY.getMaxResistance()}`);
            GFF.log(`- Power: ${ENEMY.getBaseDamage()}`);
            GFF.log(`- XP value: ${ENEMY.getXpValue()}`);

            // Simulate enough fights to level up the player:
            while (PLAYER.getLevel() < untilLevel && !PLAYER.canLevelUp()) {
                const enemy: GSpirit = getRandomEnemy();
                GFF.log(`Adam (${PLAYER.getLevel()}) vs. Enemy (${enemy.level})`);
                PLAYER.addXp(ENEMY.getXpValue());
                ENEMY.levelUp();
                totalBattles++;
            }
            if (PLAYER.getLevel() < untilLevel) {
                PLAYER.levelUp();
                ENEMY.levelUpLowerEnemies();
            }
        }
        // Show final report:
        GFF.log(`= TEST END ============================`);
        GFF.log(`Total battles simulated: ${totalBattles}`);
        for (const spirit of ENEMY.getSpirits()) {
            GFF.log(`${spirit.name} @ level ${spirit.level}`);
        }

        // Set Grace to 0
        PLAYER.setGrace(0);
    }

    function getRandomEnemy(): GSpirit {
        const spirit: GSpirit = RANDOM.randElement(ENEMY.getSpirits()) as GSpirit;
        ENEMY.init(null, spirit, '', '');
        return spirit;
    }

    function acquireNextBook(bookNum: number) {
        const book: string = BOOKS.getAllBooks()[bookNum - 1];
        BOOKS.obtainBook(book);
        GFF.log(`** Obtained book: ${book}`);
    }

    function acquireNextFruit(fruitNum: NINE) {
        FRUITS.obtainFruit(fruitNum);
    }

    function acquireNextCommandment(cmdNum: TEN) {
        COMMANDMENTS.obtainCommandment(cmdNum);
    }

    function acquireNextArmor(armorNum: FIVE) {
        ARMORS.obtainArmor((armorNum + 1) as SIX);
    }

    function equipBooks(numBooks: number) {
        const allBooks = BOOKS.getAllBooks();
        for (let i = 0; i < numBooks; i++) {
            BOOKS.setBookEnabled(allBooks[i], true);
        }
    }
}