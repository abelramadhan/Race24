import { useGameContext } from '@/lib/context/gameContext';
import { CardIndex } from '@/lib/context/types/gameTypes';
import { Button } from '@material-tailwind/react';
import { useEffect, useState } from 'react';

interface CardProps {
    value: number;
    onclick: () => void;
    active: boolean;
}

export default function Card({ value, onclick, active }: CardProps) {
    const getColor = () => {
        if (active) {
            return 'bg-light-blue-700';
        } else {
            if (value === 24) {
                return 'bg-lime-500';
            } else {
                return 'bg-light-blue-400';
            }
        }
    };
    if (value !== 0) {
        return (
            <Button
                onClick={onclick}
                className={`flex justify-center items-center aspect-square text-white text-6xl font-extrabold leading-none shadow-none ${getColor()}`}>
                {value}
            </Button>
        );
    } else {
        return <div className='aspect-square bg-transparent shadow-none'></div>;
    }
}
