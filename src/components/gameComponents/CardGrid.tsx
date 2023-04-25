import { CardSet } from '@/lib/context/types/gameTypes';
import Card from './Card';
import { useGameContext } from '@/lib/context/gameContext';

interface CardGridProps {
    cards: CardSet;
}

export default function CardGrid({ cards }: CardGridProps) {
    const { insertCardToStep, activeCards } = useGameContext();

    console.log(activeCards);

    return (
        <div className='w-full grid grid-cols-2 grid-rows-2 gap-3'>
            {cards?.map((cardValue, index) => {
                return (
                    <Card
                        key={index}
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
