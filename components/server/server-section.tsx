"use client";

import { ChannelType, MemberRole, Server } from "@/lib/types";
import { ActionTooltip } from "@/components/action-tooltip";
import { Plus, Settings } from "lucide-react";
import { useModal } from "@/hooks/use-modal-store";

interface ServerSectionProps {
    label: string;
    role?: MemberRole;
    sectionType: "channels" | "members";
    channelType?: ChannelType;
    server?: Server;
}

export const ServerSection = ({
    label,
    role,
    sectionType,
    channelType,
    server,
}: ServerSectionProps) => {
    const { onOpen } = useModal();

    return (
        <div className="flex items-center justify-between py-2">
            <p className="text-xs uppercase font-semibold text-zinc-500 dark:text-burgundy-200">
                {label}
            </p>
            {role !== MemberRole.GUEST && sectionType === "channels" && (
                <ActionTooltip label="Создать канал" side="top">
                    <button 
                        className="text-zinc-500 hover:text-zinc-600 dark:text-burgundy-200 dark:hover:text-burgundy-100 transition"
                        onClick={() => onOpen("createChannel", { server, channelType })}
                    >
                        <Plus className="h-4 w-4"/>
                    </button>
                </ActionTooltip>
            )}
            {role === MemberRole.ADMIN && sectionType === "members" && (
                <ActionTooltip label="Управление участниками" side="top">
                    <button 
                        className="text-zinc-500 hover:text-zinc-600 dark:text-burgundy-200 dark:hover:text-burgundy-100 transition"
                        onClick={() => onOpen("members", { server })}
                    >
                        <Settings className="h-4 w-4"/>
                    </button>
                </ActionTooltip>
            )}
        </div>
    )
}