import { CardSet } from '@/lib/context/types/gameTypes';
import Card from './Card';
import { useGameContext } from '@/lib/context/gameContext';

interface CardGridProps {
    cards: CardSet;
}

export default function CardGrid({ cards }: CardGridProps) {
    const { insertCardToStep, activeCards } = useGameContext();

    return (
        <div
            className='w-full h-auto grid grid-cols-2 grid-rows-2 gap-3'
            data-tut='card-grid'>
            {cards?.map((cardValue, index) => {
                return (
                    <Card
                        key={index}
                        index={index}
                        value={cardValue}
                        active={activeCards[index]}
                        onclick={() => {
                            insertCardToStep(index);
                        }}
                    />
                );
            })}
        </div>
    );
}
