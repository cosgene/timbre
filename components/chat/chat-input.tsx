"use client";

import * as z from "zod";
import axios from "axios";
import qs from "querystring";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";


interface ChatInputProps {
    apiUrl: string;
    query: Record<string, any>; // 
    name: string;
    type: "conversation" | "channel";
}

const formSchema = z.object({
    content: z.string().min(1),
});

export const ChatInput = ({
    apiUrl,
    query,
    name,
    type
}: ChatInputProps) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: "",
        }
    })

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            // TODO: отправить сообщение в обработчик
            // const url = qs.stringify({
            //     url: apiUrl,
            //     query: query
            // });
            // await axios.post(url, values);
            console.log(values);
        } catch (error) {
            console.log("Message sending error (@/components/chat/chat-input.tsx)", error)
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
                                        className="absolute top-7 left-8 h-[24px] w-[24px] bg-zinc-500 dark:bg-burgundy-500 hover:bg-zinc-600 dark:hover:bg-burgundy-400 transition rounded-full p-1 flex items-center justify-center"
                                    >
                                        <Plus className="text-white dark:text-burgundy-600"/>
                                    </button>
                                    <Input 
                                        disabled={isLoading}
                                        className="px-14 py-6 bg-zinc-200/90 dark:bg-burgundy-600/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-burgundy-100"
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