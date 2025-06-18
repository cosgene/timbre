// lib/useInitialProfile.ts
"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import axios from "axios";

export const useInitialProfile = () => {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isLoaded || !user) return;

        try {
            const response = await axios.get(`http://localhost:5207/api/profiles/fromClerk/${user.id}`);
            if (response.data) {
                setProfile(response.data);
                setLoading(false);
                return;
            }
        } catch(error) {
            console.warn("[Client Profile Not Found, Creating new]", error);
        }
        
        try{
            const name = (user.firstName == null) ? "Default Name" : user.firstName;


            const values = {
                clerkId: user.id,
                name: name,
                imageURL: user.imageUrl,
                email: user.primaryEmailAddress?.emailAddress,
            };

            const newProfile = await axios.post("http://localhost:5207/api/profiles", values);
            setProfile(newProfile.data);
        } catch (error) {
            console.error("[Client Profile Error]", error);
        } finally {
            setLoading(false);
        }
        };

    fetchProfile();
  }, [user, isLoaded]);

  return { profile, loading };
};
