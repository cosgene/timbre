import { redirect } from "next/navigation";
import { Hash, Mic, ShieldAlert, ShieldCheck } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ChannelType, MemberRole, Server, Channel, Member, ChannelTypeToValue } from "@/lib/types";

import { ServerHeader } from "./server-header";
import { ServerSearch } from "./server-search";
import { ServerSection } from "./server-section";
import { ServerChannel } from "./server-channel";
import { ServerMember } from "./server-member";
import { UUID } from "crypto";
import { Timestamp } from "next/dist/server/lib/cache-handlers/types";

import axios from 'axios';
import { initialProfile } from "@/lib/initial-profile.server";

interface ServerSidebarProps {
    serverId: string;
}

const iconMap = {
    [ChannelType.Text]: <Hash className="mr-2 h-4 w-4"/>,
    [ChannelType.Voice]: <Mic className="mr-2 h-4 w-4"/>
}

const roleIconMap = {
    [MemberRole.GUEST]: null,
    [MemberRole.MODERATOR]: <ShieldCheck className="h-4 w-4 mr-2 text-burgundy-500"/>,
    [MemberRole.ADMIN]: <ShieldAlert className="h-4 w-4 mr-2 text-rose-500"/>
}

export const ServerSidebar = async ({
    serverId
}: ServerSidebarProps) => {
    // const profile = await currentProfile();

    // const server = await db.server where id = serverId
    // fetch channels order by ascending
    // fetch members where profile is true order by role ascending

    // const textChannels = server.channels where type is "TEXT"
    // const audioChannels = server.channels where type is "AUDIO" 
    // const videoChannels = server.channels where type is "VIDEO"
    // const members = server?.members where member.profileId !== profile.id

    // if (!server) {
    //     return redirect("/");
    // }

    // const role = server.members where member.profileId === profile.id role

    // для проверки
    // const profile1 = {"id": "300", "name": "Profile 1 at Server Sidebar"}
    // const member1 = {"id": "200", "role": MemberRole.GUEST, "profile": profile1}
    // const profile2 = {"id": "301", "name": "Profile 2 at Server Sidebar"}
    // const member2 = {"id": "201", "role": MemberRole.MODERATOR, "profile": profile2}
    // const server = { name: "testing@server-sidebar" };
    // const members = [member1, member2]
    // const role = "ADMIN";

    // const channel1 = {"id": "100", "name": "Channel 1 at Server Sidebar", "type": ChannelType.Text};
    // const channel2 = {"id": "101", "name": "Channel 2 at Server Sidebar", "type": ChannelType.Voice};
    // const textChannels = [channel1];
    // const audioChannels = [channel2];
    
    const profile = await initialProfile();

    var server: Server;

    try {
        const url = `http://localhost:5207/api/servers/${serverId}`
        const response = await axios.get(url);
        server = response.data as Server;
    } catch(error) {
        console.error('[Get Server (Server Sidebar)] ', error);
        return;
    }
    
    var members = server.members;
    //console.log("type " + server.channels[0].type);
    var textChannels = server.channels.filter(channel => channel.type === ChannelType.Text);
    var audioChannels = server.channels.filter(channel => channel.type === ChannelType.Voice);
    console.log("textchannels " + textChannels.length);

    var role = MemberRole.GUEST;
    // console.log("members count " + server.members.length);
    // console.log("member0 id " + server.members[0].profileId);
    // console.log("my id " + profile.id);
    // console.log("is equal " + (profile.id === server.members[0].profileId));
    // console.log("is equal2 " + (profile.id == server.members[0].profileId));
    var me = server.members.find(member => member.profileId === profile.id);
    if(me != undefined) role = me.role as MemberRole;
    else {
        console.warn("Current user " + profile.id + " is not a member of this server " + serverId + ", do something!!!!");
    }
    console.log("role " + role);

    return (
        <div className="flex flex-col h-full text-primary w-full dark:bg-burgundy-900 bg-zinc-100">
            <ServerHeader
                server={server}
                role={role}
            />
            <ScrollArea className="flex-1 px-3">
                <div className="mt-2">
                    <ServerSearch data={[
                        {
                            label: "Текстовые каналы",
                            type: "channel",
                            data: textChannels?.map((channel) => ({
                                id: channel.id,
                                name: channel.name,
                                icon: iconMap[channel.type],
                            }))
                        },
                        {
                            label: "Голосовые каналы",
                            type: "channel",
                            data: audioChannels?.map((channel) => ({
                                id: channel.id,
                                name: channel.name,
                                icon: iconMap[channel.type],
                            }))
                        },
                        {
                            label: "Участники",
                            type: "member",
                            data: members?.map((member) => ({
                                id: member.id,
                                name: member.profile.name,
                                icon: roleIconMap[member.role],
                            }))
                        }
                    ]}/>
                </div>
                <Separator className="bg-zinc-200 dark:bg-burgundy-700 rounded-md my-2"/>
                {!!textChannels?.length && (
                    <div className="mb-2">
                        <ServerSection 
                            sectionType="channels"
                            channelType={ChannelType.Text}
                            role={role}
                            label="Текстовые каналы"
                        />
                        <div className="space-y-[2px]">
                            {textChannels.map((channel) => (
                                <ServerChannel 
                                    key={channel.id}
                                    channel={channel}
                                    role={role}
                                    server={server}
                                />
                            ))}
                        </div>
                    </div>
                )}
                {!!audioChannels?.length && (
                    <div className="mb-2">
                        <ServerSection 
                            sectionType="channels"
                            channelType={ChannelType.Voice}
                            role={role}
                            label="Голосовые каналы"
                        />
                        <div className="space-y-[2px]">
                            {audioChannels.map((channel) => (
                                <ServerChannel 
                                    key={channel.id}
                                    channel={channel}
                                    role={role}
                                    server={server}
                                />
                            ))}
                        </div>
                    </div>
                )}
                {!!members?.length && (
                    <div className="mb-2">
                        <ServerSection 
                            sectionType="members"
                            role={role}
                            label="Участники"
                            server={server}
                        />
                        <div className="space-y-[2px]">
                            {members.map((member) => (
                                <ServerMember
                                    key={member.id}
                                    member={member}
                                    server={server}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}