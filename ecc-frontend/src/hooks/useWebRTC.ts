import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';

export type PeerConnectionMap = {
  [userId: string]: RTCPeerConnection;
};

export type PeerMediaStreamMap = {
  [userId: string]: MediaStream;
};

interface UseWebRTCProps {
  sessionId: number;
  onChatMessageReceived?: (msg: any) => void;
  onHandSignalReceived?: (msg: any) => void;
  onVocabReceived?: (vocab: any) => void;
  onUserStatusChanged?: (type: 'JOIN' | 'LEAVE', userId: string) => void;
}

export const useWebRTC = ({ sessionId, onChatMessageReceived, onHandSignalReceived, onVocabReceived, onUserStatusChanged }: UseWebRTCProps) => {
  const { user, accessToken } = useAuthStore();
  
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<PeerMediaStreamMap>({});
  const [micOn, setMicOn] = useState(false);
  const [videoOn, setVideoOn] = useState(false);
  
  const stompClientRef = useRef<Client | null>(null);
  const peersRef = useRef<PeerConnectionMap>({});
  const localStreamRef = useRef<MediaStream | null>(null);

  const STOMP_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/ws`;

  const sendSignal = useCallback((type: string, targetId: string | null, payload: any) => {
    if (stompClientRef.current?.connected && user) {
      stompClientRef.current.publish({
        destination: `/app/signal.send/${sessionId}`,
        body: JSON.stringify({
          type,
          senderId: user.userId.toString(),
          targetId,
          payload
        })
      });
    }
  }, [sessionId, user]);

  const sendChatMessage = useCallback((content: string, type: string = 'TEXT') => {
     if (stompClientRef.current?.connected) {
       stompClientRef.current.publish({
         destination: `/app/chat.sendMessage/${sessionId}`,
         body: JSON.stringify({ content, type })
       });
     } else {
       toast.error("Chưa kết nối đến phòng chat");
     }
  }, [sessionId]);

  const sendHandSignal = useCallback((action: string, targetUserId?: number) => {
    if (stompClientRef.current?.connected) {
      stompClientRef.current.publish({
        destination: `/app/session.handSignal/${sessionId}`,
        body: JSON.stringify({ action, targetUserId })
      });
    }
  }, [sessionId]);

  const createPeerConnection = useCallback((peerId: string) => {
    if (peersRef.current[peerId]) return peersRef.current[peerId];

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal('ice-candidate', peerId, event.candidate);
      }
    };

    pc.ontrack = (event) => {
      setRemoteStreams(prev => ({ ...prev, [peerId]: event.streams[0] }));
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'closed') {
        setRemoteStreams(prev => {
          const newStreams = { ...prev };
          delete newStreams[peerId];
          return newStreams;
        });
        delete peersRef.current[peerId];
      }
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    peersRef.current[peerId] = pc;
    return pc;
  }, [sendSignal]);

  useEffect(() => {
    if (!user || !accessToken) return;

    let isMounted = true;

    // 1. Lấy quyền Camera/Mic
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        // Tắt sẵn để người dùng tự bật
        stream.getAudioTracks().forEach(t => t.enabled = false);
        stream.getVideoTracks().forEach(t => t.enabled = false);
        
        if (!isMounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        setLocalStream(stream);
        localStreamRef.current = stream;
      } catch (error) {
        console.error("Không thể lấy luồng media:", error);
        toast.error("Không thể lấy quyền truy cập Camera/Micro");
      }
    };

    // 2. Kết nối STOMP
    const initStomp = () => {
      if (!isMounted) return;
      const client = new Client({
        webSocketFactory: () => new SockJS(STOMP_URL),
        connectHeaders: {
          Authorization: `Bearer ${accessToken}`
        },
        reconnectDelay: 5000,
        onConnect: () => {
          console.log("STOMP Connected");
          
          // Subscribe Signal (WebRTC)
          client.subscribe(`/topic/room/${sessionId}/signal`, async (msg) => {
            const data = JSON.parse(msg.body);
            if (data.senderId === user.userId.toString()) return; // Ignore own signal

            if (data.type === 'user-joined') {
              if (onUserStatusChanged) onUserStatusChanged('JOIN', data.senderId);
              // New user joined, we are already in the room, so we create an offer
              const pc = createPeerConnection(data.senderId);
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              sendSignal('offer', data.senderId, offer);
            } 
            else if (data.type === 'offer' && data.targetId === user.userId.toString()) {
              const pc = createPeerConnection(data.senderId);
              await pc.setRemoteDescription(new RTCSessionDescription(data.payload));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              sendSignal('answer', data.senderId, answer);
            }
            else if (data.type === 'answer' && data.targetId === user.userId.toString()) {
              const pc = peersRef.current[data.senderId];
              if (pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(data.payload));
              }
            }
            else if (data.type === 'ice-candidate' && data.targetId === user.userId.toString()) {
              const pc = peersRef.current[data.senderId];
              if (pc) {
                await pc.addIceCandidate(new RTCIceCandidate(data.payload));
              }
            }
            else if (data.type === 'user-left') {
               if (onUserStatusChanged) onUserStatusChanged('LEAVE', data.senderId);
               setRemoteStreams(prev => {
                 const newStreams = { ...prev };
                 delete newStreams[data.senderId];
                 return newStreams;
               });
               if (peersRef.current[data.senderId]) {
                 peersRef.current[data.senderId].close();
                 delete peersRef.current[data.senderId];
               }
            }
            else if (data.type === 'vocab') {
              if (onVocabReceived) onVocabReceived(data.payload);
            }
          });

          // Subscribe Chat & Hand Signal
          client.subscribe(`/topic/chat/${sessionId}`, (msg) => {
            const data = JSON.parse(msg.body);
            // Nếu có action nghĩa là Hand Signal, ngược lại là Chat Message
            if (data.action) {
              if (onHandSignalReceived) onHandSignalReceived(data);
            } else {
              if (onChatMessageReceived) onChatMessageReceived(data);
            }
          });

          // Thông báo cho mọi người biết mình vừa vào phòng
          sendSignal('user-joined', null, null);
        },
        onStompError: (frame) => {
          console.error('Broker reported error: ' + frame.headers['message']);
          console.error('Additional details: ' + frame.body);
        },
      });

      client.activate();
      stompClientRef.current = client;
    };

    initMedia().then(initStomp);

    return () => {
      isMounted = false;
      // Cleanup
      sendSignal('user-left', null, null);
      if (stompClientRef.current) stompClientRef.current.deactivate();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      Object.values(peersRef.current).forEach(pc => pc.close());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, user, accessToken, STOMP_URL, createPeerConnection, sendSignal]);

  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(t => t.enabled = !micOn);
      setMicOn(!micOn);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(t => t.enabled = !videoOn);
      setVideoOn(!videoOn);
    }
  };

  return {
    localStream,
    remoteStreams,
    micOn,
    videoOn,
    toggleMic,
    toggleVideo,
    sendChatMessage,
    sendHandSignal,
    sendSignal
  };
};
