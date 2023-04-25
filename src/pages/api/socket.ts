import { CardRepo } from '@/lib/classes/cardsRepo';
import { RoomManager } from '@/lib/classes/roomManager';
import {
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    socketUserData,
} from '@/lib/context/types/socketTypes';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { RemoteSocket, Server, Socket } from 'socket.io';

interface SocketServerResponse extends NextApiResponse {
    socket: any;
}

const SocketHandler = (req: NextApiRequest, res: SocketServerResponse) => {
    if (res.socket.server.io) {
        console.log('Socket is already running');
    } else {
        console.log('Socket is initializing');
        const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, socketUserData>(
            res.socket.server,
            {
                cors: {
                    origin: '*',
                },
            }
        );
        res.socket.server.io = io;

        const roomManager = new RoomManager(io);
        const cardsRepo = new CardRepo();

        const syncRoom = async (socket: Socket) => {
            const roomID = socket.data.roomID;
            const roomObject = await roomManager.getRoom(roomID);
            io.to(roomID).emit('set-current-room', roomObject);
        };

        const checkUsernameExist = async (roomID: string, username: string) => {
            const roomObject = await roomManager.getRoom(roomID);
            if (roomObject?.userList.some((user) => user.username === username)) {
                console.log(username, 'already exist');
                return true;
            } else {
                return false;
            }
        };

        io.on('connection', (socket) => {
            console.log('user connected');

            socket.on('join-room', async (username, roomID) => {
                if (!roomID) return;
                if (await checkUsernameExist(roomID, username)) {
                    return;
                }
                socket.join(roomID);
                roomManager.appendRoom(roomID);
                socket.data.username = username;
                socket.data.score = 0;
                socket.data.roomID = roomID;
                console.log(username + ' joined ' + roomID);
                socket.emit('set-game-state', 'lobby');
                syncRoom(socket);
            });

            socket.on('get-current-room', async () => {
                if (!socket.data.roomID) {
                    console.log('room id undefined');
                    return;
                }
                console.log('getting ', socket.data.roomID);
                syncRoom(socket);
            });

            socket.on('start-game', () => {
                const roomID = socket.data.roomID;
                if (!roomID) return;
                io.in(roomID).emit('set-game-state', 'game');
            });

            socket.on('get-next-round', () => {
                const roomID = socket.data.roomID;
                if (!roomID) return;
                roomManager.incrementRoomRound(roomID);
                const cards = cardsRepo.draw();
                syncRoom(socket);
                io.in(roomID).emit('set-round', cards);
            });

            socket.on('disconnect', () => {
                syncRoom(socket);
            });
        });
    }
    res.end();
};

export default SocketHandler;
