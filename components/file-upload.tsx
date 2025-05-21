"use client";

import { X } from "lucide-react";
import Image from "next/image";

interface FileUploadProps {
    onChange: (url?: string) => void;
    value: string;
    endpoint: "messageFile" | "serverImage";
}

export const FileUpload = ({
    onChange,
    value,
    endpoint
}: FileUploadProps) => {
    const fileType = value?.split(".").pop();
    // value = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjI2hpfRuO1wu7yfAB_-KsO1-VQ6kKz852Gw&s"
    // в /next.config.ts нужно будет ввести название сайта, с которого будет подгружаться изображние
    if (value && fileType !== "pdf") {
        return (
            <div className="relative h-20 w-20">
                <Image
                    fill
                    src={value}
                    alt="Upload"
                    className="rounded-full"
                />
                <button
                    onClick={() => onChange("")}
                    className="bg-rose-500 text-white p-1 
                    rounded-full absolute top-0 right-0 shadow-sm"
                    type="button"
                >
                    <X className="h-4 w-4"/>
                </button>
            </div>
        )
    }

    return (
        <div>
            Компонент загрузки файлов
        </div>
    )
}