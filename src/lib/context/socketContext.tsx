import React, { createContext, useContext, useState, useEffect } from "react";
import io, { Socket } from "socket.io-client";
import { User } from "./types/user";
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "./types/socketTypes";

const socketEnabled = process.env.NEXT_PUBLIC_ENABLE_SOCKET === "true";

console.log({ socketEnabled });

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
    await fetch("/api/socket");
  };

  useEffect(() => {
    socketEnabled && initSocketServer();

    const newSocket = io({ reconnection: socketEnabled });

    console.log({ newSocket });

    newSocket.on("connect", () => {
      console.log("socket connected ");
      setSocket(newSocket);
    });
    newSocket.on("disconnect", () => {
      console.log("socket disconnected ");
    });

    return () => {
      socket?.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}
