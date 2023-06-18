import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import io, { Socket } from 'socket.io-client';
import { User } from './types/user';
import { ClientToServerEvents, ServerToClientEvents } from './types/socketTypes';
import { RoomObject } from '../classes/roomManager';
import { useSocket } from './socketContext';
import { CardIndex, CardSet, Operators, Solution, SolutionStep, Timer } from './types/gameTypes';
import { boolean, evaluate } from 'mathjs';
import { useTimer } from 'react-timer-hook';

interface GameContextProps {
    roomObject: RoomObject | null;
    username: string | null;
    round: number;
    solutionCards: CardSet | null;
    activeCards: boolean[];
    activeOperator: Operators | null;
    timer: Timer;
    setUsername: React.Dispatch<React.SetStateAction<string | null>>;
    isHost: () => boolean;
    resetSolution: () => void;
    skipRound: () => void;
    insertCardToStep: (index: CardIndex) => void;
    insertOperatorToStep: (operator: Operators) => void;
}

const GameContext = createContext<GameContextProps>({
    roomObject: null,
    username: null,
    round: 0,
    solutionCards: null,
    activeCards: [false, false, false, false],
    activeOperator: null,
    timer: { minutes: 0, seconds: 0 },
    setUsername: () => {},
    isHost: () => false,
    resetSolution: () => {},
    skipRound: () => {},
    insertCardToStep: () => {},
    insertOperatorToStep: () => {},
});

export function useGameContext() {
    return useContext(GameContext);
}

const getTimerDuration = (seconds: number) => {
    const time = new Date();
    time.setSeconds(time.getSeconds() + seconds);
    return time;
};

const time = getTimerDuration(600);

export function GameContextProvider({ children }: { children: React.ReactNode }) {
    const { socket } = useSocket();
    // room states
    const [roomObject, setRoomObject] = useState<RoomObject | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    // round states
    const [round, setRound] = useState(0);
    const [gameCards, setGameCards] = useState<CardSet[]>([]);
    const [solutionCards, setSolutionCards] = useState<CardSet | null>(null);
    const [roundSolution, setRoundSolution] = useState<Solution>([]);
    const [currentStep, setCurrentStep] = useState<SolutionStep>({});
    const [activeCards, setActiveCards] = useState<boolean[]>([false, false, false, false]);
    const [activeOperator, setActiveOperator] = useState<Operators | null>(null);
    // timer
    const { start, pause, minutes, seconds } = useTimer({
        expiryTimestamp: time,
        autoStart: false,
        onExpire: () => {
            if (round < 11) {
                setRound(11);
                socket?.emit('set-finish', { minutes, seconds });
            }
        },
    });

    useEffect(() => {
        if (round != 0 && round <= 10) {
            resetSolution();
        }
    }, [round]);

    useEffect(() => {
        if (!socket) return;
        socket.on('set-current-room', (room: RoomObject | undefined) => {
            if (!room) return;
            setRoomObject(room);
        });

        socket.on('set-cards', (cards) => {
            setRound(0);
            setSolutionCards(null);
            setGameCards([...cards]);
            setTimeout(() => {
                setRound(1);
                start();
            }, 1000);
        });
    }, [socket]);

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

    const skipRound = () => {
        nextRound(false);
    };

    const nextRound = (finish: boolean) => {
        // if (round > 11) return;

        setRound((prev) => {
            const newRound = prev + 1;

            socket?.emit('next-round', finish);
            if (newRound > 10) {
                socket?.emit('set-finish', { minutes, seconds });
            }

            return newRound;
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

            if (roundSolution.length + 1 === 3) {
                if (current.result.value === 24) {
                    setTimeout(() => {
                        nextRound(true);
                    }, 1000);
                } else {
                    setTimeout(resetSolution, 1000);
                }
            }

            return {};
        }
        syncActiveCards();
        return current;
    };

    const insertCardToStep = (index: CardIndex) => {
        if (!solutionCards) return;
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
        setSolutionCards([...gameCards[round - 1]]);
        setActiveCards([false, false, false, false]);
        setActiveOperator(null);
        setCurrentStep({});
        setRoundSolution([]);
    };

    return (
        <GameContext.Provider
            value={{
                roomObject,
                isHost,
                username,
                round,
                setUsername,
                solutionCards,
                activeCards,
                activeOperator,
                timer: { minutes, seconds },
                resetSolution,
                skipRound,
                insertCardToStep,
                insertOperatorToStep,
            }}>
            {children}
        </GameContext.Provider>
    );
}
