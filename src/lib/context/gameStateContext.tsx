import React, { createContext, useContext, useState, useEffect, Dispatch, SetStateAction } from 'react';
import io, { Socket } from 'socket.io-client';
import { User } from './types/user';
import { ClientToServerEvents, ServerToClientEvents } from './types/socketTypes';
import { gameStates } from './types/gameTypes';

interface SocketContextProps {
    gameState: gameStates;
    setGameState: Dispatch<SetStateAction<gameStates>>;
}

const GameStateContext = createContext<SocketContextProps>({
    gameState: 'home',
    setGameState: () => {},
});

export function useGameState() {
    return useContext(GameStateContext);
}

export function GameStateContextProvider({ children }: { children: React.ReactNode }) {
    const [gameState, setGameState] = useState<gameStates>('home');

    return <GameStateContext.Provider value={{ gameState, setGameState }}>{children}</GameStateContext.Provider>;
}
