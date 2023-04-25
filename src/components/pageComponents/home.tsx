import { useGameContext } from '@/lib/context/gameContext';
import generateId from '@/lib/context/generateID';
import { useSocket } from '@/lib/context/socketContext';
import { User } from '@/lib/context/types/user';
import { Card, CardHeader, Typography, CardBody, Input, CardFooter, Button } from '@material-tailwind/react';
import { useState } from 'react';

export default function Home() {
    const [mode, setMode] = useState<'create' | 'join'>('create');
    const [username, setUsernameInput] = useState('');
    const [roomID, setRoomID] = useState('');

    const { socket } = useSocket();
    const { setUsername } = useGameContext();

    const startGame = () => {
        if (!username) return;
        setUsername(username);
        const newRoomID = mode === 'join' && roomID ? roomID : generateId(6);
        socket?.emit('join-room', username, newRoomID);
    };

    return (
        <Card className='w-80 overflow-hidden'>
            <CardHeader
                floated={false}
                shadow={false}
                color='transparent'
                className='m-0 rounded-none'>
                <div className='bg-light-blue-400 gap-1 py-6 flex flex-row items-baseline justify-center'>
                    <Typography
                        variant='h2'
                        className='font-bold text-5xl'
                        color='blue-gray'>
                        Make
                    </Typography>
                    <Typography
                        variant='h2'
                        className='font-extrabold text-6xl'
                        color='white'>
                        24
                    </Typography>
                </div>
            </CardHeader>
            <CardBody className='p-0'>
                <div className='flex flex-row border-b border-gray-300'>
                    <div
                        onClick={() => {
                            setMode('create');
                        }}
                        className={
                            mode === 'create'
                                ? 'bg-light-blue-50 border-b border-light-blue-500 py-2 flex-1 text-center'
                                : 'bg-gray-50 py-2 flex-1 text-center hover:bg-light-blue-50'
                        }>
                        Create Game
                    </div>
                    <div
                        onClick={() => {
                            setMode('join');
                        }}
                        className={
                            mode === 'join'
                                ? 'bg-light-blue-50 border-b border-light-blue-500 py-2 flex-1 text-center'
                                : 'bg-gray-50 py-2 flex-1 text-center hover:bg-light-blue-50'
                        }>
                        Join Game
                    </div>
                </div>
                <div className='p-6 flex flex-col gap-3'>
                    <div className='w-full'>
                        <Input
                            label='Username'
                            value={username}
                            name='username'
                            onChange={(e) => {
                                setUsernameInput(e.target.value);
                            }}
                        />
                    </div>
                    {mode === 'join' && (
                        <div className='w-full'>
                            <Input
                                label='Room ID'
                                name='roomID'
                                value={roomID}
                                onChange={(e) => {
                                    setRoomID(e.target.value);
                                }}
                            />
                        </div>
                    )}
                </div>
            </CardBody>
            <CardFooter className='flex flex-col p-6 pt-0'>
                <div className='border-t border-gray-300 mb-6'></div>
                <Button
                    onClick={() => {
                        startGame();
                    }}
                    fullWidth={true}
                    color='light-blue'>
                    Play Game!
                </Button>
            </CardFooter>
        </Card>
    );
}
