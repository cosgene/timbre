"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form";
import { useEffect, useReducer } from "react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileUpload } from "../file-upload";
import { useModal } from "@/hooks/use-modal-store";

import axios from 'axios';
import { Server } from "@/lib/types";
import { useRouter } from "next/navigation";


const formSchema = z.object({
    name: z.string().min(1, {
        message: "Необходимо задать название сервера."
    }),
    imageUrl: z.string().min(1, {
        message: "Необходимо задать значок сервера."
    })
});

export const EditServerModal = () => {
    const router = useRouter();
    const { isOpen, onClose, type, data } = useModal();
    
    const isModalOpen = isOpen && type === "editServer";
    const { server } = data;

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            imageUrl: "",
        }
    });

    useEffect(() => {
        if (server) {
            form.setValue("name", server.name);
            form.setValue("imageUrl", server.imageUrl);
        }
    }, [server, form]);

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        
        try {
            const request = {"name": values.name, "imageUrl": values.imageUrl};
            const response = await axios.put(`http://localhost:5207/api/servers/${(server as Server).id}`, request);
            console.log(response.data);
        } catch(error) {
            console.error('[Edit Server (Edit Server Modal)] ', error);
        }

        router.refresh();
        console.log(values);
        onClose();
    }

    const handleClose = () => {
        form.reset();
        onClose();
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={handleClose}>
            <DialogContent className="bg-white text-black p-0 overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold">
                        Настройте сервер
                    </DialogTitle>
                    <DialogDescription className="text-center text-zinc-500">
                        Персонализируйте свой сервер, выбрав ему название и значок.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="space-y-8 px-6">
                            <div className="flex items-center justify-center text-center">
                                {/* TODO: Загрузка изображения */}
                                <FormField
                                    control={form.control}
                                    name="imageUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <FileUpload 
                                                    endpoint="serverImage"
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="uppercase text-xs font-bold text-zinc-500
                                        dark:text-secondary/70"
                                        >
                                            Название сервера
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                disabled={isLoading}
                                                className="bg-zinc-300/50 border-0 
                                                focus-visible:ring-0 text-black
                                                focus-visible:ring-offset-0"
                                                placeholder="Введите название сервера"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter className="bg-gray-100 px-6 py-4">
                            <Button type='submit' variant="primary" disabled={isLoading}>
                                Сохранить
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}