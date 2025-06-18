// lib/initialProfile.server.ts
import { currentUser } from "@clerk/nextjs/server";
import axios from "axios";

export const initialProfile = async () => {
  const user = await currentUser();

  if (!user) {
    console.error("Not logged in Clerk");
    return null;
  }

  try {
    const response = await axios.get(`http://localhost:5207/api/profiles/fromClerk/${user.id}`);
    if (response.data) return response.data;
  } catch (error) {
    console.error("[Get Profile (Server)]", error);
  }

  try {
    const values = {
      clerkId: user.id,
      name: user.firstName,
      imageURL: user.imageUrl,
      email: user.primaryEmailAddress?.emailAddress,
    };

    const newProfile = await axios.post("http://localhost:5207/api/profiles", values);
    return newProfile.data;
  } catch (error) {
    console.error("[Create Profile (Server)]", error);
  }

  return null;
};
