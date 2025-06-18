"use client";

import { 
    Channel, 
    ChannelType, 
    MemberRole, 
    Server 
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { Edit, Hash, Lock, Mic, Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { ActionTooltip } from "@/components/action-tooltip";
import { useModal } from "@/hooks/use-modal-store";

interface ServerChannelProps {
    channel: Channel;
    server: Server;
    role?: MemberRole;
}

const iconMap = {
    [ChannelType.Text]: Hash,
    [ChannelType.Voice]: Mic,
}

export const ServerChannel = ({
    channel,
    server,
    role
}: ServerChannelProps) => {
    const { onOpen } = useModal();
    const params = useParams();
    const router = useRouter();

    const Icon = iconMap[channel.type];
    return (
        <button
            onClick={() => {}}
            className={cn(
                "group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1",
                params?.channelId === channel.id && "bg-zinc-700/20 dark:bg-zinc-700"
            )}
        >
            <Icon className="flex-shrink-0 w-5 h-5 text-zinc-500 dark:text-burgundy-200"/>
            <p className={cn(
                "line-clamp-1 font-semibold text-sm text-zinc-500 group-hover:text-zinc-600 dark:text-burgundy-200 dark:group-hover:text-burgundy-100 transition",
                params?.channelId === channel.id && "text-primary dark:text-burgundy-100 dark:group-hover:text-white"
            )}>
                {channel.name}
            </p>
            {channel.name !== "общее" && role !== MemberRole.GUEST && (
                <div className="ml-auto flex items-center gap-x-2">
                    <ActionTooltip label="Редактировать">
                        <Edit 
                            onClick={() => onOpen("editChannel", { server, channel })}
                            className="hidden group-hover:block w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:text-burgundy-200 dark:hover:text-burgundy-100 transition"
                        />
                    </ActionTooltip>
                    <ActionTooltip label="Удалить">
                        <Trash
                            onClick={() => onOpen("deleteChannel", { server, channel })}
                            className="hidden group-hover:block w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:text-burgundy-200 dark:hover:text-burgundy-100 transition"
                        />
                    </ActionTooltip>
                </div>
            )}
            {channel.name === "общее" && (
                <Lock 
                    className="ml-auto w-4 h-4 text-zinc-500 dark:text-burgundy-200"
                />
            )}
        </button>
    )
}