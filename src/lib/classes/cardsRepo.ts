import { readFileSync, writeFileSync } from 'fs';
import { CardSet } from '../context/types/gameTypes';

function getRandomNumber(max: number): number {
    return Math.floor(Math.random() * (max + 1));
}

export class CardRepo {
    private cards: CardSet[];
    constructor() {
        try {
            this.cards = readJSONFile('src/lib/data/cards.json');
        } catch (error) {
            console.log('generating combinations');
            const combinations = generateCombinations([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 4);
            writeJSONFile('src/lib/data/cards.json', combinations);
            this.cards = combinations;
        }
    }

    draw = () => this.cards[getRandomNumber(this.cards.length - 1)];
}

function writeJSONFile(filename: string, data: any): void {
    const jsonData = JSON.stringify(data);
    writeFileSync(filename, jsonData);
    console.log('Data written to file');
}

const readJSONFile = (filename: string): CardSet[] => {
    const data = readFileSync(filename, 'utf-8');
    if (!data) {
        throw new Error('File is empty');
    }
    const jsonData = JSON.parse(data);
    return jsonData;
};

function generateCombinations(cards: number[], n: number): CardSet[] {
    const result: CardSet[] = [];

    function backtrack(combination: number[], index: number): void {
        if (combination.length === n) {
            if (canSolve24(combination)) {
                result.push([...combination]);
            }
            return;
        }

        for (let i = index; i < cards.length; i++) {
            combination.push(cards[i]);
            backtrack(combination, i + 1);
            combination.pop();
        }
    }

    backtrack([], 0);

    return result;
}

function canSolve24(nums: number[]): boolean {
    const EPSILON = 0.00000001;

    if (nums.length === 1) {
        return Math.abs(nums[0] - 24) < EPSILON;
    }

    for (let i = 0; i < nums.length; i++) {
        for (let j = 0; j < nums.length; j++) {
            if (i !== j) {
                const remaining = nums.filter((_, index) => index !== i && index !== j);

                if (canSolve24([...remaining, nums[i] + nums[j]])) {
                    return true;
                }

                if (canSolve24([...remaining, nums[i] - nums[j]])) {
                    return true;
                }

                if (canSolve24([...remaining, nums[i] * nums[j]])) {
                    return true;
                }

                if (nums[j] !== 0 && canSolve24([...remaining, nums[i] / nums[j]])) {
                    return true;
                }
            }
        }
    }

    return false;
}
