import { useGameContext } from '@/lib/context/gameContext';
import { socketUserData } from '@/lib/context/types/socketTypes';
import { User } from '@/lib/context/types/user';
import { Progress } from '@material-tailwind/react';

function UserScore({ user, isFinish }: { user: socketUserData; isFinish: boolean }) {
    return (
        <li
            className={'w-full rounded-lg p-4 space-y-1 shadow-sm ' + (isFinish ? 'bg-light-green-50' : 'bg-gray-50')}
            key={user.username}>
            <div className='w-full inline-flex justify-between items-end'>
                <span className='font-semibold'>{user.username}</span>
                <span className='text-sm'>{isFinish ? 'Finished!' : `${user.round} / 10`}</span>
            </div>
            <Progress
                color={isFinish ? 'lime' : 'light-blue'}
                value={(user.round - 1) * 10}
            />
        </li>
    );
}

export default function ScoreBoard() {
    const { roomObject } = useGameContext();

    return (
        <ul
            className='space-y-4 w-full h-40 overflow-y-auto sm:no-scrollbar'
            data-tut='scoreboard'>
            {roomObject?.userList.map((user) => {
                if (user.round === 0) return;
                return (
                    <UserScore
                        key={user.username}
                        user={user}
                        isFinish={user.round > 10 ? true : false}
                    />
                );
            })}
        </ul>
    );
}
