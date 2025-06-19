import { initialProfile } from "@/lib/initial-profile.server";
import { Server } from "@/lib/types";
import axios from "axios";
import { redirect } from "next/navigation";

interface InviteCodePageProps {
    params: {
        inviteCode: string;
    };
};

const InviteCodePage = async ({
    params
}: InviteCodePageProps) => {
    if (!params.inviteCode) {
        return redirect("/");
    }

    const profile = await initialProfile();

    try {
        const response = await axios.post(`http://localhost:5207/api/invite/${params.inviteCode}`, {profileId: profile.id});

        var server = response.data as Server;

        return redirect(`/servers/${server.id}`);
    } catch(error) {
        console.error("On Invite Accept", error);
    }

    // const existingServer = await db server find 
    // where inviteCode === params.inviteCode 
    // and profile.id in members

    // if (existingServer) {
    // return redirect(`/servers/${existingServer.id}`);
    //}

    // const server = await db server update
    // where inviteCode === params.inviteCode
    // members create profileId: profile.id

    // if (server) {
    //     return redirect(`/servers/${server.id}`);
    // }

    return null;
}
 
export default InviteCodePage;