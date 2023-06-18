import { Room, RoomObject } from '@/lib/classes/roomManager';
import { CardSet, Timer, gameStates } from './gameTypes';

export interface ServerToClientEvents {
    'set-game-state': (gameState: gameStates) => void;
    'set-current-room': (room: RoomObject | undefined) => void;
    'set-round': (cards: CardSet) => void;
    'set-cards': (cards: CardSet[]) => void;
}

export interface ClientToServerEvents {
    'join-room': (username: string, roomID: string) => void;
    'get-current-room': () => void;
    'start-game': () => void;
    'next-round': (finish: boolean) => void;
    'set-finish': (finishTime: Timer) => void;
}

export interface InterServerEvents {
    ping: () => void;
}

export interface socketUserData {
    username: string;
    roomID: string;
    round: number;
    roundScores: Array<boolean>;
    finishTime: Timer | null;
    score: number;
}
