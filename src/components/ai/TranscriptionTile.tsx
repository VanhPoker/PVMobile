import React, { useEffect, useState } from "react";
import {
  TrackReferenceOrPlaceholder,
  useChat,
  useLocalParticipant,
  useTrackTranscription,
} from "@livekit/react-native";
import {
  LocalParticipant,
  Participant,
  Track,
  TranscriptionSegment,
} from "livekit-client";

interface ChatMessageType {
  message: string;
  name: string;
  isSelf: boolean;
  timestamp: number;
}

export function TranscriptionTile({
  agentAudioTrack,
  userAudioTrack,
  accentColor,
  onAgentTranscript,
  onUserTranscript,
}: {
  agentAudioTrack?: TrackReferenceOrPlaceholder;
  userAudioTrack?: TrackReferenceOrPlaceholder;
  accentColor: string;
  onAgentTranscript?: (transcript: { content: string; isFinal: boolean; sender: string }) => void;
  onUserTranscript?: (transcript: { content: string; isFinal: boolean; sender: string }) => void;
}) {
  const agentMessages = useTrackTranscription(agentAudioTrack || undefined);
  const userMessages = useTrackTranscription(userAudioTrack || undefined);
  const localParticipant = useLocalParticipant();
  const localMessages = useTrackTranscription({
    publication: localParticipant.microphoneTrack,
    source: Track.Source.Microphone,
    participant: localParticipant.localParticipant,
  });

  const [transcripts, setTranscripts] = useState<Map<string, ChatMessageType>>(new Map());
  const [userTranscripts, setUserTranscripts] = useState<Map<string, ChatMessageType>>(new Map()); // THÊM: Map cho user transcripts
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const { chatMessages, send: sendChat } = useChat();

  // EFFECT: Xử lý agent và user transcript  
  useEffect(() => {
    console.log('=== TRANSCRIPT PROCESSING DEBUG ===');
    console.log('agentAudioTrack:', agentAudioTrack);
    // console.log('agentMessages.segments:', agentMessages.segments);
    
    // XỬ LÝ: Agent transcript  
    if (agentAudioTrack && onAgentTranscript && agentMessages.segments) {
      agentMessages.segments.forEach((segment, index) => {
        const existingTranscript = transcripts.get(segment.id);
        
        if (!existingTranscript || existingTranscript.message !== segment.text) {
          console.log('📤 Sending AGENT transcript for streaming:', {
            content: segment.text,
            isFinal: segment.final
          });
          
          onAgentTranscript({
            content: segment.text,
            isFinal: segment.final,
            sender: 'ai'
            // KHÔNG có source - để phân biệt với lk.transcription
          });
          
          // Cập nhật transcripts map
          transcripts.set(segment.id, {
            message: segment.text,
            name: 'Agent',
            isSelf: false,
            timestamp: Date.now()
          });
        }
      });
    }
    
    // XỬ LÝ: User transcript từ localMessages
    if (onUserTranscript && localMessages.segments) {
      console.log('Processing user segments, count:', localMessages.segments.length);
      
      localMessages.segments.forEach((segment, index) => {
        console.log(`👤 User Segment ${index}:`, {
          id: segment.id,
          text: segment.text?.substring(0, 50) + '...',
          final: segment.final,
          typeof_final: typeof segment.final
        });
        
        const existingTranscript = userTranscripts.get(segment.id);
        
        if (!existingTranscript || existingTranscript.message !== segment.text) {
     
          
          console.log('📤 Sending USER transcript:', {
            content: segment.text,
            isFinal: segment.final,
            original_final: segment.final
          });
          
          onUserTranscript({
            content: segment.text,
            isFinal: segment.final,
            sender: 'user'
          });
          
          // CẬP NHẬT userTranscripts map
          userTranscripts.set(segment.id, {
            message: segment.text,
            name: 'You',
            isSelf: true,
            timestamp: Date.now()
          });
        } else {
          console.log('⏭️ Skipping duplicate user transcript for segment:', segment.id);
        }
      });
    }
  }, [
    agentMessages.segments, 
    localMessages.segments, 
    onAgentTranscript, 
    onUserTranscript, 
    agentAudioTrack
  ]); // BỎ transcripts và userTranscripts khỏi dependency để tránh infinite loop

  // store transcripts
  useEffect(() => {
    console.log('agentAudioTrack:', agentAudioTrack)
    console.log('agentMessages.segments:', agentMessages.segments)
    if (agentAudioTrack) {
      agentMessages.segments.forEach((s) => {
        const msg = segmentToChatMessage(
          s,
          transcripts.get(s.id),
          agentAudioTrack.participant,
        );
        transcripts.set(s.id, msg);
        console.log('Agent transcript:', msg);
      });
    }

    localMessages.segments.forEach((s) =>
      transcripts.set(
        s.id,
        segmentToChatMessage(
          s,
          transcripts.get(s.id),
          localParticipant.localParticipant,
        ),
      ),
    );

    const allMessages = Array.from(transcripts.values());
    for (const msg of chatMessages) {
      const isAgent = agentAudioTrack
        ? msg.from?.identity === agentAudioTrack.participant?.identity
        : msg.from?.identity !== localParticipant.localParticipant.identity;
      const isSelf =
        msg.from?.identity === localParticipant.localParticipant.identity;
      let name = msg.from?.name;
      if (!name) {
        if (isAgent) {
          name = "Agent";
        } else if (isSelf) {
          name = "You";
        } else {
          name = "Unknown";
        }
      }
      allMessages.push({
        name,
        message: msg.message,
        timestamp: msg.timestamp,
        isSelf: isSelf,
      });
      console.log('Pushed chat message:', { name, message: msg.message, isSelf });
    }
    allMessages.sort((a, b) => a.timestamp - b.timestamp);
    setMessages(allMessages);
  }, [
    transcripts,
    chatMessages,
    localParticipant.localParticipant,
    agentAudioTrack?.participant,
    agentMessages.segments,
    localMessages.segments,
    agentAudioTrack,
  ]);

  return (
    null
  );
}

function segmentToChatMessage(
  s: TranscriptionSegment,
  existingMessage: ChatMessageType | undefined,
  participant: Participant,
): ChatMessageType {
  const msg: ChatMessageType = {
    message: s.final ? s.text : `${s.text} ...`,
    name: participant instanceof LocalParticipant ? "You" : "Agent",
    isSelf: participant instanceof LocalParticipant,
    timestamp: existingMessage?.timestamp ?? Date.now(),
  };
  return msg;
}