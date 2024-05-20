import { useGameContext } from '@/lib/context/gameContext';
import generateId from '@/lib/context/generateID';
import { useSocket } from '@/lib/context/socketContext';
import { User } from '@/lib/context/types/user';
import { Card, CardHeader, Typography, CardBody, Input, CardFooter, Button } from '@material-tailwind/react';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { ReactourStep } from 'reactour';
const Tour = dynamic(
    () => {
        return import('reactour');
    },
    { ssr: false }
);

export default function Home() {
    const [mode, setMode] = useState<'create' | 'join'>('create');
    const [username, setUsernameInput] = useState('');
    const [roomID, setRoomID] = useState('');

    const { socket } = useSocket();
    const { setUsername, startOffline } = useGameContext();

    const [isTourOpen, setIsTourOpen] = useState(false);
    useEffect(() => {
        const init = localStorage.getItem('home-tutorial');
        if (!init) {
            socket?.connected && setIsTourOpen(true);
            localStorage.setItem('home-tutorial', 'true');
        }
    }, []);

    const startGame = () => {
        if (socket?.connected) {
            if (!username) return;
            setUsername(username);
            const newRoomID = mode === 'join' && roomID ? roomID : generateId(6);
            socket?.emit('join-room', username, newRoomID);
        } else {
            startOffline();
        }
    };

    return (
        <>
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
                            Race
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
                    {socket?.connected ? (
                        <>
                            <div className='flex flex-row border-b border-gray-300'>
                                <div
                                    data-tut='tab-create'
                                    onClick={() => {
                                        setMode('create');
                                    }}
                                    className={
                                        mode === 'create'
                                            ? 'bg-light-blue-50 border-b border-light-blue-500 py-2 flex-1 text-center'
                                            : 'bg-gray-50 py-2 flex-1 text-center hover:bg-light-blue-50'
                                    }>
                                    Room Baru
                                </div>
                                <div
                                    data-tut='tab-join'
                                    onClick={() => {
                                        setMode('join');
                                    }}
                                    className={
                                        mode === 'join'
                                            ? 'bg-light-blue-50 border-b border-light-blue-500 py-2 flex-1 text-center'
                                            : 'bg-gray-50 py-2 flex-1 text-center hover:bg-light-blue-50'
                                    }>
                                    Bergabung
                                </div>
                            </div>
                            <div className='p-6 flex flex-col gap-3'>
                                <div className='w-full'>
                                    <Input
                                        data-tut='input-username'
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
                                            data-tut='input-roomid'
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
                        </>
                    ) : (
                        <div className='text-center w-full py-4'>
                            <Typography className='font-bold text-lg'>Oops!</Typography>
                            <Typography>Multiplayer sedang tidak tersedia</Typography>
                        </div>
                    )}
                </CardBody>
                <CardFooter className='flex flex-col p-6 pt-0'>
                    <div className='border-t border-gray-300 mb-6'></div>
                    <Button
                        data-tut='button-start'
                        onClick={() => {
                            startGame();
                        }}
                        fullWidth={true}
                        color='light-blue'>
                        {socket?.connected ? 'Mulai' : 'Mulai Oflline'}
                    </Button>
                    {socket?.connected && (
                        <Button
                            className='mt-2'
                            onClick={() => setIsTourOpen(true)}
                            color='light-blue'
                            size='sm'
                            variant='text'>
                            Bantuan
                        </Button>
                    )}
                </CardFooter>
            </Card>
            <Tour
                steps={tourSteps}
                isOpen={isTourOpen}
                onRequestClose={() => setIsTourOpen(false)}
                rounded={5}
            />
        </>
    );
}

const tourSteps: ReactourStep[] = [
    {
        selector: '',
        content: 'Selamat datang di game Race24!',
    },
    {
        selector: '[data-tut="tab-create"]',
        content: 'Klik disini jika anda ingin membuat room baru',
    },
    {
        selector: '[data-tut="tab-join"]',
        content: 'Klik disini jika anda ingin bergabung dalam room yang sudah ada',
        action: (node) => node.click(),
    },
    {
        selector: '[data-tut="input-username"]',
        content: 'Masukkan username anda disini, username anda tidak boleh sama dengan pemain lain dalam satu room',
    },
    {
        selector: '[data-tut="input-roomid"]',
        content: 'Masukkan id room yang anda ingin gabungi disini',
    },
    {
        selector: '[data-tut="button-start"]',
        content: 'Klik tombol ini untuk memulai!',
    },
];
