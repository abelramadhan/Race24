import React, { createContext, useContext, useState, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';
import { User } from './types/user';
import { ClientToServerEvents, ServerToClientEvents } from './types/socketTypes';

interface SocketContextProps {
    socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
}

const SocketContext = createContext<SocketContextProps>({
    socket: null,
});

export function useSocket() {
    return useContext(SocketContext);
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null);

    const initSocketServer = async () => {
        await fetch('/api/socket');
    };

    useEffect(() => {
        initSocketServer();
        const newSocket = io();
        newSocket.on('connect', () => {
            console.log('socket connected ');
        });
        newSocket.on('disconnect', () => {
            console.log('socket disconnected ');
        });
        setSocket(newSocket);
        return () => {
            socket?.close();
        };
    }, []);

    return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
}
