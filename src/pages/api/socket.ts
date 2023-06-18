import { CardRepo } from '@/lib/classes/cardsRepo';
import { RoomManager } from '@/lib/classes/roomManager';
import { Timer } from '@/lib/context/types/gameTypes';
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

        const initSocketData = (socket: Socket, username: string, roomID: string) => {
            socket.data.username = username;
            socket.data.round = 0;
            socket.data.roomID = roomID;
            socket.data.finishTime = null;
            socket.data.roundScores = [false, false, false, false, false, false, false, false, false, false];
        };

        const syncRoom = async (socket: Socket) => {
            const roomID = socket.data.roomID;
            const roomObject = await roomManager.getRoom(roomID);
            io.to(roomID).emit('set-current-room', roomObject);
        };

        const calculateScore = (socket: Socket) => {
            if (!socket.data.finishTime) return 0;
            const finishedRound = socket.data.roundScores.reduce((partialSum: number, a: boolean) => {
                return a ? partialSum + 1 : partialSum;
            });
            const finishTime = socket.data.finishTime.minutes * 60 + socket.data.finishTime.seconds;
            return Math.floor(((finishTime + 50) * finishedRound) / 6);
        };

        const checkUsernameExist = async (roomID: string, username: string) => {
            const roomObject = await roomManager.getRoom(roomID);
            if (roomObject?.userList.some((user) => user.username === username)) {
                return true;
            } else {
                return false;
            }
        };

        io.on('connection', (socket) => {
            socket.on('join-room', async (username, roomID) => {
                if (!roomID) return;
                if (await checkUsernameExist(roomID, username)) {
                    return;
                }
                socket.join(roomID);
                roomManager.appendRoom(roomID);
                initSocketData(socket, username, roomID);
                socket.emit('set-game-state', 'lobby');
                syncRoom(socket);
            });
            socket.on('get-current-room', async () => {
                if (!socket.data.roomID) {
                    return;
                }
                syncRoom(socket);
            });
            socket.on('start-game', async () => {
                const roomID = socket.data.roomID;
                if (!roomID) return;
                const users = await io.in(roomID).fetchSockets();
                users.forEach((user) => (user.data.round = 1));
                io.in(roomID).emit('set-game-state', 'game');
                io.in(roomID).emit('set-cards', roomManager.getCards(roomID));
            });
            socket.on('next-round', async (finish: boolean) => {
                const roomID = socket.data.roomID;
                if (!roomID || !socket.data.roundScores || !socket.data.round) return;
                socket.data.roundScores[socket.data.round - 1] = finish;
                socket.data.round = socket.data.round + 1;

                syncRoom(socket);
            });
            socket.on('set-finish', async (finishTime: Timer) => {
                const roomID = socket.data.roomID;
                if (!roomID || !socket.data.roundScores) return;
                socket.data.finishTime = finishTime;
                socket.data.score = calculateScore(socket);
                const users = await io.in(roomID).fetchSockets();
                let allFinished = true;
                users.forEach((user) => {
                    if (user.data.finishTime === null && user.data.round !== 0) {
                        allFinished = false;
                        return;
                    }
                });
                if (allFinished) {
                    io.in(roomID).emit('set-game-state', 'leaderboard');
                }
                syncRoom(socket);
            });
            socket.on('disconnect', () => {
                syncRoom(socket);
            });
        });
    }
    res.end();
};

export default SocketHandler;
