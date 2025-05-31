import { redirect } from "next/navigation";
import { ServerHeader } from "./server-header";

interface ServerSidebarProps {
    serverId: string;
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
    const server = { name: "testing" };
    const role = "ADMIN";

    return (
        <div className="flex flex-col h-full text-primary w-full dark:bg-burgundy-900 bg-zinc-100">
            <ServerHeader
                server={server}
                role={role}
            />
        </div>
    );
}