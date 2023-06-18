import { useGameContext } from '@/lib/context/gameContext';
import { CardIndex } from '@/lib/context/types/gameTypes';
import { Button } from '@material-tailwind/react';
import { useEffect, useState } from 'react';

interface CardProps {
    value: number;
    onclick: () => void;
    active: boolean;
    index: number;
}

export default function Card({ value, onclick, active, index }: CardProps) {
    const { solutionCards } = useGameContext();

    const isLast = () => {
        let zeroCount = 0;
        solutionCards?.forEach((card) => {
            if (card === 0) zeroCount++;
        });
        return zeroCount === 3 ? true : false;
    };

    const getColor = () => {
        if (active) {
            return 'bg-light-blue-800 ';
        } else {
            if (value === 24 && isLast()) {
                return 'bg-lime-500';
            } else {
                return 'bg-light-blue-400';
            }
        }
    };
    if (value !== 0) {
        return (
            <Button
                data-tut={`card-number-${index}`}
                onClick={onclick}
                className={`flex justify-center items-center aspect-square text-white text-6xl font-extrabold leading-none shadow-none transition-all ${getColor()}`}>
                {value}
            </Button>
        );
    } else {
        return <div className='aspect-square bg-transparent shadow-none'></div>;
    }
}
