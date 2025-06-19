import { ChatHeader } from "@/components/chat/chat-header";
import { initialProfile } from "@/lib/initial-profile.server";
import { Server } from "@/lib/types";
import axios from "axios";
import { redirect } from "next/navigation";

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
        <div className="bg-white dark:bg-burgundy-950 flex flex-col h-full">
            {/* Channel Id Page. Server: {server.name}, Channel: {channel.name}, Member Role: {member.profile.name} */}
            <ChatHeader 
                name={channel.name}
                serverId={channel.serverId}
                type="channel"
            />
        </div>
     );
}
 
export default ChannelIdPage;