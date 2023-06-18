import { Server, Socket } from 'socket.io';
import { socketUserData } from '../context/types/socketTypes';
import { CardRepo } from './cardsRepo';
import { CardSet } from '../context/types/gameTypes';

const cardsRepo = new CardRepo();

export interface RoomObject {
    roomID: string;
    userList: Array<socketUserData>;
}

class Room {
    private roomID: string;
    private cards: CardSet[];

    constructor(roomID: string) {
        this.roomID = roomID;
        this.cards = cardsRepo.draw();
    }

    getRoomID = () => {
        return this.roomID;
    };

    drawCards = () => {
        this.cards = cardsRepo.draw();
    };

    get = async (io: Server): Promise<RoomObject> => {
        try {
            const sockets = await io.in(this.roomID).fetchSockets();
            const users = sockets.map((socket) => {
                return socket.data;
            });
            return {
                roomID: this.roomID,
                userList: users.sort((a, b) => b.round - a.round),
            };
        } catch (error) {
            return {
                roomID: 'notFound',
                userList: [],
            };
        }
    };

    getCards = () => this.cards;
}

class RoomManager {
    io: Server;
    roomList: Array<Room>;

    constructor(io: Server) {
        this.io = io;
        this.roomList = [];
    }

    appendRoom = (roomID: string) => {
        this.roomList.push(new Room(roomID));
    };

    findRoom = (roomID: string) => {
        const room = this.roomList.find((room) => room.getRoomID() === roomID);
        return room;
    };

    getRoom = async (roomID: string) => {
        const room = this.roomList.find((room) => room.getRoomID() === roomID);
        return await room?.get(this.io);
    };

    getCards = (roomID: string) => {
        const room = this.roomList.find((room) => room.getRoomID() === roomID);
        if (!room) return [];
        return room?.getCards();
    };

    redrawCards = (roomID: string) => {
        const room = this.findRoom(roomID);
        room?.drawCards();
    };
}

export { Room, RoomManager };
