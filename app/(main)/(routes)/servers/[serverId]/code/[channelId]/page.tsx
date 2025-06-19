import CodeSessionEditor from "@/components/editor/monaco-editor";

const CodePage = ({params} : {params: {serverId: string, channelId: string}}) => {
    return (  
        <CodeSessionEditor serverId={params.serverId} channelId={params.channelId} />
    );
}
 
export default CodePage;