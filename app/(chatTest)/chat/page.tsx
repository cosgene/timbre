"use client"
import { useEffect, useState, useRef } from 'react';
import * as signalR from '@microsoft/signalr';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ChatPage = () => {
    const [messages, setMessages] = useState<{ user: string; message: string }[]>([]);
    const connectionRef = useRef<signalR.HubConnection | null>(null);

    useEffect(() => {
        // 1. Создаем подключение
        const connection = new signalR.HubConnectionBuilder()
        .withUrl("http://localhost:5207/chatHub")
        .configureLogging(signalR.LogLevel.Information)
        .withAutomaticReconnect() // Опционально: авто-переподключение
        .build();

        connectionRef.current = connection;

        // 2. Запускаем подключение
        const startConnection = async () => {
        try {
            await connection.start();
            console.log("SignalR Connected!");
        } catch (err) {
            console.error("Connection failed:", err);
            // Здесь можно добавить реконнект/повтор
        }
        };
        
        startConnection();

        // 3. Подписываемся на события
        connection.on("ReceiveMessage", (user: string, message: string) => {
        setMessages(prev => [...prev, { user, message }]);
        });

        // 4. Корректная очистка (исправленная)
        return () => {
        // Важно: функция очистки должна возвращать void
        if (connection.state !== signalR.HubConnectionState.Disconnected) {
            connection.stop().catch(error => {
            console.warn("Connection stop error:", error);
            });
        }
        };
    }, []);

    const sendMessage = () => {
        connectionRef.current?.invoke(  "SendMessage", 
                                        (document.getElementById("userInput") as HTMLInputElement).value.trim(), 
                                        (document.getElementById("msgInput") as HTMLInputElement).value.trim());
    };

    return (
        <div>
            <Input id="userInput" placeholder="Имя" />
            <Input id="msgInput" placeholder="Сообщение" />
            <Button onClick={sendMessage}>Send</Button>
                <ul>
                    {messages.map((msg, i) => (
                    <li key={i}>{msg.user}: {msg.message}</li>
                    ))}
                </ul>
        </div>
    );
}
 
export default ChatPage;