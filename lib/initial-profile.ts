import { currentUser } from "@clerk/nextjs/server";

import axios from 'axios';
// import { RedirectToSignIn } from "@clerk/nextjs";

// import { db } from "@/lib/db";

export const initialProfile = async () => {
    const user = await currentUser();

    if (!user) {
        // return redirect to sign in
        console.error("Not logged in Clerk");
        return;
    }

    var profile;
    try {
        const response = axios.get(`http://localhost:5207/profiles/fromClerk/${user.id}`);
        profile = (await response).data;
    } catch(error) {
        console.error("[Get Profile (Initial Profile Lib) ", error);
        return;
    }

    if(profile) return profile;

    try {
        const values = {"clerkId": user.id, "name": user.firstName, "imageURL": user.imageUrl, "email": user.primaryEmailAddress};
        const newProfile = axios.post("http://localhost:5207/profiles", values);

        return newProfile;
    } catch(error) {
        console.error('[Create Profile (Initial profile lib)] ', error);
    }

    // const profile = await db.profile.findUnique({
    //   where: {
    //     userId: user.id
    //   }
    // });

    // if (profile) {
    //   return profile;
    // }

    // const newProfile = await db.profile.create({
    //   data: {
    //     userId: user.id,
    //     name: `${user.firstName} ${user.lastName}`,
    //     imageUrl: user.imageUrl,
    //     email: user.emailAddresses[0].emailAddress
    //   }
    // });

    // return newProfile;
}