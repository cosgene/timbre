import { ServerSidebar } from "@/components/server/server-sidebar";
import { redirect } from "next/navigation";

const ServerIdLayout = async ({ 
    children,
    params,
}: {
    children: React.ReactNode;
    params: { serverId: string };
}) => {
    // const profile = await currentProfile();

    // if (!profile) {
        // redirect to sign in
    // }

    // const server = await db.server 
    // where id = params.serverId
    // and members has profileId = profile.id

    // if (!server) {
    //     redirect("/");
    // }

    return ( 
        <div className="h-full">
            <div className="hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0">
                {/* FIXME@[serverId]/layout.tsx: params должен быть ассинхронным */}
                <ServerSidebar serverId={params.serverId}/>
            </div>
            <main className="h-full md:pl-60">
                {children}
            </main>
        </div>
    );
}
 
export default ServerIdLayout;