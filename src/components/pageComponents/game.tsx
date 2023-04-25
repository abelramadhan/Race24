import { useGameContext } from '@/lib/context/gameContext';
import { useSocket } from '@/lib/context/socketContext';
import { CardSet } from '@/lib/context/types/gameTypes';
import { Button, Typography } from '@material-tailwind/react';
import { useEffect, useState } from 'react';
import Card from '../gameComponents/Card';
import CardGrid from '../gameComponents/CardGrid';
import OperatorGrid from '../gameComponents/Operators';
import { ArrowPathIcon } from '@heroicons/react/24/solid';

export default function Game() {
    const { socket } = useSocket();
    const { isHost, roomObject, solutionCards, resetSolution } = useGameContext();

    useEffect(() => {
        if (!socket) return;
        socket.emit('get-current-room');

        if (isHost() && roomObject?.round === 0) {
            socket.emit('get-next-round');
        }
    }, [socket]);

    return (
        <div className='w-screen min-h-full max-w-md bg-white rounded-lg shadow-md flex flex-col'>
            <div className='inline-flex items-center justify-between px-6 py-2 w-full rounded-t-lg bg-light-blue-500 '>
                <div className='inline-flex items-baseline gap-1'>
                    <Typography
                        className='font-bold text-xl'
                        color='blue-gray'>
                        Make
                    </Typography>
                    <Typography
                        className='font-extrabold text-2xl'
                        color='white'>
                        24
                    </Typography>
                </div>
                <div className='inline-flex items-baseline gap-1'>
                    <Typography
                        className='font-light text-sm'
                        color='white'>
                        {'room id : '}
                    </Typography>
                    <Typography
                        className='font-bold text-xl leading-none'
                        color='white'>
                        {roomObject?.roomID}
                    </Typography>
                </div>
            </div>
            <div className='px-8 py-6 w-full grow flex flex-col gap-6'>
                <div className='w-full flex flex-row items-center justify-between'>
                    <div className='inline-flex gap-2'>
                        <h3 className='text-gray-700 text-xl font-light'>Round</h3>
                        <div className='w-12 flex flex-row justify-between text-xl'>
                            <span className='font-bold'>{roomObject?.round}</span>
                            <span> / </span>
                            <span className='font-bold'>10</span>
                        </div>
                    </div>
                    <div>
                        <button
                            onClick={resetSolution}
                            className='p-2 text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg'>
                            <ArrowPathIcon className='h-6 w-6' />
                        </button>
                    </div>
                </div>
                <div className='grow w-full flex flex-col gap-8 justify-center items-center'>
                    {solutionCards ? (
                        <>
                            <CardGrid cards={solutionCards} />
                            <OperatorGrid />
                        </>
                    ) : (
                        <div className='h-48'>
                            <h2>Waiting for Cards</h2>
                        </div>
                    )}
                    <div className=''></div>
                </div>
            </div>
        </div>
    );
}
