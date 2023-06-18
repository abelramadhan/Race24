import { useGameContext } from '@/lib/context/gameContext';
import { useSocket } from '@/lib/context/socketContext';
import { CardSet } from '@/lib/context/types/gameTypes';
import { Button, Spinner, Typography } from '@material-tailwind/react';
import { useEffect, useState } from 'react';
import Card from '../gameComponents/Card';
import CardGrid from '../gameComponents/CardGrid';
import OperatorGrid from '../gameComponents/Operators';
import {
    ArrowPathIcon,
    ArrowRightCircleIcon,
    ChevronDoubleRightIcon,
    QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import ScoreBoard from '../gameComponents/ScoreBoard';
import { ReactourStep } from 'reactour';

import dynamic from 'next/dynamic';

const Tour = dynamic(
    () => {
        return import('reactour');
    },
    { ssr: false }
);

const formatNumber = (number: number) => {
    return ('0' + number).slice(-2);
};

export default function Game() {
    const { socket } = useSocket();
    const { isHost, roomObject, solutionCards, resetSolution, skipRound, round, timer } = useGameContext();
    const [isTourOpen, setIsTourOpen] = useState(false);

    useEffect(() => {
        if (!socket) return;
        socket.emit('get-current-room');
    }, [socket]);

    useEffect(() => {
        const init = localStorage.getItem('home-game');
        if (!init) {
            setIsTourOpen(true);
            localStorage.setItem('home-game', 'true');
        }
    }, []);

    return (
        <>
            <div className='w-screen h-full sm:max-w-md bg-white sm:rounded-lg shadow-md flex flex-col'>
                <div className='inline-flex sticky flex-wrap items-center justify-between px-6 py-2 w-full sm:rounded-t-lg bg-light-blue-500 '>
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
                <div className='px-8 py-6 w-full grow flex flex-col gap-6 overflow-y-auto'>
                    <div className='w-full flex flex-row flex-wrap items-center justify-between'>
                        <div
                            className='flex flex-col gap-0.5'
                            data-tut='round-info'>
                            <h3 className='text-gray-700 text-sm leading-none font-light'>Round</h3>
                            <div className='w-12 flex flex-row justify-between leading-none text-xl'>
                                <span className='font-bold'>{round > 10 ? 10 : round}</span>
                                <span> / </span>
                                <span className='font-bold'>10</span>
                            </div>
                        </div>
                        <div className='inline-flex items-center gap-2'>
                            <button
                                onClick={skipRound}
                                data-tut='skip-btn'
                                className='inline-flex items-center p-3 gap-1 text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg'>
                                <span className='align-bottom leading-none relative top-0.5 text-sm hidden sm:block'>
                                    Skip
                                </span>
                                <ArrowRightCircleIcon className='h-6 w-6' />
                            </button>
                            <button
                                onClick={resetSolution}
                                data-tut='skip-btn'
                                className='inline-flex items-center p-3 gap-1 text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg'>
                                <span className='align-bottom leading-none relative top-0.5 text-sm hidden sm:block'>
                                    Reset
                                </span>
                                <ArrowPathIcon className='h-6 w-6' />
                            </button>
                            <button
                                onClick={() => {
                                    resetSolution();
                                    setIsTourOpen(true);
                                }}
                                className='p-3 text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg'>
                                <QuestionMarkCircleIcon className='h-6 w-6' />
                            </button>
                        </div>
                    </div>
                    <div className='grow w-full flex flex-col gap-4 justify-center items-center'>
                        {solutionCards ? (
                            <>
                                <div
                                    className='w-full text-center'
                                    data-tut='timer-info'>
                                    <h3 className='text-xs font-light tracking-wide'>TIME LEFT</h3>
                                    <h2 className='font-bold text-xl tabular-nums slashed-zero'>
                                        {`${formatNumber(timer.minutes)} : ${formatNumber(timer.seconds)}`}
                                    </h2>
                                </div>
                                {round > 10 ? (
                                    <div className='w-full flex flex-col  text-center text-gray-900 rounded-lg divide-y shadow-sm'>
                                        <div className='w-full p-2 font-bold text-xl rounded-t-lg bg-lime-500'>
                                            You Have Finished!
                                        </div>
                                        <div className='w-full p-2 font-light rounded-b-lg bg-lime-50'>
                                            <span className='animate-pulse'> waiting for other players</span>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <CardGrid cards={solutionCards} />
                                        <OperatorGrid />
                                    </>
                                )}
                            </>
                        ) : (
                            <div className='h-48'>
                                <h2>
                                    <Spinner />
                                </h2>
                            </div>
                        )}
                    </div>
                    <div>
                        <ScoreBoard />
                    </div>
                </div>
            </div>
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
        content: 'Tujuan dari game ini adalah mencari angka 24!',
    },
    {
        selector: '[data-tut="round-info"]',
        content: 'Dalam game ini terdapat 10 ronde, anda dapat melihat ronde anda disini',
    },
    {
        selector: '[data-tut="timer-info"]',
        content:
            'Setiap pemain diberikan waktu 10 menit untuk menyelesaikan 10 ronde, waktu yang tersisa dapat dilihat disini',
    },
    {
        selector: '[data-tut="card-grid"]',
        content: 'Pilih dua kartu angka yang ingin dihitung',
    },
    {
        selector: '[data-tut="operator-grid"]',
        content: 'Klik salah satu operator yang ingin digunakan untuk menghitung dua angka sebelumnya',
    },

    {
        selector: '',
        content: 'Pilih angka dan operator yang tepat dan lakukan langkah tersebut sampai anda mendapatkan angka 24!',
    },
    {
        selector: '[data-tut="reset-btn"]',
        content: 'Klik tombol untuk me-reset solusi anda',
    },
    {
        selector: '[data-tut="skip-btn"]',
        content: 'Klik tombol ini jika anda merasa kesulitan dan ingin melewati ronde untuk menyimpan waktu',
    },
    {
        selector: '[data-tut="scoreboard"]',
        content:
            'Anda dapat melihat pemain lain beserta progres pemain lain disini, scroll untuk melihat lebih banyak pemain',
    },
];
