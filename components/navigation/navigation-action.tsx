"use client";

import { Plus } from "lucide-react";

import { ActionTooltip } from "@/components/action-tooltip";
import { useModal } from "@/hooks/use-modal-store";

export const NavigationAction = () => {
    const { onOpen } = useModal();

    return (
        <div>
            <ActionTooltip
                side="right"
                align="center"
                label="Создать сервер"
            >
                <button
                onClick={() => onOpen("createServer")}
                    className="group flex items-center"
                >
                    <div className="flex mx-3 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden items-center justify-center bg-white group-hover:bg-burgundy-400 dark:bg-burgundy-800 dark:group-hover:bg-burgundy-500">
                        <Plus 
                            className="group-hover:text-white transition text-burgundy-300"
                            size={25}
                        />
                    </div>
                </button>
            </ActionTooltip>
        </div>
    );
}