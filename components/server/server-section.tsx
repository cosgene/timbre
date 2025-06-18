"use client";

import { ChannelType, MemberRole, Server } from "@/lib/types";

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
    return (
        <div>
            Shit
        </div>
    )
}