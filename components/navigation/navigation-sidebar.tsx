import { UserButton } from "@clerk/nextjs";

import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ModeToggle } from "@/components/mode-toggle";

import { NavigationAction } from "./navigation-action";
import { NavigationItem } from "./navigation-item";

import { auth } from '@clerk/nextjs/server';

import axios from 'axios';
import { initialProfile } from "@/lib/initial-profile.server";
import { Profile, Server } from "@/lib/types";
import { timeStamp } from "console";

export const NavigationSidebar = async () => {
    // const profile = await currentProfile();

    /*
    if (!profile) {
        return redirect(/);
    }
    */

    // const servers = await db.server
    // where profileId = profile.id

    // для проверки
    //const servers = [ {"id": "1", "name": "Testing", "imageUrl": "/"}, {"id": "2", "name": "Second", "imageUrl": "/"} ];

    // TODO убрать получение серверов отсюдова и сделать чтобы можно было иницциировать 
    // обновление списка извне (например при создании нового сервера список надо обновить)

    //var servers: Server[] = [{"id": "0", "name": "Default Server", "imageUrl": "/", "inviteCode": "", "profileId": "", "profile": null,}];
    
    const profile = await initialProfile();
    var servers: Server[] = profile.servers;
    console.log(servers);

    // try {
    //     const serversReq = await axios.get<Server[]>("http://localhost:5207/api/servers");
    //     servers = serversReq.data;
    //     console.log(serversReq.data);
    // } catch (error) {
    //     console.error("Get Servers List ", error);
    // }

    return (
        <div className="space-y-4 flex flex-col items-center h-full text-primary w-full dark:bg-burgundy-950 bg-zinc-200 py-3">
            <NavigationAction />
            <Separator className="h-[2px] bg-zinc-300 dark:bg-burgundy-700 rounded-md w-10 mx-auto"/>
            <ScrollArea className="flex-1 w-full">
                {servers.map((server) => (
                    <div key={server.id} className="mb-4">
                        <NavigationItem 
                            id={server.id}
                            name={server.name}
                            imageUrl={server.imageUrl}
                        />
                    </div>
                ))}
            </ScrollArea>
            <div className="pb-3 mt-auto flex items-center flex-col gap-y-4">
                <ModeToggle />
                <UserButton 
                    afterSignOutUrl="/"
                    appearance={{
                        elements: {
                            avatarBox: "h-[48px] w-[48px]"
                        }
                    }}
                />
            </div>
        </div>
    );
}