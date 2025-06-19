import CodeSessionEditor from "@/components/editor/monaco-editor";
import { MediaRoom } from "@/components/media-room";

const VoicePage = ({params} : {params: {serverId: string, channelId: string}}) => {
    return (  
        <MediaRoom 
            chatId={params.channelId}
            video={false}
            audio={true}
        />
    );
}
 
export default VoicePage;