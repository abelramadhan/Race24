import Head from 'next/head';
import { Inter } from 'next/font/google';
import { useEffect, useState } from 'react';
import { useSocket } from '@/lib/context/socketContext';
import Home from '@/components/pageComponents/home';
import Lobby from '@/components/pageComponents/lobby';
import { gameStates } from '@/lib/context/types/gameTypes';
import { GameContextProvider } from '@/lib/context/gameContext';
import Game from '@/components/pageComponents/game';
import LeaderBoard from '@/components/pageComponents/leaderboard';

const inter = Inter({ subsets: ['latin'] });

export default function Index() {
    const [gameState, setGameState] = useState<gameStates>('home');

    const { socket } = useSocket();

    useEffect(() => {
        socket?.on('set-game-state', (newGameState: gameStates) => {
            setGameState(newGameState);
        });

        socket?.on('disconnect', () => {
            setGameState('home');
        });
    }, [socket]);

    const renderGameState = () => {
        switch (gameState) {
            case 'home':
                return <Home />;
            case 'lobby':
                return <Lobby />;
            case 'leaderboard':
                return <LeaderBoard setGameState={setGameState} />;
            default:
                return <Game />;
        }
    };

    return (
        <GameContextProvider>
            <main className='w-screen h-screen '>
                <div className='w-full h-full flex justify-center items-center bg-gray-100 sm:p-2 lg:p-6'>
                    {renderGameState()}
                </div>
            </main>
        </GameContextProvider>
    );
}
