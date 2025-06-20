"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";

interface SignalRContextValue {
    connection: signalR.HubConnection | null;
    isConnected: boolean;
}

const SignalRContext = createContext<SignalRContextValue>({
    connection: null,
    isConnected: false,
});

export const SignalRProvider = ({
    serverId,
    channelId,
    children,
}: {
    serverId: string;
    channelId: string;
    children: React.ReactNode;
}) => {
    const [isConnected, setIsConnected] = useState(false);
    const connectionRef = useRef<signalR.HubConnection | null>(null);

    useEffect(() => {
        const connect = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:5207/chatHub")
            .withAutomaticReconnect()
            .build();

        connectionRef.current = connect;

        connect.start()
            .then(() => {
                console.log("✅ SignalR connected");
                setIsConnected(true);
                connect.invoke("JoinChannel", serverId, channelId);
            })
            .catch(console.error);

        return () => {
            if (connectionRef.current) {
                connectionRef.current.invoke("LeaveChannel", serverId, channelId);
                connectionRef.current.stop();
            }
        };
    }, [serverId, channelId]);

    return (
        <SignalRContext.Provider value={{ connection: connectionRef.current, isConnected }}>
            {children}
        </SignalRContext.Provider>
    );
};

export const useSignalR = () => useContext(SignalRContext);
