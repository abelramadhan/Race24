import { useGameContext } from '@/lib/context/gameContext';
import { useSocket } from '@/lib/context/socketContext';
import { CardSet, gameStates } from '@/lib/context/types/gameTypes';
import { Button, Typography } from '@material-tailwind/react';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import Card from '../gameComponents/Card';
import CardGrid from '../gameComponents/CardGrid';
import OperatorGrid from '../gameComponents/Operators';
import { ArrowPathIcon } from '@heroicons/react/24/solid';
import ScoreBoard from '../gameComponents/ScoreBoard';

interface LeaderBoardProps {
    setGameState: Dispatch<SetStateAction<gameStates>>;
}

export default function LeaderBoard({ setGameState }: LeaderBoardProps) {
    const { socket } = useSocket();
    const { roomObject } = useGameContext();

    const sortedUserList = useMemo(() => {
        return roomObject?.userList.sort((a, b) => b.score - a.score);
    }, [roomObject]);

    console.log(roomObject?.userList);

    return (
        <div className='w-screen min-h-full max-w-md bg-white sm:rounded-lg shadow-md flex flex-col'>
            <div className='inline-flex items-center justify-between px-6 py-2 w-full sm:rounded-t-lg bg-light-blue-500 '>
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
            <div className='flex-1 flex flex-col justify-between'>
                <div className='px-8 py-6 w-full flex flex-col gap-2'>
                    <h1 className='text-center text-xl font-medium tracking-wider'>PAPAN SKOR</h1>
                    {sortedUserList &&
                        sortedUserList.map((user, index) => {
                            return (
                                <div
                                    key={user.username}
                                    className='inline-flex'>
                                    <div
                                        className={`w-16 flex items-center justify-center aspect-square rounded-l-lg font-bold text-xl ${
                                            index === 0 ? 'bg-light-green-500' : 'bg-light-blue-500'
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <div className='py-2 px-4 rounded-r-lg grow bg-gray-50 flex flex-col justify-around'>
                                        <div className='w-full inline-flex items-center justify-between'>
                                            <span>{user.username}</span>
                                            <span>{user.score}</span>
                                        </div>
                                        <div className='w-full inline-flex gap-1'>
                                            {user.roundScores.map((finish, index) => {
                                                return (
                                                    <div
                                                        key={index}
                                                        className={`h-1 rounded-sm grow ${
                                                            finish ? 'bg-light-green-300' : 'bg-red-300'
                                                        }`}>
                                                        {' '}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>
                <div className='flex flex-col gap-2 p-10'>
                    <Button onClick={() => setGameState('lobby')}>Kembali ke Lobby</Button>
                    <Button
                        onClick={() => window.location.reload()}
                        variant='text'>
                        Keluar
                    </Button>
                </div>
            </div>
        </div>
    );
}
