import { redirect } from "next/navigation";

import { InitialModal } from "@/components/modals/initial-modal";
import { initialProfile } from "@/lib/initial-profile.server";

import axios from "axios";

const SetupPage = async () => {
    const profile = await initialProfile();

    if (!profile) return null;

    const response = await axios.get("http://localhost:5207/api/servers");
    const servers = response.data;

    const server = servers.find((server: any) => server.userId === profile.id);

    if (server) {
        return redirect(`/servers/${server.id}`);
    }

    return <InitialModal />;
};

export default SetupPage;