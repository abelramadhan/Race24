export type gameStates = 'home' | 'lobby' | 'game';

export type Card = {
    value: number;
    suit: CardSuits;
};

export type CardSuits = 'spades' | 'clubs' | 'hearts' | 'diamonds';

export type CardSet = [number, number, number, number] | number[];

export type Operators = '+' | '-' | '*' | '/';

export type CardIndex = number;

export type CardSolution = {
    index: CardIndex;
    value: number;
};

export type SolutionStep = {
    index1?: CardSolution;
    operator?: Operators;
    index2?: CardSolution;
    result?: CardSolution;
};

export type Solution = SolutionStep[];
