"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form";

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
//import { initialProfile } from "@/lib/initial-profile";
import { useInitialProfile } from "@/lib/use-initial-profile";
import { Profile } from "@/lib/types";
import { redirect, useRouter } from "next/navigation";

const formSchema = z.object({
    name: z.string().min(1, {
        message: "Необходимо задать название сервера."
    }),
    imageUrl: z.string().min(1, {
        message: "Необходимо задать значок сервера."
    })
});

export const CreateServerModal = () => {
    const { isOpen, onClose, type } = useModal();
    const { profile, loading: profileLoading } = useInitialProfile();
    const router = useRouter();
    
    const isModalOpen = isOpen && type === "createServer";

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            imageUrl: "",
        }
    });

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if(profileLoading || !profile) return;
        try {
            const request = {"name": values.name, "imageUrl": values.imageUrl, "userId": (profile as Profile).id}
            const response = await axios.post("http://localhost:5207/api/servers", request);
            console.log(response.data);
            redirect(`/servers/${response.data.id}`);
        } catch(error) {
            console.error('[Create Server (Create Server Modal)] ', error);
        }

        router.refresh();
        // TODO: здесь логика при отправке формы
        // console.log(values);
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
                        Персонализируйте свой новый сервер, выбрав ему название и значок. Их можно будет изменить в любой момент.
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
                                Создать
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}