"use client";

import qs from "querystring";
import axios from 'axios';
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
import { useModal } from "@/hooks/use-modal-store";
import { Button } from "@/components/ui/button";
import { Channel, Server } from "@/lib/types";


export const DeleteChannelModal = () => {
    const { isOpen, onClose, type, data } = useModal();
    const router = useRouter();
    
    const isModalOpen = isOpen && type === "deleteChannel";
    const { server, channel } = data;

    const [ isLoading, setIsLoading ] = useState(false);

    const onClick = async () => {
        try {
            setIsLoading(true);
            // TODO: удаление каналов
            // ???
            // const url = qs.stringify({
            //     url: `/api/channels/${channel?.id}`,
            //     query: {
            //         serverId: server?.id
            //     }
            // })
            // axios.delete(url);
            
            await axios.delete(`http://localhost:5207/api/servers/${(server as Server).id}/channels/${(channel as Channel).id}`);

            onClose();
            router.refresh();
            router.push(`/servers/${server?.id}`);
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
                        Удалить канал
                    </DialogTitle>
                    <DialogDescription className="text-center text-zinc-500">
                        Вы уверены, что хотите удалить <span className="font-semibold text-burgundy-500">#{channel?.name}</span>? Это действие нельзя отменить.
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
                            Удалить канал
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}