import { RoomObject } from '@/lib/classes/roomManager';
import generateId from '@/lib/context/generateID';
import { useSocket } from '@/lib/context/socketContext';
import { User } from '@/lib/context/types/user';
import { Card, CardHeader, Typography, CardBody, Input, CardFooter, Button } from '@material-tailwind/react';
import { useEffect, useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { useGameContext } from '@/lib/context/gameContext';

export default function Lobby() {
    const { socket } = useSocket();
    const { isHost, roomObject, username } = useGameContext();

    useEffect(() => {
        socket?.emit('get-current-room');
    }, [socket]);

    const startGame = () => {
        if (!isHost) return;
        socket?.emit('start-game');
    };

    return (
        <Card className='w-80 overflow-hidden'>
            <CardHeader
                floated={false}
                shadow={false}
                color='transparent'
                className='m-0 rounded-none'>
                <div className='bg-light-blue-400 gap-1 py-6 flex flex-col items-center justify-center'>
                    <div>
                        <Typography
                            variant='h4'
                            className='font-light text-lg'
                            color='white'>
                            {'Room ID'}
                        </Typography>
                        <Typography
                            variant='h2'
                            className='font-extrabold text-5xl leading-none'
                            color='white'>
                            {roomObject?.roomID}
                        </Typography>
                    </div>
                </div>
            </CardHeader>
            <CardBody className='p-6'>
                <span className='font-semibold text-md'>Players</span>
                <ul className='flex flex-row flex-wrap gap-2 mt-2'>
                    {roomObject?.userList.map((user, index) => {
                        return (
                            <li
                                className={`inline-flex items-center px-4 py-1 text-white rounded-md ${
                                    user.username === username ? 'bg-light-blue-300' : 'bg-light-blue-200'
                                }`}
                                key={index}>
                                {user.username}
                                {index === 0 && (
                                    <span>
                                        <StarIcon className='h-4 w-4 ml-2' />
                                    </span>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </CardBody>
            <CardFooter className='flex flex-col p-6 pt-0'>
                <div className='border-t border-gray-200 mb-6'></div>
                {isHost() ? (
                    <Button
                        onClick={startGame}
                        fullWidth={true}
                        color='light-blue'>
                        Start Game!
                    </Button>
                ) : (
                    <Button
                        fullWidth={true}
                        disabled
                        color='gray'>
                        Waiting for Host
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
