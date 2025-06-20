"use client";

import React, { Fragment, useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { Member, MemberRole, Message, Profile } from "@/lib/types";
import { Loader2, ServerCrash } from "lucide-react";

import { useChatQuery } from "@/hooks/use-chat-query";

import { ChatWelcome } from "./chat-welcome";
import { ChatItem } from "./chat-item";

import * as signalR from "@microsoft/signalr";
import axios from "axios";
import { useSignalR } from "../signalr-context";

const DATE_FORMAT = "d MM yyyy, HH:mm";

type MessageWithMemberWithProfile = Message & {
    member: Member & {
        profile: Profile
    }
}

interface ChatMessagesProps {
    name: string;
    member: Member;
    chatId: string;
    apiUrl: string;
    socketUrl: string;
    socketQuery: Record<string, string>;
    paramKey: "channelId" | "conversationId";
    paramValue: string;
    type: "channel" | "conversation";
}

export const ChatMessages = ({
  name,
  member: currentMember,
  chatId,
  socketUrl,
  socketQuery: { serverId, channelId },
  type
}: ChatMessagesProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  const {connection, isConnected} = useSignalR();

    // Загрузка истории сообщений
    useEffect(() => {
        setLoading(true);
        setError(false);

        axios
            .get<Message[]>(
                `http://localhost:5207/api/messages/channel/${channelId}`
            )
            .then((resp) => {
                setMessages(
                    resp.data.sort(
                        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    )
                );
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch messages:", err);
                setError(true);
                setLoading(false);
            });
    }, [serverId, channelId]);

    // Подписка на входящие сообщения
    useEffect(() => {
        if (!connection || !isConnected) return;

        const getMessageHandler = (msg: Message) => {
            setMessages((prev) => [msg, ...prev]);
        };
        const editMessageHandler = (msgId: string, message: string) => {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === msgId
                        ? { ...msg, content: message, updatedAt: new Date() } // ✅ используем Date, не строку
                        : msg
                )
            );
        };
        const deleteMessageHandler = (msgId: string) => {
            setMessages((prev) => prev.filter((msg) => msg.id !== msgId));
        };



        connection.on("ReceiveMessage", getMessageHandler);
        connection.on("ReceiveEditMessage", editMessageHandler);
        connection.on("ReceiveDeleteMessage", deleteMessageHandler);

        return () => {
            connection.off("ReceiveMessage", getMessageHandler);
            connection.off("ReceiveEditMessage", editMessageHandler);
            connection.off("ReceiveDeleteMessage", deleteMessageHandler);
        };
    }, [connection, isConnected]);

  if (loading) {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2 className="h-7 w-7 text-zinc-500 dark:text-burgundy-200 animate-spin my-4" />
        <p className="text-xs text-zinc-500 dark:text-burgundy-200">
          Загрузка сообщений...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <ServerCrash className="h-7 w-7 text-zinc-500 dark:text-burgundy-200 my-4" />
        <p className="text-xs text-zinc-500 dark:text-burgundy-200">
          Что-то пошло не так...
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col py-4 overflow-y-auto">
      <div className="flex-1" />
      <ChatWelcome type={type} name={name} />
      <div className="flex flex-col-reverse mt-auto">
        {messages.map((message) => (
          <Fragment key={message.id}>
            <ChatItem
              key={message.id}
              id={message.id}
              currentMember={currentMember}
              member={message.member}
              content={message.content}
              fileUrl={message.fileUrl}
              deleted={message.deleted}
              timestamp={format(new Date(message.createdAt), DATE_FORMAT)}
              isUpdated={message.updatedAt !== message.createdAt}
              // Для отправки новых сообщений можно будет использовать тот же connectionRef
              socketUrl={socketUrl}
              socketQuery={{ serverId, channelId }}
            />
          </Fragment>
        ))}
      </div>
    </div>
  );
};