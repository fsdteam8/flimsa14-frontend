// "use client";

// import React, {
//   createContext,
//   useContext,
//   useEffect,
//   useRef,
//   useState,
//   ReactNode,
// } from "react";
// import { io, Socket } from "socket.io-client";

// // Define event types (optional, good for TypeScript safety)
// interface ServerToClientEvents {
//   message: (data: { id: string; text: string; author: string }) => void;
// }

// interface ClientToServerEvents {
//   sendMessage: (data: { text: string }) => void;
// }

// // Define context type
// interface SocketContextType {
//   socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
//   isConnected: boolean;
// }

// // Create context
// const SocketContext = createContext<SocketContextType>({
//   socket: null,
//   isConnected: false,
// });

// const SERVER_URL =
//   process.env.NEXT_PUBLIC_SOCKET_SERVER

// // Provider component
// export default function SocketProvider({ children }: { children: ReactNode }) {
//   const socketRef = useRef<Socket<
//     ServerToClientEvents,
//     ClientToServerEvents
//   > | null>(null);
//   const [isConnected, setIsConnected] = useState(false);

//   useEffect(() => {
//     const socket = io(SERVER_URL, {
//       transports: ["websocket"],
//       autoConnect: true,
//     });

//     socketRef.current = socket;

//     const handleConnect = () => setIsConnected(true);
//     const handleDisconnect = () => setIsConnected(false);

//     socket.on("connect", handleConnect);
//     socket.on("searchResults", (data) => console.log(data, "searchResults"))
//     socket.on("disconnect", handleDisconnect);

//     return () => {
//       socket.off("connect", handleConnect);
//       socket.off("disconnect", handleDisconnect);
//       socket.disconnect();
//     };
//   }, []);

//   return (
//     <SocketContext.Provider
//       value={{
//         socket: socketRef.current,
//         isConnected,
//       }}
//     >
//       {children}
//     </SocketContext.Provider>
//   );
// }

// // Custom hook
// export function useSocket() {
//   const context = useContext(SocketContext);
//   if (!context) {
//     throw new Error("useSocket must be used within a SocketProvider");
//   }
//   return context;
// }


"use client";

import { ApiResponse } from "@/types/search-data-type";
import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";


// Socket events
interface ServerToClientEvents {
  searchResults: (data: ApiResponse) => void; // <- matches the server response
}

interface ClientToServerEvents {
  search: (payload: { query: string }) => void;
}

// Context type
interface SocketContextType {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  isConnected: boolean;
}

// Create context
const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

const SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_SERVER;

// Provider
export default function SocketProvider({ children }: { children: ReactNode }) {
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io(SERVER_URL!, { transports: ["websocket"], autoConnect: true });
    socketRef.current = socket;

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

// Custom hook
export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) throw new Error("useSocket must be used within a SocketProvider");
  return context;
}




// "use client";

// import React, {
//   createContext,
//   useContext,
//   useEffect,
//   useRef,
//   useState,
//   ReactNode,
// } from "react";
// import { io, Socket } from "socket.io-client";

// // ✅ Types for client-server events
// export interface ServerToClientEvents {
//   searchResults: (data: Array<{ id: string; name: string }>) => void;
// }

// export interface ClientToServerEvents {
//   search: (payload: { query: string }) => void;
// }

// // ✅ Context type
// interface SocketContextType {
//   socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
//   isConnected: boolean;
// }

// // ✅ Create context
// const SocketContext = createContext<SocketContextType>({
//   socket: null,
//   isConnected: false,
// });

// // ✅ Server URL
// const SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_SERVER;

// // ✅ Provider
// export default function SocketProvider({ children }: { children: ReactNode }) {
//   const socketRef = useRef<
//     Socket<ServerToClientEvents, ClientToServerEvents> | null
//   >(null);
//   const [isConnected, setIsConnected] = useState(false);

//   useEffect(() => {
//     const socket = io(SERVER_URL || "", {
//       transports: ["websocket"],
//       autoConnect: true,
//     });

//     socketRef.current = socket;

//     const handleConnect = () => setIsConnected(true);
//     const handleDisconnect = () => setIsConnected(false);

//     socket.on("connect", handleConnect);
//     socket.on("searchResults", (data) => console.log(data, "searchResults"));
//     socket.on("disconnect", handleDisconnect);

//     return () => {
//       socket.off("connect", handleConnect);
//       socket.off("searchResults");
//       socket.off("disconnect", handleDisconnect);
//       socket.disconnect();
//     };
//   }, []);

//   return (
//     <SocketContext.Provider
//       value={{
//         socket: socketRef.current,
//         isConnected,
//       }}
//     >
//       {children}
//     </SocketContext.Provider>
//   );
// }

// // ✅ Custom hook
// export function useSocket() {
//   const context = useContext(SocketContext);
//   if (!context) {
//     throw new Error("useSocket must be used within a SocketProvider");
//   }
//   return context;
// }
