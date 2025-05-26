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
                    {/* FIXME: group hover color change not working */}
                    <div className="flex mx-3 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden items-center justify-center bg-background dark:bg-[#3A1C24] group-hover:bg-[#A4243B]">
                        <Plus 
                            className="group-hover:text-[#E6D6D6] transition text-[#A4243B]"
                            size={25}
                        />
                    </div>
                </button>
            </ActionTooltip>
        </div>
    );
}