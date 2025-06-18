"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form";
import { ChannelType, Profile, Server } from "@/lib/types";

import {
    Dialog,
    DialogContent,
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
import { useModal } from "@/hooks/use-modal-store";
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";


import axios from 'axios';
import { useInitialProfile } from "@/lib/use-initial-profile";

const formSchema = z.object({
    name: z.string().min(1, {
        message: "Необходимо задать название канала."
    }).refine(
        name => name !== "общее",
        {
            message: "Название канала 'общее' недопустимо."
        }
    ),
    type: z.nativeEnum(ChannelType)
});

export const CreateChannelModal = () => {
    const { isOpen, onClose, type, data } = useModal();
    const { profile, loading: profileLoading } = useInitialProfile();

    const {server} = data;
    
    const isModalOpen = isOpen && type === "createChannel";

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            type: ChannelType.Text,
        }
    });

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if(profileLoading || !profile) return;

        try {
            const request = {name: values.name, serverId: (server as Server).id, profileId: (profile as Profile).id, type: values.type}  // АААААЫФВВЖЖЖЖЖЖЖЖЖЖЖ
            const url = `http://localhost:5207/api/servers/${(server as Server).id}/channels`
            const response = await axios.post(url, request);
            console.log(response.data);
        } catch(error) {
            console.error('[Create Channel (Create Channel Modal)] ', error);
        }

        // TODO: здесь логика при отправке формы
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
                        Создать канал
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="space-y-8 px-6">
                            
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="uppercase text-xs font-bold text-zinc-500
                                        dark:text-secondary/70"
                                        >
                                            Название канала
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                disabled={isLoading}
                                                className="bg-zinc-300/50 border-0 
                                                focus-visible:ring-0 text-black
                                                focus-visible:ring-offset-0"
                                                placeholder="Введите название канала"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField 
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Тип канала</FormLabel>
                                        <Select
                                            disabled={isLoading}
                                            onValueChange={(value) => field.onChange(value as ChannelType)}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger
                                                    className="bg-zinc-300/50 border-0 focus:ring-0 text-black ring-offset-0 focus:ring-offset-0 capitalize outline-none"
                                                >
                                                    <SelectValue placeholder="Выберите тип канала"/>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Object.values(ChannelType).map((type) => (
                                                    <SelectItem
                                                        key={type}
                                                        value={type}
                                                        className="capitalize"
                                                    >
                                                        {type.toLowerCase()}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
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