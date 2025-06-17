"use client"

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useState, useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import * as msgpack from '@microsoft/signalr-protocol-msgpack';

export default function VoiceChatSignalR() {
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [users, setUsers] = useState<string[]>([]);
    const audioContextRef = useRef<AudioContext | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const inputRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const audioBuffersRef = useRef<Record<string, AudioBufferSourceNode>>({});

    useEffect(() => {
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl('http://localhost:5207/voiceHub')
            .withHubProtocol(new msgpack.MessagePackHubProtocol())
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);

        newConnection.start()
            .then(() => console.log('VoiceHub connected'))
            .catch(console.error);

        newConnection.on('UserJoined', (userId: string, announce: boolean) => {
            if(users.includes(userId)) return;
            setUsers(prev => [...prev, userId]);
            //if(announce) newConnection.invoke('AddMe', newConnection.connectionId);
        });

        newConnection.on('UserLeft', (userId: string) => {
            setUsers(prev => prev.filter(id => id !== userId));
            if (audioBuffersRef.current[userId]) {
                audioBuffersRef.current[userId].stop();
                delete audioBuffersRef.current[userId];
            }
        });

        newConnection.on('AddUser', (userId: string) => {
            if(newConnection.connectionId === userId) return;
            if(users.includes(userId)) return;
            setUsers(prev => [...prev, userId]);
        });

        newConnection.on('ExistingUsers', (userIds: string[]) => {
            setUsers(userIds);
        });

        newConnection.on('ReceiveAudio', (userId: string, audioData: Uint8Array) => {
            console.log("Received audio chunk:", audioData.length);
            playAudio(userId, audioData);
        });

        return () => {
            newConnection.stop();
            stopRecording();
        };
    }, []);

    const joinChannel = async (channelId: string) => {
        if (connection) {
            await connection.invoke('JoinVoiceChannel', channelId);
        }
    };

    const leaveChannel = async () => {
        if (connection) {
            await connection.invoke('LeaveVoiceChannel');
        }
        stopRecording();
        setUsers([]);
    };

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContextRef.current = new AudioContext();

        inputRef.current = audioContextRef.current.createMediaStreamSource(stream);
        processorRef.current = audioContextRef.current.createScriptProcessor(2048, 1, 1);

        inputRef.current.connect(processorRef.current);
        processorRef.current.connect(audioContextRef.current.destination);

        processorRef.current.onaudioprocess = (e) => {
            const input = e.inputBuffer.getChannelData(0);
            const int16 = convertFloat32ToInt16(input);
            if (connection) {
                //console.log("Sending audio chunk:", int16.length);
                connection.invoke('SendAudioChunk', int16);
            }
        };

        setIsRecording(true);
    };

    const stopRecording = () => {
        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }
        if (inputRef.current) {
            inputRef.current.disconnect();
            inputRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        setIsRecording(false);
    };

    const convertFloat32ToInt16 = (buffer: Float32Array) => {
        const l = buffer.length;
        const int16 = new Int16Array(l);
        for (let i = 0; i < l; i++) {
            int16[i] = Math.max(-1, Math.min(1, buffer[i])) * 32767;
        }
        return new Uint8Array(int16.buffer);
    };

    const playAudio = (userId: string, audioData: Uint8Array) => {
        if (!audioContextRef.current) return;

        const int16 = new Int16Array(audioData.buffer, audioData.byteOffset, audioData.byteLength / 2);
        const float32 = new Float32Array(int16.length);
        for (let i = 0; i < int16.length; i++) {
            float32[i] = int16[i] / 32767;
        }

        const sampleRate = audioContextRef.current.sampleRate;

        const audioBuffer = audioContextRef.current.createBuffer(1, float32.length, sampleRate);
        audioBuffer.copyToChannel(float32, 0);

        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        source.start(0);

        audioBuffersRef.current[userId] = source;
    };

    const toggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    return (
        <div className="voice-chat-container">
            <h2>Voice Chat</h2>

            <div className="channel-controls">
                <Button onClick={() => joinChannel('room1')}>Join Room 1</Button>
                <Button onClick={leaveChannel}>Leave Room</Button>
            </div>

            <div className="recording-controls">
                <Button 
                    onClick={toggleRecording} 
                    disabled={!connection}
                    className={isRecording ? 'recording' : ''}
                >
                    {isRecording ? 'Stop Talking' : 'Start Talking'}
                </Button>
            </div>

            <div className="participants">
                <h3>Participants ({users.length})</h3>
                <ul>
                    {users.map(userId => (
                        <li key={userId}>{userId}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
