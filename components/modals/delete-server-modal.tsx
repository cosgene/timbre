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
import { Server } from "@/lib/types";

export const DeleteServerModal = () => {
    const { isOpen, onClose, type, data } = useModal();
    const router = useRouter();
    
    const isModalOpen = isOpen && type === "deleteServer";
    const { server } = data;

    const [ isLoading, setIsLoading ] = useState(false);

    const onClick = async () => {
        try {
            setIsLoading(true);
            
            await axios.delete(`http://localhost:5207/api/servers/${(server as Server).id}`);
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
                        Удалить сервер
                    </DialogTitle>
                    <DialogDescription className="text-center text-zinc-500">
                        Вы уверены, что хотите удалить <span className="font-semibold text-burgundy-500">{server?.name}</span>? Это действие нельзя отменить.
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
                            Удалить сервер
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}