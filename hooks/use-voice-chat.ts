import { useEffect, useRef, useCallback, useState } from 'react';
import * as signalR from '@microsoft/signalr';

export default function useVoiceChat() {
    const voiceConnectionRef = useRef<signalR.HubConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const peerConnectionsRef = useRef<Record<string, RTCPeerConnection>>({});
    const audioElementsRef = useRef<Record<string, HTMLAudioElement>>({});
    const [participants, setParticipants] = useState<string[]>([]);
    const [isMuted, setIsMuted] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Инициализация подключения к VoiceHub
    useEffect(() => {
        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`http://localhost:5207/voiceHub`, {
                withCredentials: true,
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: retryContext => {
                    return Math.min(retryContext.elapsedMilliseconds * 2, 10000);
                }
            })
            .configureLogging(signalR.LogLevel.Warning)
            .build();

        voiceConnectionRef.current = connection;

        // Обработчики событий соединения
        connection.onclose(error => {
            console.log("Voice connection closed", error);
            setIsMuted(true);
        });
        
        connection.onreconnecting(error => {
            console.log("Voice connection reconnecting", error);
        });
        
        connection.onreconnected(connectionId => {
            console.log("Voice connection reconnected");
            setIsMuted(false);
        });

        // Обработчики сообщений хаба
        connection.on('UserJoined', handleUserJoined);
        connection.on('UserLeft', handleUserLeft);
        connection.on('ReceiveSignal', handleSignal);
        connection.on('ReceiveAudio', handleAudio);

        connection.start()
            .then(() => console.log('Connected to VoiceHub'))
            .catch(error => console.error('VoiceHub connection failed:', error));

        return () => {
            connection.stop();
            Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
            localStreamRef.current?.getTracks().forEach(track => track.stop());
            mediaRecorderRef.current?.stop();
        };
    }, []);

    const handleUserJoined = useCallback(async (connectionId: string) => {
        if (connectionId === voiceConnectionRef.current?.connectionId) return;
        
        console.log(`User ${connectionId} joined voice channel`);
        
        // Добавляем в список участников
        setParticipants(prev => [...prev, connectionId]);
        
        // Создаем новое WebRTC соединение
        const peerConnection = new RTCPeerConnection({
            iceServers: [], // Пустой массив для локальной сети
            iceTransportPolicy: "all", // Разрешаем все типы кандидатов
            iceCandidatePoolSize: 5, // Увеличиваем пул кандидатов
            // iceServers: [
            //     { urls: "stun:stun.l.google.com:19302" },
            //     { urls: "stun:stun.l.google.com:5349" },
            //     { urls: "stun:stun1.l.google.com:3478" },
            //     { urls: "stun:stun1.l.google.com:5349" },
            //     // { 
            //     //     urls: 'turn:your-turn-server.com:3478',
            //     //     username: 'username',
            //     //     credential: 'password'
            //     // }
            // ],
        });
        
        peerConnectionsRef.current[connectionId] = peerConnection;

        // Добавляем локальный поток (если есть)
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                peerConnection.addTrack(track, localStreamRef.current!);
                console.log('addtrack '+ track);
            });
        }

        // Создаем предложение (offer)
        try {
            const offer = await peerConnection.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: false
            });
            
            await peerConnection.setLocalDescription(offer);
            
            // Отправляем предложение через SignalR
            voiceConnectionRef.current?.invoke('SendSignal', 
                connectionId, 
                JSON.stringify(offer)
            );
        } catch (error) {
            console.error('Error creating offer:', error);
        }

        // Обработка ICE кандидатов
        peerConnection.onicecandidate = event => {
            console.log('on ice candidate ' + event);
            if (event.candidate) {
                console.log('valid candidate');
                voiceConnectionRef.current?.invoke('SendSignal', 
                    connectionId, 
                    JSON.stringify(event.candidate)
                );
            }
        };

        // Обработка входящих медиа-потоков
        peerConnection.ontrack = event => {
            const stream = event.streams[0];
            if (!stream) return;
            
            // Создаем или обновляем аудио-элемент
            let audioElement = audioElementsRef.current[connectionId];
            if (!audioElement) {
                audioElement = document.createElement('audio');
                audioElement.id = `audio-${connectionId}`;
                audioElement.autoplay = true;
                audioElement.controls = false;
                document.body.appendChild(audioElement);
                audioElementsRef.current[connectionId] = audioElement;
            }
            
            // Применяем поток
            audioElement.srcObject = stream;
            
            const playPromise = audioElement.play();
            console.log("audio created");
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn('Autoplay prevented:', error);
                    // Показать кнопку "Разрешить воспроизведение"
                });
            }
        };

        // Обработка закрытия соединения
        peerConnection.onconnectionstatechange = () => {
            if (peerConnection.connectionState === 'disconnected') {
                handleUserLeft(connectionId);
            }
        };
        peerConnection.oniceconnectionstatechange = () => console.log(`ICE state: ${peerConnection.iceConnectionState}`);
        peerConnection.onsignalingstatechange = () => console.log(`Signaling state: ${peerConnection.signalingState}`);
        peerConnection.addEventListener("icegatheringstatechange", (ev) => {
        switch (peerConnection.iceGatheringState) {
            case "new":
            console.log("icegatherstatechange new");
            break;
            case "gathering":
            console.log("icegatherstatechange gathering");
            break;
            case "complete":
            console.log("icegatherstatechange complete");
            break;
        }
        });

    }, []);

    const handleUserLeft = useCallback((connectionId: string) => {
        console.log(`User ${connectionId} left voice channel`);
        
        // Закрываем WebRTC соединение
        const peerConnection = peerConnectionsRef.current[connectionId];
        if (peerConnection) {
            peerConnection.close();
            delete peerConnectionsRef.current[connectionId];
        }
        
        // Удаляем аудио-элемент
        const audioElement = audioElementsRef.current[connectionId];
        if (audioElement) {
            audioElement.remove();
            delete audioElementsRef.current[connectionId];
        }
        
        // Удаляем из списка участников
        setParticipants(prev => prev.filter(id => id !== connectionId));
    }, []);

    const handleSignal = useCallback(async (
        senderId: string, 
        signalData: string
    ) => {
        
        console.log("signal " + signalData);
        const signal = JSON.parse(signalData);
        let peerConnection = peerConnectionsRef.current[senderId];
        
        // Если соединение еще не создано (входящий вызов)
        if (!peerConnection) {
            peerConnection = new RTCPeerConnection({
                iceServers: [], // Пустой массив для локальной сети
                iceTransportPolicy: "all", // Разрешаем все типы кандидатов
                iceCandidatePoolSize: 5 // Увеличиваем пул кандидатов
                // iceServers: [
                //     { urls: "stun:stun.l.google.com:19302" },
                //     { urls: "stun:stun.l.google.com:5349" },
                //     { urls: "stun:stun1.l.google.com:3478" },
                //     { urls: "stun:stun1.l.google.com:5349" },
                // ]
            });
            
            peerConnectionsRef.current[senderId] = peerConnection;
            
            // Обработка входящих медиа-потоков
            peerConnection.ontrack = event => {
                const stream = event.streams[0];
                const audioElement = document.createElement('audio');
                audioElement.id = `audio-${senderId}`;
                audioElement.autoplay = true;
                document.body.appendChild(audioElement);
                
                audioElement.srcObject = stream;

                
                audioElement.play().catch(console.warn);
                console.log("audio created");
            };
            
            // Добавляем локальный поток
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => {
                    peerConnection.addTrack(track, localStreamRef.current!);
                    console.log('addtrack '+ track);
                });
            }
        }
        
        // Обработка сигнала
        try {
            if (signal.candidate) {
                console.log("signal candidate");
                await peerConnection.addIceCandidate(
                    new RTCIceCandidate(signal)
                );
            }
            else if (signal.sdp) {
                console.log("signal sdp");
                await peerConnection.setRemoteDescription(
                    new RTCSessionDescription(signal)
                );
                
                // Если это предложение (offer), создаем ответ (answer)
                if (signal.type === 'offer') {
                    console.log("signal offer");
                    const answer = await peerConnection.createAnswer();
                    await peerConnection.setLocalDescription(answer);
                    
                    voiceConnectionRef.current?.invoke('SendSignal', 
                        senderId, 
                        JSON.stringify(answer)
                    );
                }
            }
        } catch (error) {
            console.error('Error processing signal:', error);
        }
    }, []);

    const handleAudio = useCallback((
        senderId: string, 
        audioData: ArrayBuffer
    ) => {
        // Для базового подхода: декодирование и воспроизведение
        const audioContext = new AudioContext();
        audioContext.decodeAudioData(audioData.slice(0), buffer => {
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.start(0);
        });
        
        // Для более продвинутого подхода: буферизация потокового аудио
        // (требует более сложной реализации на сервере и клиенте)
    }, []);

    // Инициализация локального аудио-потока
    const startLocalAudio = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    noiseSuppression: true,
                    echoCancellation: true,
                    autoGainControl: true
                },
                video: false
            });
            
            localStreamRef.current = stream;
            setIsMuted(false);
            
            // Начинаем запись для отправки на сервер (опционально)
            if (process.env.NEXT_PUBLIC_AUDIO_STREAMING === 'signalr') {
                startAudioStreaming(stream);
            }
            
            return true;
        } catch (error) {
            console.error('Error accessing microphone:', error);
            return false;
        }
    }, []);

    // Запуск стриминга аудио через SignalR (альтернатива WebRTC)
    const startAudioStreaming = useCallback((stream: MediaStream) => {
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(1024, 1, 1);
        
        source.connect(processor);
        processor.connect(audioContext.destination);
        
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];
        
        processor.onaudioprocess = event => {
            const inputBuffer = event.inputBuffer;
            const outputBuffer = event.outputBuffer;
            
            for (let channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
                const inputData = inputBuffer.getChannelData(channel);
                const outputData = outputBuffer.getChannelData(channel);
                
                // Обработка аудио (шумоподавление и т.д.)
                for (let i = 0; i < inputBuffer.length; i++) {
                    outputData[i] = inputData[i];
                }
            }
        };
        
        mediaRecorderRef.current.ondataavailable = event => {
            if (event.data.size > 0) {
                // Отправляем аудио-данные на сервер
                voiceConnectionRef.current?.invoke(
                    'SendAudioStream', 
                    event.data
                ).catch(console.error);
            }
        };
        
        mediaRecorderRef.current.start(100); // Отправка каждые 100мс
    }, []);

    // Вход в голосовой канал
    const joinVoiceChannel = useCallback(async (serverId: string, channelId: string) => {
        console.log(voiceConnectionRef);
        if (!voiceConnectionRef.current) return false;
        
        try {
            // Запрашиваем доступ к микрофону
            const audioStarted = await startLocalAudio();
            if (!audioStarted) return false;
            
            // Присоединяемся к каналу на сервере
            await voiceConnectionRef.current.invoke(
                'JoinVoiceChannel', 
                serverId, 
                channelId
            );
            
            return true;
        } catch (error) {
            console.error('Error joining voice channel:', error);
            return false;
        }
    }, [startLocalAudio]);

    // Выход из голосового канала
    const leaveVoiceChannel = useCallback(async () => {
        if (!voiceConnectionRef.current) return;
        
        try {
            // Уведомляем сервер о выходе
            await voiceConnectionRef.current.invoke('LeaveVoiceChannel');
            
            // Закрываем все соединения
            Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
            peerConnectionsRef.current = {};
            
            // Останавливаем локальный поток
            localStreamRef.current?.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
            
            // Останавливаем запись
            mediaRecorderRef.current?.stop();
            mediaRecorderRef.current = null;
            
            // Удаляем все аудио-элементы
            Object.values(audioElementsRef.current).forEach(el => el.remove());
            audioElementsRef.current = {};
            
            setParticipants([]);
        } catch (error) {
            console.error('Error leaving voice channel:', error);
        }
    }, []);

    // Переключение микрофона
    const toggleMute = useCallback(() => {
        if (localStreamRef.current) {
            const newState = !isMuted;
            localStreamRef.current.getAudioTracks().forEach(track => {
                track.enabled = newState;
            });
            setIsMuted(newState);
        }
    }, [isMuted]);

    return {
        joinVoiceChannel,
        leaveVoiceChannel,
        toggleMute,
        isMuted,
        participants,
        isConnected: voiceConnectionRef.current?.state === signalR.HubConnectionState.Connected
    };
}