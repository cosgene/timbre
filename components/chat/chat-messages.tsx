"use client";

import { Fragment } from "react";
import { format } from "date-fns";
import { Member, MemberRole, Message, Profile } from "@/lib/types";
import { Loader2, ServerCrash } from "lucide-react";

import { useChatQuery } from "@/hooks/use-chat-query";

import { ChatWelcome } from "./chat-welcome";
import { ChatItem } from "./chat-item";

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
    member,
    chatId,
    apiUrl,
    socketUrl,
    socketQuery,
    paramKey,
    paramValue,
    type
}: ChatMessagesProps) => {
    const queryKey = `chat:${chatId}`;

    const {
        // data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        // status,
    } = useChatQuery({
        queryKey,
        apiUrl,
        paramKey,
        paramValue,
    });

    // для проверки
    const status = "success";
    const data = {
        pages: [
            {
            items: [
                {
                id: "msg1",
                content: "Привет, как дела?",
                fileUrl: null,
                deleted: false,
                createdAt: "2025-06-20T06:00:00Z",
                updatedAt: "2025-06-20T06:00:00Z",
                member: {
                    id: "member1",
                    role: MemberRole.GUEST,
                    profile: {
                    id: "profile1",
                    name: "Иван",
                    email: "ivan@example.com",
                    imageUrl: "https://example.com/avatar.jpg"
                    }
                }
                },
                {
                id: "msg2",
                content: "Все отлично, а у тебя?",
                // fileUrl: "https://example.com/file.pdf",
                deleted: false,
                createdAt: "2025-06-20T06:05:00Z",
                updatedAt: "2025-06-20T06:05:00Z",
                member: {
                    id: "member2",
                    role: MemberRole.ADMIN,
                    profile: {
                    id: "profile2",
                    name: "Анна",
                    email: "anna@example.com",
                    imageUrl: "https://example.com/avatar2.jpg"
                    }
                }
                }
            ]
            },
            {
            items: [
                {
                id: "msg3",
                content: "Работаю над проектом!",
                fileUrl: null,
                deleted: true,
                createdAt: "2025-06-20T05:50:00Z",
                updatedAt: "2025-06-20T05:55:00Z",
                member: {
                    id: "member1",
                    role: MemberRole.MODERATOR,
                    profile: {
                    id: "profile1",
                    name: "Иван",
                    email: "ivan@example.com",
                    imageUrl: "https://example.com/avatar.jpg"
                    }
                }
                }
            ]
            }
        ]
    };

    if (!(status === "success") && (status !== "error")) {
        return (
            <div className="flex flex-col flex-1 justify-center items-center">
                <Loader2 className="h-7 w-7 text-zinc-500 dark:text-burgundy-200 animate-spin my-4"/>
                <p className="text-xs text-zinc-500 dark:text-burgundy-200">
                    Загрузка сообщений...
                </p>
            </div>
        )
    }

    if (status === "error") {
        return (
            <div className="flex flex-col flex-1 justify-center items-center">
                <ServerCrash className="h-7 w-7 text-zinc-500 dark:text-burgundy-200 my-4"/>
                <p className="text-xs text-zinc-500 dark:text-burgundy-200">
                    Что-то пошло не так...
                </p>
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col py-4 overflow-y-auto">
            <div className="flex-1"/>
            <ChatWelcome
                type={type}
                name={name}
            />
            <div className="flex flex-col-reverse mt-auto">
                {data?.pages?.map((group, i) => (
                    <Fragment key={i}>
                        {group.items.map((message: MessageWithMemberWithProfile) => (
                            <ChatItem 
                                key={message.id}
                                id={message.id}
                                currentMember={member}
                                member={message.member}
                                content={message.content}
                                fileUrl={message.fileUrl}
                                deleted={message.deleted}
                                timestamp={format(new Date(message.createdAt), DATE_FORMAT)}
                                isUpdated={message.updatedAt !== message.createdAt}
                                socketUrl={socketUrl}
                                socketQuery={socketQuery}
                            />
                        ))}
                    </Fragment>
                ))}
            </div>
        </div>
    );
}