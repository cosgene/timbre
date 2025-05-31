import { UserButton } from "@clerk/nextjs";

import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ModeToggle } from "@/components/mode-toggle";

import { NavigationAction } from "./navigation-action";
import { NavigationItem } from "./navigation-item";

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
    const servers = [ {"id": "1", "name": "Testing", "imageUrl": "/"}, {"id": "2", "name": "Second", "imageUrl": "/"} ];

    return (
        <div className="space-y-4 flex flex-col items-center h-full text-primary w-full dark:bg-burgundy-950 py-3">
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