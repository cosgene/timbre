import axios from "axios";
import { redirect } from "next/navigation";

import { initialProfile } from "@/lib/initial-profile.server";
import { Conversation, Server } from "@/lib/types";
import { getOrCreateConversation } from "@/lib/conversation";
import { ChatHeader } from "@/components/chat/chat-header";

interface MemberIdPageProps {
    params: {
        memberId: string;
        serverId: string;
    }
}

const MemberIdPage = async ({
    params
}: MemberIdPageProps) => {
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
        console.error('[Get Server (Member Id Page)] ', error);
        return;
    }

    const currentMember = server.members.find(member => member.profileId === profile.id);

    if (!currentMember) {
        return redirect('/');
    }

    // const conversation = await getOrCreateConversation(currentMember.id, params.memberId);
    const conversation = {
        // залогиненный пользователь
        memberOne: {
            profileId: currentMember.profileId,
            profile: {
                name: "You",
                imageUrl: "/"
            }
        },
        memberTwo: {
            profileId: "228",
            profile: {
                name: "Other Person",
                imageUrl: "/"
            }
        }
    }

    if (!conversation) {
        return redirect(`/servers/${params.serverId}`);
    }

    const { memberOne, memberTwo } = conversation as Conversation;

    const otherMember = memberOne.profileId === profile.id ? memberTwo : memberOne;

    return ( 
        <div className="bg-white dark:bg-burgundy-950 flex flex-col h-full">
            <ChatHeader 
                imageUrl={otherMember.profile.imageUrl}
                name={otherMember.profile.name}
                serverId={params.serverId}
                type="conversation"
            />
        </div>
    );
}
 
export default MemberIdPage;