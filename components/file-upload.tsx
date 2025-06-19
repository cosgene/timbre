"use client";

import { X } from "lucide-react";
import Image from "next/image";

import { UploadDropzone } from "@/lib/uploadthing";

//import "@uploadthing/react/styles.css";

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
        <UploadDropzone 
        endpoint={endpoint}
        onClientUploadComplete={(res) => {
            onChange(res?.[0].ufsUrl);
        }}
        onUploadError={(error: Error) => {
            console.error("UploadThing [lib File Upload] ", error);
        }}
        // appearance={{
        //     button:
        //     "ut-ready:bg-green-500 ut-uploading:cursor-not-allowed rounded-r-none bg-red-500 bg-none after:bg-orange-400",
        //     //container: "w-max flex-row rounded-md border-cyan-300 bg-slate-800",
        //     allowedContent:
        //     "flex h-8 flex-col items-center justify-center px-2 text-white",
        // }}
        />

    )
}