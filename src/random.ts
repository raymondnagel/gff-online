/**
 * Collection of functions that make it easier
 * to work with randomly-generated numbers.
 */
export namespace RANDOM {

    export function randPct() {
        return Math.random();
    }

    export function randInt(min: number, max: number) {
        const minCeiled = Math.ceil(min);
        const maxFloored = Math.floor(max);
        return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
    }

    export function randFloat(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }

    export function randElement(array: any[]): any {
        const index = Math.floor(Math.random() * array.length);
        return array[index];
    }

    export function randElementWeighted(array: {element: any, weight: number}[]): any {
        let totalWeights: number = 0;
        array.forEach(i => {
            totalWeights += i.weight;
        });
        let roll: number = Math.random() * totalWeights;
        let chosenElement: any|null = null;
        totalWeights = 0;
        array.forEach(i => {
            if (totalWeights + i.weight >= roll) {
                if (chosenElement === null) {
                    chosenElement = i.element;
                }
            }
            totalWeights += i.weight;
        });

        return chosenElement;
    }

    export function flipCoin(): boolean {
        return randInt(0, 1) === 1;
    }

    export function distortInt(value: number, range: number) {
        return randInt(value - range, value + range);
    }

    export function shuffle(array: any[]) {
        let currentIndex = array.length;

        // While there remain elements to shuffle...
        while (currentIndex != 0) {

            // Pick a remaining element...
            let randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]];
        }
    }

    export function toSlices(total: number, sliceCount: number): number[] {
        // Step 1: Create an array of sliceCount-1 random integers.
        const slices: number[] = [];
        let remainingTotal = total;

        for (let i = 0; i < sliceCount - 1; i++) {
          const max = remainingTotal - (sliceCount - i - 1); // Ensure enough is left for the remaining slices
          const slice = Math.floor(Math.random() * max) + 1; // Random integer between 1 and remainingTotal
          slices.push(slice);
          remainingTotal -= slice;
        }

        // Step 2: The last slice is the remainder.
        slices.push(remainingTotal);

        return slices;
      }
}