"use client";

import qs from "querystring";
import axios from 'axios';
import { useState } from "react";

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
import { useSignalR } from "../signalr-context";


export const DeleteMessageModal = () => {
    const { isOpen, onClose, type, data } = useModal();
    
    const isModalOpen = isOpen && type === "deleteMessage";
    const { query } = data;

    const [ isLoading, setIsLoading ] = useState(false);

    const onClick = async () => {
        try {
            if(!query || !query.connection) return;

            setIsLoading(true);

            await query.connection.invoke("DeleteMessage", 
                query!.serverId,
                query!.channelId,
                query!.id,
            );

            onClose();
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
                        Удалить сообщение
                    </DialogTitle>
                    <DialogDescription className="text-center text-zinc-500">
                        Вы действительно хотите удалить это сообщение?
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
                            Удалить
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}