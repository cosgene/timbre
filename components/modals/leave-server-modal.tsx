"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { useModal } from "@/hooks/use-modal-store";

import axios from 'axios';
import { useInitialProfile } from "@/lib/use-initial-profile";
import { Profile, Server } from "@/lib/types";

export const LeaveServerModal = () => {
    const { profile, loading: profileLoading } = useInitialProfile();
    const { isOpen, onClose, type, data } = useModal();
    const router = useRouter();
    
    const isModalOpen = isOpen && type === "leaveServer";
    const { server } = data;

    const [ isLoading, setIsLoading ] = useState(false);

    const onClick = async () => {
        if(profileLoading || !profile) return;

        try {
            setIsLoading(true);
            
            try {
                const response = await axios.post(`http://localhost:5207/api/servers/${(server as Server).id}/leave/${(profile as Profile).id}`);
                console.log(response.data);
            } catch(error) {
                console.error('[Leave Server (Leave Server Modal)] ', error);
            }

            onClose();
            router.refresh();
            router.push("/");
        } catch(error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent className="bg-white text-black p-0 overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold">
                        Покинуть сервер
                    </DialogTitle>
                    <DialogDescription className="text-center text-zinc-500">
                        Вы уверены, что хотите покинуть <span className="font-semibold text-burgundy-500">{server?.name}</span>? Вы не сможете вернуться на этот сервер, пока вас снова не пригласят.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="bg-gray-100 px-6 py-4">
                    <div className="flex items-center justify-between w-full">
                        <Button
                            disabled={isLoading}
                            onClick={onClose}
                            variant="ghost"
                        >
                            Отмена
                        </Button>
                        <Button
                            disabled={isLoading}
                            onClick={onClick}
                            variant="primary"
                        >
                            Покинуть сервер
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}