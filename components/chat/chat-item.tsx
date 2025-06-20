"use client";

import * as z from "zod";
import axios from "axios";
import qs from "querystring";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Member, MemberRole, Profile } from "@/lib/types";
import { Edit, FileIcon, ShieldAlert, ShieldCheck, Trash } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import { UserAvatar } from "@/components/ui/user-avatar";
import { ActionTooltip } from "@/components/action-tooltip";
import { cn } from "@/lib/utils";
import {
    Form,
    FormControl,
    FormField,
    FormItem
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";

interface ChatItemProps {
    id: string;
    content: string;
    member: Member & {
        profile: Profile;
    };
    timestamp: string;
    fileUrl: string | null;
    deleted: boolean;
    currentMember: Member;
    isUpdated: boolean;
    socketUrl: string;
    socketQuery: Record<string, string>;
}

const roleIconMap = {
    [MemberRole.GUEST]: null,
    [MemberRole.MODERATOR]: <ShieldCheck className="h-4 w-4 ml-2 text-burgundy-400"/>,
    [MemberRole.ADMIN]: <ShieldAlert className="h-4 w-4 ml-2 text-rose-500"/>,
}

const formSchema = z.object({
    content: z.string().min(1),
});

export const ChatItem = ({
    id,
    content,
    member,
    timestamp,
    fileUrl,
    deleted,
    currentMember,
    isUpdated,
    socketUrl,
    socketQuery
}: ChatItemProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const { onOpen } = useModal();

    useEffect(() => {
        const handleKeyDown = (event: any) => {
            if (event.key === "Escape" || event.keyCode === 27) {
                setIsEditing(false);
            }
        }

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener("keyDown", handleKeyDown);
    }, [])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: content,
        }
    });

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            // TODO: изменение сообщения

            form.reset();
            setIsEditing(false);
        } catch (error) {
            console.log("(Chat Item Error@/components/chat/chat-item.tsx)", error);
        }
    }

    useEffect(() => {
        form.reset({
            content: content,
        });
    }, [content])

    const fileType = fileUrl?.split(".").pop();

    const isAdmin = currentMember.role === MemberRole.ADMIN;
    const isModerator = currentMember.role === MemberRole.MODERATOR;
    const isOwner = currentMember.id === member.id;
    const canDeleteMessage = !deleted && (isAdmin || isModerator || isOwner);
    const canEditMessage = !deleted && isOwner && !fileUrl;
    const isPDF = fileType === "pdf" && fileUrl;
    const isImage = !isPDF && fileUrl;

    return (
        <div className="relative group flex items-center hover:bg-zinc-100 dark:hover:bg-burgundy-300/10 p-4 transition w-full">
            <div className="group flex gap-x-2 items-start w-full">
                <div className="cursor-pointer hover:drop-shadow-md transition">
                    <UserAvatar src={member.profile.imageUrl} />
                </div>
                <div className="flex flex-col w-full">
                    <div className="flex items-center gap-x-2">
                        <div className="flex items-center">
                            <p className="font-semibold text-sm hover:underline cursor-pointer">
                                {member.profile.name}
                            </p>
                            <ActionTooltip label={member.role}>
                                <p>
                                    {roleIconMap[member.role]}
                                </p>
                            </ActionTooltip>
                        </div>
                        <span className="text-xs text-zinc-500 dark:text-burgundy-200">
                            {timestamp}
                        </span>
                    </div>
                    {isImage && (
                        <a 
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative aspect-square rounded-md mt-2 overflow-hidden border flex items-center bg-secondary h-48 w-48"
                        >
                            <Image 
                                src={fileUrl}
                                alt={content}
                                fill
                                className="object-cover"
                            />
                        </a>
                    )}
                    {isPDF && (
                        <div className="relative flex items-center p-2 mt-2 rounded-md dark:bg-burgundy-900 bg-zinc-950/5">
                            <FileIcon className="h-10 w-10 fill-burgundy-200 stroke-burgundy-300"/>
                            <a 
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2 text-sm text-burgundy-400 dark:text-burgundy-300 hover:underline"
                            >
                                PDF Файл
                            </a>
                        </div>
                    )}
                    {!fileUrl && !isEditing && (
                        <p className={cn(
                            "text-sm text-zinc-600 dark:text-zinc-300",
                            deleted && "italic text-zinc-500 dark:text-burgundy-200 text-xs mt-1"
                        )}>
                            {content}
                            {isUpdated && !deleted && (
                                <span className="text-[10px] mx-2 text-zinc-500 dark:text-burgundy-200">
                                    (изменено)
                                </span>
                            )}
                        </p>
                    )}
                    {!fileUrl && isEditing && (
                        <Form {...form}>
                            <form 
                                className="flex items-center w-full gap-x-2 pt-2"
                                onSubmit={form.handleSubmit(onSubmit)}
                            >
                                <FormField 
                                    control={form.control}
                                    name="content"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                <div className="relative w-full">
                                                    <Input 
                                                        disabled={isLoading}
                                                        className="p2 bg-zinc-200/90 dark:bg-burgundy-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-burgundy-100"
                                                        placeholder="Редактируемое сообщение"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <Button disabled={isLoading} size="sm" variant="primary">
                                    Сохранить
                                </Button>
                            </form>
                            <span className="text-[10px] mt-1 text-zinc-400 dark:text-burgundy-100">
                                Esc для отмены • Enter чтобы сохранить
                            </span>
                        </Form>
                    )}
                </div>
            </div>
            {canDeleteMessage && (
                <div className="hidden group-hover:flex items-center gap-x-2 absolute p-1 -top-2 right-5 bg-white dark:bg-burgundy-800 border rounded-sm">
                    {canEditMessage && (
                        <ActionTooltip label="Редактировать">
                            <Edit 
                                onClick={() => setIsEditing(true)}
                                className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 dark:text-burgundy-300 hover:text-zinc-600 dark:hover:text-burgundy-300 transition"
                            />
                        </ActionTooltip>
                    )}
                    <ActionTooltip label="Удалить">
                        <Trash 
                            onClick={() => onOpen("deleteMessage", {
                                apiUrl: `${socketUrl}/${id}`,
                                query: socketQuery,
                            })}
                            className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 dark:text-burgundy-300 hover:text-zinc-600 dark:hover:text-burgundy-300 transition"
                        />
                    </ActionTooltip>
                </div>
            )}
        </div>
    );
}