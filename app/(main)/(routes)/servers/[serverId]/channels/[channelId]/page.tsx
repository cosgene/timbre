import axios from "axios";
import { redirect } from "next/navigation";

import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessages } from "@/components/chat/chat-messages";
import { initialProfile } from "@/lib/initial-profile.server";
import { Server } from "@/lib/types";

import { SignalRProvider } from "@/components/signalr-context";

interface ChannelIdPageProps {
    params: {
        serverId: string;
        channelId: string;
    }
}

const ChannelIdPage = async ({
    params
}: ChannelIdPageProps) => {
    const profile = await initialProfile();

    if (!profile) {
        return null;
    }

    var server: Server;

    try {
        const url = `http://localhost:5207/api/servers/${params.serverId}`
        const response = await axios.get(url);
        server = response.data as Server;
    } catch(error) {
        console.error('[Get Server (Channel Id Page)] ', error);
        return;
    }

    const channel = server.channels.find(channel => channel.id === params.channelId);
    const member = server.members.find(member => member.profileId === profile.id);

    if (!channel || !member) {
        return redirect('/');
    }

    return ( 
        <SignalRProvider
        serverId={channel.serverId}
        channelId={channel.id}
        >
            <div className="bg-white dark:bg-burgundy-950 flex flex-col h-full">
                {/* Channel Id Page. Server: {server.name}, Channel: {channel.name}, Member Role: {member.profile.name} */}
                <ChatHeader 
                    name={channel.name}
                    serverId={channel.serverId}
                    type="channel"
                />
                <ChatMessages 
                    member={member}
                    name={channel.name}
                    chatId={channel.id}
                    type="channel"
                    apiUrl="/" // TODO: /api/messages/ ?
                    socketUrl="http://localhost:5207/chatHub" // /api/socket/messages ?
                    socketQuery={{
                        channelId: channel.id,
                        serverId: channel.serverId,
                    }}
                    paramKey="channelId"
                    paramValue={channel.id}
                />
                <ChatInput
                    member={member}
                    name={channel.name}
                    type="channel"
                    apiUrl="/" // TODO: /api/socket/messages ?
                    query={{
                        channelId: channel.id,
                        serverId: channel.serverId,
                    }}
                />
            </div>
        </SignalRProvider>
     );
}
 
export default ChannelIdPage;