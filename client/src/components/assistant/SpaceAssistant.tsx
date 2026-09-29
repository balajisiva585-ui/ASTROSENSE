import React, { useState, useRef, useEffect } from 'react';
import { useMission } from '../../context/MissionContext';
import {
  Bot,
  Send,
  X,
  Sparkles,
  ShieldCheck,
  Cpu,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  Radio,
  ExternalLink,
} from 'lucide-react';

export const SpaceAssistant: React.FC = () => {
  const {
    isAssistantOpen,
    toggleAssistant,
    closeAssistant,
    chatMessages,
    sendAssistantMessage,
    isChatLoading,
    session,
  } = useMission();

  const [input, setInput] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isAssistantOpen) {
      scrollToBottom();
    }
  }, [chatMessages, isAssistantOpen]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isChatLoading) return;
    const text = input.trim();
    setInput('');
    sendAssistantMessage(text);
  };

  const quickPrompts = [
    'What is Gaganyaan?',
    'What is Aditya-L1?',
    'What is Gateway?',
    'What is HALO?',
    'What activities can the webcam detect?',
    'Why is the camera showing ANALYZING?',
    'What does LONG INACTIVITY mean?',
    'What happens during communication loss?',
    'Show live spacecraft telemetry',
  ];

  return (
    <>
      {/* Floating Toggle Button (Bottom-Right) */}
      <button
        onClick={toggleAssistant}
        aria-label="Open AstroSense AI Mission Assistant"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-space-950 font-mono font-bold text-xs shadow-2xl shadow-cyan-500/40 border border-cyan-300/40 transition-all transform hover:scale-105 active:scale-95 group"
      >
        <div className="relative flex items-center justify-center">
          <Bot className="w-5 h-5 text-space-950" />
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-space-950 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-space-950" />
          </span>
        </div>
        <span className="tracking-wider">ASTROSENSE AI</span>
      </button>

      {/* Slide-out Chat Drawer */}
      {isAssistantOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-space-950/98 border-l border-cyan-500/40 backdrop-blur-2xl shadow-2xl flex flex-col font-mono animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-space-800 bg-space-900/90">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-hud-cyan">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    ASTROSENSE AI
                  </h3>
                  <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                    OFFLINE LOCAL KNOWLEDGE
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 font-sans">
                  Autonomous Space Mission & NASA/ISRO Knowledge Base
                </p>
              </div>
            </div>

            <button
              onClick={closeAssistant}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-space-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* System Status Sub-banner */}
          <div className="px-4 py-2 bg-space-900/60 border-b border-space-800 text-[10px] flex items-center justify-between text-gray-400">
            <div className="flex items-center gap-1.5 text-cyan-300">
              <Cpu className="w-3 h-3 text-cyan-400" />
              <span>Zero Cloud Vision / Zero OpenAI API — 100% Onboard</span>
            </div>
            <span className={`font-bold ${session?.commStatus === 'OFFLINE' ? 'text-amber-400' : 'text-emerald-400'}`}>
              LINK: {session?.commStatus || 'ONLINE'}
            </span>
          </div>

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {chatMessages.map(msg => {
              const isBot = msg.sender === 'ASSISTANT';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[94%] p-3.5 rounded-2xl ${
                      isBot
                        ? 'bg-space-900/90 border border-space-800 text-gray-200 rounded-tl-sm shadow-lg'
                        : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-sm shadow-md font-sans'
                    }`}
                  >
                    {/* Bot Message Header */}
                    {isBot && (
                      <div className="flex items-center justify-between gap-1.5 text-[10px] text-cyan-400 font-bold mb-2 pb-1 border-b border-space-800/80">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-cyan-400" />
                          <span>AstroSense Mission Intelligence</span>
                        </span>
                        <span className="text-[9px] text-gray-400 font-normal">
                          {new Date(msg.timestamp).toTimeString().split(' ')[0]} UTC
                        </span>
                      </div>
                    )}

                    {/* Message Body with Markdown-like formatting */}
                    <div className="whitespace-pre-wrap leading-relaxed font-sans text-xs">
                      {msg.text.split('\n').map((line, i) => {
                        if (line.startsWith('• ') || line.startsWith('- ')) {
                          return (
                            <div key={i} className="pl-2 my-0.5 text-gray-300">
                              {line}
                            </div>
                          );
                        }
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return (
                            <div key={i} className="font-bold text-cyan-300 my-1 font-mono">
                              {line.replace(/\*\*/g, '')}
                            </div>
                          );
                        }
                        return <p key={i} className="my-1">{line.replace(/\*\*(.*?)\*\*/g, '$1')}</p>;
                      })}
                    </div>

                    {/* Verified Knowledge & Sources Attribution Cards */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-space-800/80 flex flex-col gap-2">
                        {msg.sources.map((src, sIdx) => {
                          const isNasa = src.sourceAgency === 'NASA';
                          const isIsro = src.sourceAgency === 'ISRO';
                          const isSim = src.type === 'SIMULATED_TELEMETRY';
                          const isRec = src.type === 'AI_RECOMMENDATION';

                          return (
                            <div
                              key={sIdx}
                              className="bg-space-950/90 rounded-lg p-2.5 border border-space-800 flex flex-col gap-1.5 font-mono text-[10px]"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 font-bold">
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-emerald-300">
                                    {isNasa
                                      ? 'VERIFIED SPACE KNOWLEDGE // NASA'
                                      : isIsro
                                      ? 'VERIFIED SPACE KNOWLEDGE // ISRO'
                                      : src.type.replace(/_/g, ' ')}
                                  </span>
                                </div>

                                {src.sourceUrl && (
                                  <a
                                    href={src.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2 py-0.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 flex items-center gap-1 transition"
                                  >
                                    <span>OPEN SOURCE</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                )}
                              </div>

                              <div className="text-gray-400 flex items-center justify-between">
                                <span>{src.sourceTitle || src.title}</span>
                                {src.verifiedAt && (
                                  <span className="text-gray-500 text-[9px]">Verified: {src.verifiedAt}</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Human Verification Disclaimer for Decision Support */}
                    {msg.isDecisionSupport && (
                      <div className="mt-2.5 p-2 rounded bg-amber-950/60 border border-amber-500/40 text-[10px] text-amber-200/90 font-mono">
                        ⚠️ <strong>AI DECISION SUPPORT:</strong> Human verification required before operational execution.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isChatLoading && (
              <div className="flex items-center gap-2 text-cyan-400 text-xs p-3 rounded-xl bg-space-900 border border-space-800 font-mono animate-pulse">
                <Bot className="w-4 h-4 animate-spin" />
                <span>Querying local verified space knowledge base...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Suggestions */}
          <div className="px-3 py-2 bg-space-900/90 border-t border-space-800 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => sendAssistantMessage(qp)}
                  className="px-2.5 py-1 rounded-full bg-space-950 hover:bg-space-800 border border-space-700 text-[10px] text-gray-300 hover:text-cyan-300 transition-colors"
                >
                  {qp}
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-space-900 border-t border-space-800 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask about NASA Gateway, ISRO Gaganyaan, HAR activities, telemetry..."
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-space-950 border border-space-800 text-white placeholder-gray-500 text-xs font-sans focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || isChatLoading}
              aria-label="Send message to assistant"
              className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-space-950 font-bold transition-all shadow-hud-cyan"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Scientific Transparency & Academic Attribution Disclaimer Footer */}
          <div className="px-4 py-2 bg-space-950 border-t border-space-800/80 text-[9px] font-sans text-gray-500 text-center leading-relaxed">
            ASTROSENSE is an independent student prototype. NASA and ISRO information is sourced from publicly available official agency material.
          </div>
        </div>
      )}
    </>
  );
};

