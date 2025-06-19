import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

import { initialProfile } from "@/lib/initial-profile.server";
import { Profile } from "@/lib/types";

const f = createUploadthing();

const handleAuth = async () => {
    const profile = await initialProfile();
    return {userId: (profile as Profile).id};
}

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
    serverImage: f({image: {maxFileSize: "4MB", maxFileCount: 1}})
        .middleware(() => handleAuth())
        .onUploadComplete(() => {}),
    messageFile: f(["image", "pdf"])
        .middleware(() => handleAuth())
        .onUploadComplete(() => {})

} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
