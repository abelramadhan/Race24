import { useGameContext } from '@/lib/context/gameContext';
import { Operators } from '@/lib/context/types/gameTypes';
import { Button } from '@material-tailwind/react';
import { useRef, useState } from 'react';

const operator: Operators[] = ['+', '-', '*', '/'];

const operatorRenderMap = {
    '+': '+',
    '-': '-',
    '*': '×',
    '/': '÷',
};

interface OperatorProps {
    value: Operators;
    onClick?: () => {};
    active: boolean;
}

function Operator({ value, onClick, active }: OperatorProps) {
    const { insertOperatorToStep } = useGameContext();
    return (
        <Button
            color={active ? 'deep-orange' : 'amber'}
            onClick={() => {
                insertOperatorToStep(value);
            }}
            className='flex justify-center items-center aspect-square text-white text-4xl font-extrabold leading-none'>
            {operatorRenderMap[value]}
        </Button>
    );
}

interface OperatorGridProps {
    onClick?: () => {};
}

export default function OperatorGrid({}: OperatorGridProps) {
    const operators = useRef(operator);
    const { activeOperator } = useGameContext();
    return (
        <div
            className='w-full grid grid-cols-4 gap-3'
            data-tut='operator-grid'>
            {operators.current.map((operator, index) => {
                return (
                    <Operator
                        active={operator === activeOperator ? true : false}
                        key={index}
                        value={operator}
                    />
                );
            })}
        </div>
    );
}
