/**
 * GRandom is a collection of functions that make it easy
 * to work with randomly-generated numbers.
 */
export namespace GRandom {

    export function randPct() {
        return Math.random();
    }

    export function randInt(min: number, max: number) {
        const minCeiled = Math.ceil(min);
        const maxFloored = Math.floor(max);
        return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
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
}