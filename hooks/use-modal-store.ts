import { create } from "zustand";

export type ModalType = "createServer" | "invite" | "editServer" | "members" | "createChannel";

interface ModalData {
    server?: { name: string } // change datatype in future
}

interface ModalStore {
    type: ModalType | null;
    data: ModalData;
    isOpen: boolean;
    onOpen: (type: ModalType, data?: ModalData) => void;
    onClose: () => void;
}

export const useModal = create<ModalStore>((set) => ({
    type: null,
    data: {},
    isOpen: false,
    onOpen: (type, data = {}) => set({ isOpen: true, type, data }),
    onClose: () => set({ isOpen: false, type: null })
}));