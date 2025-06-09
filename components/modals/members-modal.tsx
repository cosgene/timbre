"use client";

import { 
    Check,
    Gavel,
    Loader2,
    MoreVertical, 
    Shield, 
    ShieldAlert, 
    ShieldCheck, 
    ShieldQuestion
} from "lucide-react";
import { useState } from "react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { useModal } from "@/hooks/use-modal-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuTrigger,
    DropdownMenuSubTrigger
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

const roleIconMap = {
    "GUEST": null,
    "MODERATOR": <ShieldCheck className="h-4 w-4 text-burgundy-500"/>,
    "ADMIN": <ShieldAlert className="h-4 w-4 text-rose-500"/>
}

export const MembersModal = () => {
    const router = useRouter();
    const { onOpen, isOpen, onClose, type, data } = useModal();
    const [loadingId, setLoadingId] = useState("");
    
    const isModalOpen = isOpen && type === "members";
    // const { server } = data;
    const member1 = {
        profile: {
            imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWdSHU-8rEv9nuk4BRoUFB8H_3evbCmhKbmg&s",
            name: "Member At Members Modal",
            email: "member1@gmail.com"
        },
        profileId: 1,
        id: "1",
        role: "MODERATOR"
    }

        const member2 = {
        profile: {
            imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRthh_BFzHQBfZI67CR6jkPgJ-vRPdUW6stKw&s",
            name: "Member2 At Members Modal",
            email: "member2@yandex.ru",
        },
        profileId: 2,
        id: "2",
        role: "ADMIN"
    }

    const server = {
        name: "My Server At Members Modal",
        profileId: 2,
        members: [
            member1,
            member2
        ]
    }

    function pluralize(count: number, forms: [string, string, string]) {
        const mod10 = count % 10;
        const mod100 = count % 100;

        if (mod10 === 1 && mod100 !== 11) return forms[0];
        if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1]; // 2–4 участника
        return forms[2];
    }

    const onKick = async (memberId: string) => {
        try {
            setLoadingId(memberId);
            // TODO: здесь запрос, выгоняющий пользователя с сервера
            // const response = await axios.delete(url);
            router.refresh();
            // onOpen("members", { server: response.data })
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingId("");
        }
    }

    const onRoleChange = async (memberId: string, role: string /* TODO: MemberRole datatype? */) => {
        try {
            setLoadingId(memberId);
            // TODO: здесь запрос меняющий роль
            // const response = await axios.patch(url, { role });
            router.refresh();
            // onOpen("members", { server: response.data })
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingId("");
        }
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent className="bg-white text-black overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold">
                        Управление участниками
                    </DialogTitle>
                    <DialogDescription
                        className="text-center text-zinc-500"
                    >
                        {server?.members?.length} {pluralize(server?.members?.length || 0, ['участник', 'участника', 'участников'])}
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="mt-8 max-h-[420px] pr-6">
                    {server?.members?.map((member) => (
                        <div key={member.id} className="flex items-center gap-x-2 mb-6">
                            <UserAvatar src={member.profile.imageUrl}/>
                            <div className="flex flex-col gap-y-1">
                                <div className="text-xs font-semibold flex items-center gap-x-1">
                                    {member.profile.name}
                                    {roleIconMap[member.role]} {/*FIXME: add Role datatype*/}
                                </div>
                                <p className="text-xs text-zinc-500">
                                    {member.profile.email}
                                </p>
                            </div>
                            {server.profileId !== member.profileId && loadingId !== member.id && (
                                <div className="ml-auto">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger>
                                            <MoreVertical className="h-4 w-4 text-zinc-500"/>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent side="left">
                                            <DropdownMenuSub>
                                                <DropdownMenuSubTrigger
                                                    className="flex items-center"
                                                >
                                                    <ShieldQuestion className="h-4 w-4 mr-2"/>
                                                    <span>
                                                        Роль
                                                    </span>
                                                </DropdownMenuSubTrigger>
                                                <DropdownMenuPortal>
                                                    <DropdownMenuSubContent>
                                                        <DropdownMenuItem 
                                                            onClick={() => onRoleChange(member.id, "GUEST")}
                                                        >
                                                            <Shield className="h-4 w-4"/>
                                                            Гость
                                                            {member.role === "GUEST" && (
                                                                <Check className="h-4 w-4 ml-auto"/>
                                                            )}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            onClick={() => onRoleChange(member.id, "MODERATOR")}
                                                        >
                                                            <ShieldCheck className="h-4 w-4"/>
                                                            Модератор
                                                            {member.role === "MODERATOR" && (
                                                                <Check className="h-4 w-4 ml-auto"/>
                                                            )}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuSubContent>
                                                </DropdownMenuPortal>
                                            </DropdownMenuSub>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem 
                                                onClick={() => onKick(member.id)}
                                            >
                                                <Gavel className="h-4 w-4"/>
                                                Выгнать
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            )}
                            {loadingId === member.id && (
                                <Loader2 className="animate-spin text-zinc-500 ml-auto w-4 h-4"/>
                            )}
                        </div>
                    ))}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}