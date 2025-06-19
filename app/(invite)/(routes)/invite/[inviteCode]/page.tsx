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

    var server: Server;

    try {
        const response = await axios.post(`http://localhost:5207/api/invite/${params.inviteCode}`, {profileId: profile.id});

        server = response.data as Server;

        console.log('server = ', server);
        console.log('server id ', server.id);

    } catch(error) {
        console.error("On Invite Accept", error);
        return redirect("/");
    }
    return redirect(`/servers/${server!.id}`);

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