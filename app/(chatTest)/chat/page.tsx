"use client"
import { useEffect, useState, useRef } from 'react';
import * as signalR from '@microsoft/signalr';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { setupFsCheck } from 'next/dist/server/lib/router-utils/filesystem';

import axios from 'axios';

const ChatPage = () => {
    const [messages, setMessages] = useState<{ user: string; message: string }[]>([]);
    const connectionRef = useRef<signalR.HubConnection | null>(null);
    const [currentChannel, setCurrentChannel] = useState<{serverId: string; channelId: string}>({serverId:" ", channelId:" "});

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
                                        currentChannel.serverId, 
                                        currentChannel.channelId,
                                        (document.getElementById("userInput") as HTMLInputElement).value.trim(), 
                                        (document.getElementById("msgInput") as HTMLInputElement).value.trim()
                                    );
    };

    const onChannelConnect = async () => {

        // Покидаем текущий signalr канал если подключены
        if(currentChannel.channelId != " ") {
            await connectionRef.current?.invoke("LeaveChannel", currentChannel.serverId, currentChannel.channelId);
        }

        var serverId = (document.getElementById("serverInput") as HTMLInputElement).value.trim();
        var channelId = (document.getElementById("channelInput") as HTMLInputElement).value.trim();

        // Присоединяемся к новому
        await connectionRef.current?.invoke(  "JoinChannel",
                                        serverId, 
                                        channelId
                                    );
        setCurrentChannel({serverId: serverId, channelId: channelId});
        
        // Обновляем список сообщений
        
        setMessages([]);
        
        try {
            axios.get(`http://localhost:5207/api/messages/${serverId}/${channelId}`)
                .then((response) => {
                    var m = response.data.map((msg: { ownerId: any; text: any; }) => {return {user: msg.ownerId, message: msg.text}});
                    console.log(m);
                    
                    setMessages(m);
                });

        } catch(error) {
            console.error(`Get Channel Messages (${serverId}, ${channelId})`, error);
        }
    };

    // просто хардкод сервера и каналы для тестов
    const setServer1 = () => {
        (document.getElementById("serverInput") as HTMLInputElement).value = "246c2480-fb79-480f-a02b-96d4007b8da1";
        (document.getElementById("channelInput") as HTMLInputElement).value = "dc428e2e-a534-426d-a2dc-17270151d58b";
    }
    const setServer2 = () => {
        (document.getElementById("serverInput") as HTMLInputElement).value = "55a5b2b9-ffc0-45a5-9874-9507cd2ee888";
        (document.getElementById("channelInput") as HTMLInputElement).value = "c8010ee1-daed-4cb5-b171-151cfca5478f";
    }

    return (
        <div>
            <Input id="serverInput" placeholder="ID Сервера (uuidv4)" />
            <Input id="channelInput" placeholder="ID Канала (uuidv4)" />
            <Button onClick={setServer1}>Server 1</Button>
            <Button onClick={setServer2}>Server 2</Button>
            <Button onClick={onChannelConnect}>Присоединиться к каналу</Button>

            <Input id="userInput" placeholder="Имя (uuidv4)" />
            <Input id="msgInput" placeholder="Сообщение" />
            <Button onClick={sendMessage}>Отправить</Button>
                <ul>
                    {messages.map((msg, i) => (
                    <li key={i}>{msg.user}: {msg.message}</li>
                    ))}
                </ul>
        </div>
    );
}
 
export default ChatPage;