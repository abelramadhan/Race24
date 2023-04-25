import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import io, { Socket } from 'socket.io-client';
import { User } from './types/user';
import { ClientToServerEvents, ServerToClientEvents } from './types/socketTypes';
import { RoomObject } from '../classes/roomManager';
import { useSocket } from './socketContext';
import { CardIndex, CardSet, Operators, Solution, SolutionStep } from './types/gameTypes';
import { boolean, evaluate } from 'mathjs';

interface GameContextProps {
    roomObject: RoomObject | null;
    username: string | null;
    solutionCards: CardSet;
    activeCards: boolean[];
    activeOperator: Operators | null;
    setUsername: React.Dispatch<React.SetStateAction<string | null>>;
    isHost: () => boolean;
    resetSolution: () => void;
    insertCardToStep: (index: CardIndex) => void;
    insertOperatorToStep: (operator: Operators) => void;
}

const GameContext = createContext<GameContextProps>({
    roomObject: null,
    username: null,
    solutionCards: [],
    activeCards: [false, false, false, false],
    activeOperator: null,
    setUsername: () => {},
    isHost: () => false,
    resetSolution: () => {},
    insertCardToStep: () => {},
    insertOperatorToStep: () => {},
});

export function useGameContext() {
    return useContext(GameContext);
}

export function GameContextProvider({ children }: { children: React.ReactNode }) {
    // room states
    const { socket } = useSocket();
    const [roomObject, setRoomObject] = useState<RoomObject | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    // round states
    const [roundCards, setRoundCards] = useState<CardSet>([]);
    const [solutionCards, setSolutionCards] = useState<CardSet>([]);
    const [roundSolution, setRoundSolution] = useState<Solution>([]);
    const [currentStep, setCurrentStep] = useState<SolutionStep>({});
    const [activeCards, setActiveCards] = useState<boolean[]>([false, false, false, false]);
    const [activeOperator, setActiveOperator] = useState<Operators | null>(null);

    const isHost = () => {
        return roomObject?.userList[0].username === username ? true : false;
    };

    const syncActiveCards = () => {
        setActiveCards((prev) => {
            prev = [false, false, false, false];
            if (currentStep.index1) {
                prev[currentStep.index1.index] = true;
            }
            if (currentStep.index2) {
                prev[currentStep.index2.index] = true;
            }
            return [...prev];
        });
    };

    const checkStep = (current: SolutionStep) => {
        if (current.index1 && current.operator && current.index2) {
            current.result = {
                value: evaluate(`${current.index1.value} ${current.operator} ${current.index2.value}`),
                index: current.index2.index,
            };
            setSolutionCards((prev) => {
                if (prev && current.result && current.index2 && current.index1) {
                    prev[current.index2?.index] = current.result.value;
                    prev[current.index1?.index] = 0;
                    return [...prev];
                } else {
                    return [];
                }
            });
            setActiveCards([false, false, false, false]);
            setActiveOperator(null);
            setRoundSolution((prev) => [...prev, current]);
            return {};
        }
        syncActiveCards();
        return current;
    };

    const insertCardToStep = (index: CardIndex) => {
        if (roundSolution.length === 3) return;
        setCurrentStep((step) => {
            const current = step;

            //insert card value and index to step
            if (!current.index1) {
                current.index1 = { index: index, value: solutionCards[index] };
            } else if (index === current.index1.index) {
                current.index1 = undefined;
            } else if (index === current.index2?.index) {
                current.index2 = undefined;
            } else {
                current.index2 = { index: index, value: solutionCards[index] };
            }

            //calculate result if both card and an operator exists
            return checkStep(current);
        });
        console.log({ currentStep, solutionCards, roundCards });
    };

    const insertOperatorToStep = (operator: Operators) => {
        setCurrentStep((step) => {
            const current = step;
            if (step.operator === operator) {
                setActiveOperator(null);
                current.operator = undefined;
            } else {
                setActiveOperator(operator);
                current.operator = operator;
            }
            return checkStep(step);
        });
    };

    const resetSolution = () => {
        setSolutionCards([...roundCards]);
        setActiveCards([false, false, false, false]);
        setActiveOperator(null);
        setCurrentStep({});
        setRoundSolution([]);
    };

    useEffect(() => {
        if (!socket) return;
        socket.on('set-current-room', (room: RoomObject | undefined) => {
            console.log(room);
            if (!room) return;
            setRoomObject(room);
        });
        socket.on('set-round', (combination) => {
            setRoundCards([...combination]);
            resetSolution();
        });
    }, [socket]);

    return (
        <GameContext.Provider
            value={{
                roomObject,
                isHost,
                username,
                setUsername,
                solutionCards,
                activeCards,
                activeOperator,
                resetSolution,
                insertCardToStep,
                insertOperatorToStep,
            }}>
            {children}
        </GameContext.Provider>
    );
}
