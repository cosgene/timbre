import {useState} from 'react';
import useVoiceChat from '../hooks/use-voice-chat';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function VoiceChat() {
    const { joinVoiceChannel, leaveVoiceChannel, isConnected } = useVoiceChat();
    const [currentChannel, setCurrentChannel] = useState<{serverId: string; channelId: string} | null>(null);

    const handleJoin = () => {
        var serverId = (document.getElementById("serverInput") as HTMLInputElement).value.trim();
        var channelId = (document.getElementById("channelInput") as HTMLInputElement).value.trim();

        setCurrentChannel({serverId: serverId, channelId: channelId});

        //console.log(serverId);
        //console.log(channelId);
        //console.log(currentChannel);
        //if (currentChannel) {
            joinVoiceChannel(serverId, channelId);
        //}
    };

    const handleLeave = () => {
        leaveVoiceChannel();
        setCurrentChannel(null);
    };

    // просто хардкод сервера и каналы для тестов
    const setServer1 = () => {
        (document.getElementById("serverInput") as HTMLInputElement).value = "246c2480-fb79-480f-a02b-96d4007b8da1";
        (document.getElementById("channelInput") as HTMLInputElement).value = "dc428e2e-a534-426d-a2dc-17270151d58b";
    }
    const setServer2 = () => {
        (document.getElementById("serverInput") as HTMLInputElement).value = "55a5b2b9-ffc0-45a5-9874-9507cd2ee888";
        (document.getElementById("channelInput") as HTMLInputElement).value = "c8010ee1-daed-4cb5-b171-151cfca5478f";
    }

    return (
        <div>
            <Input id="serverInput" placeholder="ID Сервера (uuidv4)" />
            <Input id="channelInput" placeholder="ID Канала (uuidv4)" />
            <Button onClick={setServer1}>Server 1</Button>
            <Button onClick={setServer2}>Server 2</Button>

            <Button onClick={handleJoin} disabled={isConnected}>
                Join Voice
            </Button>
            
            <Button onClick={handleLeave} disabled={!currentChannel}>
                Leave Voice
            </Button>
            
            <div>
                <h3>Voice Participants</h3>
                {/* Список участников */}
            </div>
        </div>
    );
}