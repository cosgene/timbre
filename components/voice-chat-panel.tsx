// components/VoiceChatPanel.tsx
import { useState, useEffect } from 'react';
import useVoiceChat from '../hooks/use-voice-chat';

export default function VoiceChatPanel({ serverId, channelId }: { 
    serverId: string; 
    channelId: string;
}) {
    const {
        joinVoiceChannel,
        leaveVoiceChannel,
        toggleMute,
        isMuted,
        participants,
        isConnected
    } = useVoiceChat();
    
    const [isJoined, setIsJoined] = useState(false);
    const [status, setStatus] = useState('disconnected');

    useEffect(() => {
        return () => {
            if (isJoined) {
                leaveVoiceChannel();
            }
        };
    }, [isJoined, leaveVoiceChannel]);

    const handleJoin = async () => {
        setStatus('connecting...');
        const success = await joinVoiceChannel(serverId, channelId);
        setIsJoined(success);
        setStatus(success ? 'connected' : 'failed');
    };

    const handleLeave = async () => {
        setStatus('disconnecting...');
        await leaveVoiceChannel();
        setIsJoined(false);
        setStatus('disconnected');
    };

    return (
        <div className="voice-chat-panel">
            <div className="voice-status">
                Status: {status} | Participants: {participants.length}
            </div>
            
            {!isJoined ? (
                <button 
                    onClick={handleJoin} 
                    disabled={!isConnected}
                    className="join-button"
                >
                    Join Voice Channel
                </button>
            ) : (
                <div className="voice-controls">
                    <button 
                        onClick={toggleMute}
                        className={`mute-button ${isMuted ? 'muted' : ''}`}
                    >
                        {isMuted ? 'Unmute' : 'Mute'}
                    </button>
                    <button 
                        onClick={handleLeave}
                        className="leave-button"
                    >
                        Leave Channel
                    </button>
                </div>
            )}
            
            <div className="participants-list">
                <h4>Participants:</h4>
                <ul>
                    {participants.map((id, index) => (
                        <li key={id}>{`Participant ${index + 1}`}</li>
                    ))}
                </ul>
            </div>
            
            <div id="remote-audios-container" style={{ display: 'none' }} />
        </div>
    );
}