import CodeSessionEditor from "@/components/editor/monaco-editor";

const CodePage = ({params} : {params: {serverId: string, channelId: string}}) => {
    return (  
        <div>
            Server ID Page.
            {/* <main className="flex justify-center items-start min-h-screen bg-gray-100">
            <div className="w-full max-w-4xl mt-10">
                <h1 className="text-2xl font-bold mb-4">Совместный редактор кода</h1> */}
                <CodeSessionEditor serverId={params.serverId} channelId={params.channelId} />
            {/* </div>
            </main> */}
        </div>
    );
}
 
export default CodePage;