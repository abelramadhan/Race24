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

    draw = () => {
        const roundCards = [];
        let prevIndex = -1;
        for (let i = 0; i < 10; i++) {
            let newIndex;
            do {
                newIndex = getRandomNumber(this.cards.length - 1);
            } while (newIndex === prevIndex);
            roundCards.push(this.cards[newIndex]);
        }
        return roundCards;
    };
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
    const combValues = [1, 1, 1, 1];

    while (combValues[0] <= 10) {
        const combination = combValues.slice();
        if (canSolve24(combination)) {
            result.push(combination);
        }
        combValues[3]++;

        let i = 3;
        while (i > 0 && combValues[i] > 10) {
            combValues[i - 1]++;
            combValues[i] = combValues[i - 1];
            i--;
        }
    }
    return result;
}

function canSolve24(nums: number[]): boolean {
    const EPSILON = 0.00000001;

    if (nums.length === 1) {
        return Math.abs(nums[0] - 24) < EPSILON;
    }

    const operations = ['+', '-', '*', '/'];

    for (let i = 0; i < nums.length; i++) {
        for (let j = 0; j < nums.length; j++) {
            if (i !== j) {
                for (const op of operations) {
                    const remaining = nums.filter((_, index) => index !== i && index !== j);

                    let result;
                    if (op === '+') {
                        result = nums[i] + nums[j];
                    } else if (op === '-') {
                        result = nums[i] - nums[j];
                    } else if (op === '*') {
                        result = nums[i] * nums[j];
                    } else if (op === '/' && nums[j] !== 0) {
                        result = nums[i] / nums[j];
                    }

                    if (result !== undefined && canSolve24([...remaining, result])) {
                        return true;
                    }
                }
            }
        }
    }

    return false;
}
