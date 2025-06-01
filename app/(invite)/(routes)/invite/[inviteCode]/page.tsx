import { redirect } from "next/navigation";

interface InviteCodePageProps {
    params: {
        inviteCode: string;
    };
};

const InviteCodePage = async ({
    params
}: InviteCodePageProps) => {
    // TODO: fetch current profile, check if the user in the server, add user by invite link
    // const profile = await currentProfile();

    // if (!profile) {
    //     redirect to sign in
    // }

    if (!params.inviteCode) {
        return redirect("/");
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