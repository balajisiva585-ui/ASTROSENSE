import React, { useState, useEffect, useRef } from 'react';
import { useMission } from '../../context/MissionContext';
import { VoiceStatus } from './VoiceStatus';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  X,
  Terminal,
  Radio,
  Sparkles,
  Bot,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';

export const VoiceAssistant: React.FC = () => {
  const { isVoiceModalOpen, closeVoiceModal, sendVoiceCommand } = useMission();
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceHistory, setVoiceHistory] = useState<Array<{ role: 'USER' | 'ASSISTANT'; text: string; timestamp: string }>>([
    {
      role: 'ASSISTANT',
      text: 'ASTROSENSE VOICE ready. You can speak into your microphone or choose a mission query below.',
      timestamp: new Date().toTimeString().split(' ')[0],
    },
  ]);
  const [isMuted, setIsMuted] = useState(false);
  const [hasSpeechRecognition, setHasSpeechRecognition] = useState(false);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setHasSpeechRecognition(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setHasSpeechRecognition(false);
    }
  }, []);

  // When speech transcript finishes, process command
  useEffect(() => {
    if (!isListening && transcript.trim()) {
      handleExecuteCommand(transcript);
      setTranscript('');
    }
  }, [isListening, transcript]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [voiceHistory, isProcessing]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use the text command input.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        setTranscript('');
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Speech recognition start error:', err);
      }
    }
  };

  const speakText = (text: string) => {
    if (isMuted || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Pick crisp english voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleExecuteCommand = async (command: string) => {
    if (!command.trim() || isProcessing) return;

    const time = new Date().toTimeString().split(' ')[0];
    const userMsg = { role: 'USER' as const, text: command, timestamp: time };
    setVoiceHistory(prev => [...prev, userMsg]);
    setInputText('');
    setIsProcessing(true);

    try {
      const res = await sendVoiceCommand(command);
      const assistantText = res.data?.responseText || res.data?.spokenText || 'Command processed.';
      const spoken = res.data?.spokenText || assistantText;

      setVoiceHistory(prev => [
        ...prev,
        { role: 'ASSISTANT' as const, text: assistantText, timestamp: new Date().toTimeString().split(' ')[0] },
      ]);

      speakText(spoken);
    } catch (err: any) {
      setVoiceHistory(prev => [
        ...prev,
        {
          role: 'ASSISTANT' as const,
          text: `Command error: ${err.message || 'Unable to process offline command'}`,
          timestamp: new Date().toTimeString().split(' ')[0],
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const suggestedCommands = [
    'What is the mission status?',
    'How is the crew?',
    'Who is currently working?',
    'Who is resting?',
    'Are there any anomalies?',
    'Show spacecraft telemetry.',
    'Is communication online?',
    'Enter autonomous mode.',
    'Check crew schedule.',
    'What is the next crew activity?',
    'What is ARES doing?',
    'What is NOVA monitoring?',
  ];

  if (!isVoiceModalOpen) return null;

  const getStatusState = () => {
    if (!hasSpeechRecognition) return 'UNAVAILABLE';
    if (isListening) return 'LISTENING';
    if (isProcessing) return 'PROCESSING';
    if (isSpeaking) return 'SPEAKING';
    return 'IDLE';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-space-900 border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.25)] flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-space-950 border-b border-space-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold font-mono text-white tracking-wider uppercase">
                  ASTROSENSE VOICE MISSION ASSISTANT
                </h3>
                <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono px-2 py-0.5 rounded">
                  LOCAL NLP ENGINE
                </span>
              </div>
              <p className="text-xs text-gray-400">Zero-cloud offline speech recognition and synthesis</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 rounded-lg border transition ${
                isMuted
                  ? 'bg-red-500/20 text-red-400 border-red-500/30'
                  : 'bg-space-900 text-gray-300 border-space-800 hover:text-cyan-400'
              }`}
              title={isMuted ? 'Voice Unmute' : 'Voice Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={closeVoiceModal}
              className="p-2 rounded-lg bg-space-900 border border-space-800 text-gray-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Status Indicator */}
        <div className="px-4 pt-3">
          <VoiceStatus
            status={getStatusState()}
            isListening={isListening}
            isSpeaking={isSpeaking}
            transcript={transcript}
            hasSpeechRecognition={hasSpeechRecognition}
          />
        </div>

        {/* Conversation Body */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 min-h-[260px] max-h-[360px]">
          {voiceHistory.map((item, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                item.role === 'USER' ? 'items-end' : 'items-start'
              }`}
            >
              <div className="text-[10px] font-mono text-gray-400 mb-1 px-1">
                {item.role === 'USER' ? 'COMMANDER' : 'ASTROSENSE VOICE'} • {item.timestamp}
              </div>
              <div
                className={`p-3 rounded-xl max-w-[85%] text-xs font-mono whitespace-pre-line leading-relaxed ${
                  item.role === 'USER'
                    ? 'bg-cyan-600 text-white rounded-br-none shadow-md'
                    : 'bg-space-950 text-gray-200 border border-space-800 rounded-bl-none shadow-md'
                }`}
              >
                {item.text}
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono animate-pulse">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              Processing local telemetry and mission state...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Voice Commands Quick-Chips */}
        <div className="px-4 py-2 border-t border-space-800 bg-space-950/60 flex flex-col gap-1.5">
          <span className="text-[10px] font-mono text-gray-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" /> SUGGESTED VOICE QUERIES:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {suggestedCommands.slice(0, 5).map((cmd, i) => (
              <button
                key={i}
                onClick={() => handleExecuteCommand(cmd)}
                className="shrink-0 bg-space-900 hover:bg-cyan-950 hover:border-cyan-500/50 border border-space-800 px-2.5 py-1 rounded-full text-[11px] font-mono text-gray-300 hover:text-cyan-300 transition"
              >
                "{cmd}"
              </button>
            ))}
          </div>
        </div>

        {/* Interaction Input Footer */}
        <div className="p-4 bg-space-950 border-t border-space-800 flex items-center gap-3">
          {hasSpeechRecognition && (
            <button
              onClick={toggleListening}
              className={`p-3 rounded-xl font-mono text-xs font-bold flex items-center gap-2 transition ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_15px_rgba(0,240,255,0.3)]'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {isListening ? 'LISTENING...' : 'SPEAK'}
            </button>
          )}

          <div className="flex-1 relative flex items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleExecuteCommand(inputText);
              }}
              placeholder={hasSpeechRecognition ? "Or type voice command here..." : "Type voice command here (Text Fallback Mode)..."}
              className="w-full bg-space-900 border border-space-800 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 font-mono outline-none pr-10"
            />
            <button
              onClick={() => handleExecuteCommand(inputText)}
              disabled={!inputText.trim()}
              className="absolute right-2 p-1.5 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-black rounded-lg transition disabled:opacity-30"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
