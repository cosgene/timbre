import { Hash } from "lucide-react";

interface ChatWelcomeProps {
    name: string;
    type: "channel" | "conversation";
}

export const ChatWelcome = ({
    name,
    type
}: ChatWelcomeProps) => {
    return (
        <div className="space-y-2 px-4 mb-4">
            {type === "channel" && (
                <div className="h-[75px] w-[75px] rounded-full bg-burgundy-400 dark:bg-burgundy-700 flex items-center justify-center">
                    <Hash className="h-12 w-12 text-white dark:text-burgundy-100"/>
                </div>
            )}
            <p className="text-xl md:text-3xl font-bold dark:text-burgundy-100">
                {type === "channel" ? "Добро пожаловать на канал #" : ""}{name}!
            </p>
            <p className="text-zinc-600 dark:text-burgundy-200 text-sm">
                {type === "channel"
                    ? `Это начало канала #${name}.`
                    : `Это начало истории ваших личных сообщений с ${name}`
                }
            </p>
        </div>
    );
}