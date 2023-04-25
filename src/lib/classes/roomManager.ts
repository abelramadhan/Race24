import { Server, Socket } from 'socket.io';
import { socketUserData } from '../context/types/socketTypes';

export interface RoomObject {
    roomID: string;
    round: number;
    userList: Array<socketUserData>;
}

class Room {
    private roomID: string;
    private round: number;

    constructor(roomID: string) {
        this.roomID = roomID;
        this.round = 0;
    }

    getRoomID = () => {
        return this.roomID;
    };

    nextRound = () => {
        if (this.round < 10) {
            this.round += 1;
        } else {
            this.round = 0;
        }
    };

    get = async (io: Server): Promise<RoomObject> => {
        try {
            const sockets = await io.in(this.roomID).fetchSockets();
            const users = sockets.map((socket) => {
                return socket.data;
            });
            return {
                roomID: this.roomID,
                round: this.round,
                userList: users,
            };
        } catch (error) {
            return {
                roomID: 'notFound',
                round: 0,
                userList: [],
            };
        }
    };
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

    incrementRoomRound = (roomID: string) => {
        const room = this.findRoom(roomID);
        room?.nextRound();
    };
}

export { Room, RoomManager };
