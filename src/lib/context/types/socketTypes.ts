import { Room, RoomObject } from '@/lib/classes/roomManager';
import { CardSet, gameStates } from './gameTypes';

export interface ServerToClientEvents {
    'set-game-state': (gameState: gameStates) => void;
    'set-current-room': (room: RoomObject | undefined) => void;
    'set-round': (cards: CardSet) => void;
}

export interface ClientToServerEvents {
    'join-room': (username: string, roomID: string) => void;
    'get-current-room': () => void;
    'start-game': () => void;
    'get-next-round': () => void;
}

export interface InterServerEvents {
    ping: () => void;
}

export interface socketUserData {
    username: string;
    score: number;
    roomID: string;
}
