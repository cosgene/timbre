"use client";

import * as z from "zod";
import axios from "axios";
import qs from "querystring";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useSignalR } from "../signalr-context";
import { Member } from "@/lib/types";



interface ChatInputProps {
    member: Member;
    apiUrl: string;
    query: Record<string, any>; // 
    name: string;
    type: "conversation" | "channel";
}

const formSchema = z.object({
    content: z.string().min(1),
});

export const ChatInput = ({
    member,
    apiUrl,
    query: { serverId, channelId },
    name,
    type
}: ChatInputProps) => {
    const router = useRouter();
    const { connection, isConnected } = useSignalR();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: "",
        }
    })

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            if (!connection || !isConnected) {
                console.warn("SignalR not connected");
                return;
            }

            // Отправка через SignalR
            await connection.invoke("SendMessage", 
                serverId,
                channelId,
                member,
                values.content,
            );

            form.reset();
            //router.refresh();
        } catch (error) {
            console.error("Message sending error (ChatInput):", error);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <div className="relative p-4 pb-6">
                                    <button 
                                        type="button"
                                        onClick={() => {}}
                                        className="absolute top-7 left-8 h-[24px] w-[24px] bg-burgundy-400 dark:bg-burgundy-400 hover:bg-burgundy-300 dark:hover:bg-burgundy-300 transition rounded-full p-1 flex items-center justify-center"
                                    >
                                        <Plus className="text-white dark:text-burgundy-600"/>
                                    </button>
                                    <Input 
                                        disabled={isLoading}
                                        className="px-14 py-6 bg-zinc-200/90 dark:bg-burgundy-600/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-burgundy-100 dark:placeholder:text-burgundy-200"
                                        placeholder={`Написать ${type === "conversation" ? name : "в #" + name}`}
                                        {...field}
                                    />
                                </div>
                            </FormControl>
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    );
}