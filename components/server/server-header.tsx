"use client";

import { ChevronDown, LogOut, PlusCircle, Settings, Trash, UserPlus, Users } from "lucide-react";

import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useModal } from "@/hooks/use-modal-store";

interface ServerHeaderProps {
    server: { name: string }; // server with members with profiles
    role?: string; // memberrole
}

export const ServerHeader = ({
    server,
    role
} : ServerHeaderProps) => {
    const { onOpen } = useModal();

    const isAdmin = role === "ADMIN";
    const isModerator = isAdmin || role === "MODERATOR"; // TODO: maybe another type than a string
    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none" asChild>
                <button className="w-full text-md font-semibold px-3 flex items-center h-12 border-neutral-200 dark:border-burgundy-600 border-b-2 hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition">
                    {server.name}
                    <ChevronDown className="h-5 w-5 ml-auto"/>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 text-xs font-medium text-black dark:text-neutral-300 dark:bg-burgundy-800 spaxce-y-[2px]">
                {isModerator && (
                    <DropdownMenuItem 
                        onClick={() => onOpen("invite", { server })}
                        className="text-burgundy-300 px-3 py-2 text-sm cursor-pointer"
                    >
                        Пригласить людей
                        <UserPlus className="h-4 w-4 ml-auto"/>
                    </DropdownMenuItem>
                )}
                {isAdmin && (
                    <DropdownMenuItem 
                        onClick={() => onOpen("editServer", { server })}
                        className="px-3 py-2 text-sm cursor-pointer"
                    >
                        Настройки сервера
                        <Settings className="h-4 w-4 ml-auto"/>
                    </DropdownMenuItem>
                )}
                {isAdmin && (
                    <DropdownMenuItem 
                        className="px-3 py-2 text-sm cursor-pointer"
                        onClick={() => onOpen("members", { server })}
                    >
                        Управление участниками
                        <Users className="h-4 w-4 ml-auto"/>
                    </DropdownMenuItem>
                )}
                {isModerator && (
                    <DropdownMenuItem 
                        className="px-3 py-2 text-sm cursor-pointer"
                        onClick={() => onOpen("createChannel")}
                    >
                        Создать канал
                        <PlusCircle className="h-4 w-4 ml-auto"/>
                    </DropdownMenuItem>
                )}
                {isModerator && (
                    <DropdownMenuSeparator />
                )}
                {isAdmin && (
                    <DropdownMenuItem 
                        className="text-red-400 px-3 py-2 text-sm cursor-pointer"
                        onClick={() => onOpen("deleteServer", { server })}
                    >
                        Удалить сервер
                        <Trash className="h-4 w-4 ml-auto"/>
                    </DropdownMenuItem>
                )}
                {!isAdmin && (
                    <DropdownMenuItem 
                        onClick={() => onOpen("leaveServer", { server })}
                        className="px-3 py-2 text-sm cursor-pointer"
                    >
                        Покинуть сервер
                        <LogOut className="h-4 w-4 ml-auto"/>
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}