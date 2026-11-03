import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  Sparkles,
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Train,
  ShieldCheck,
  AlertTriangle,
  UtensilsCrossed,
  BookOpen,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  QrCode,
  ChevronDown,
  Minimize2,
  Maximize2,
  GripVertical
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actionToken?: string;
}

interface SwaminiAssistantProps {
  onNavigateTab: (tab: string, subCategory?: string) => void;
  onOpenQRScanner: () => void;
  currentZoneRestricted: boolean;
}

export const SwaminiAssistant: React.FC<SwaminiAssistantProps> = ({
  onNavigateTab,
  onOpenQRScanner,
  currentZoneRestricted
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [liveTranscription, setLiveTranscription] = useState('');

  // Initial greeting from Swamini
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: `Namaste! I am **Swamini**, your official FAIRFLOW AI Travel & Rail Companion.\n\n` +
        `I can help you with:\n` +
        `• **Tatkal Booking**: Timing rules (10 AM AC / 11 AM Non-AC), speed tips, and token queue system.\n` +
        `• **Railway Glossary**: Understanding RAC vs WL, GNWL, PQWL, chart preparation, and refund slabs.\n` +
        `• **RailMadad Complaints**: Step-by-step guidance to lodge in-train issues (hygiene, AC, security).\n` +
        `• **E-Catering Food**: How to order delicious thalis, biryani, or Jain sattvik meals to your berth.\n` +
        `• **Station Safety**: Track geofencing rules and official Station Master QR clearance.\n\n` +
        `How can I assist your journey today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  // Floating draggable position for Swamini Launcher with guaranteed 72px clearance from right-side Railway Scroll Track
  const calculateDefaultPosition = useCallback(() => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 640;
      const trackWidth = isMobile ? 44 : 48; // RailwayScrollTrack width
      const trackClearance = 72; // requested clearance to the left of the scroll track
      const buttonWidth = isMobile ? 52 : 155; // width of launcher button

      // Position from left so the right edge of the launcher sits 72px left of the track
      const x = Math.max(16, window.innerWidth - (trackWidth + trackClearance + buttonWidth));
      // Position from top so it sits comfortably at bottom-right (above mobile bottom bar if mobile)
      const y = isMobile
        ? Math.max(80, window.innerHeight - 132)
        : Math.max(80, window.innerHeight - 84);

      return { x, y };
    }
    return { x: 300, y: 500 };
  }, []);

  const [position, setPosition] = useState<{ x: number; y: number }>(calculateDefaultPosition);

  // Reposition/clamp if the window is resized to always preserve scroller clearance
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        const isMobile = window.innerWidth < 640;
        const trackWidth = isMobile ? 44 : 48;
        const trackClearance = 72;
        const buttonWidth = isMobile ? 52 : 155;
        const minX = 16;
        const maxX = Math.max(minX, window.innerWidth - (trackWidth + trackClearance + buttonWidth));
        const minY = 72;
        const maxY = Math.max(minY, window.innerHeight - (isMobile ? 128 : 76));

        return {
          x: Math.max(minX, Math.min(maxX, prev.x)),
          y: Math.max(minY, Math.min(maxY, prev.y))
        };
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isDraggingRef = useRef(false);
  const dragStartOffset = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);

  // Auto-scroll chat to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Speech synthesis response
  const speakText = useCallback((text: string) => {
    if (isAudioMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    try {
      window.speechSynthesis.cancel();

      // Clean markdown tags and action tokens from spoken speech
      const cleanText = text
        .replace(/\[ACTION:[A-Z_]+\]/g, '')
        .replace(/[*#_`]/g, '')
        .replace(/https?:\/\/\S+/g, '')
        .slice(0, 350); // Keep spoken response concise

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      utterance.pitch = 1.05;

      // Select female or Indian English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) =>
          (v.name.includes('Swara') || v.name.includes('India') || v.lang === 'en-IN' || v.name.includes('Zira') || v.name.includes('Google UK English Female'))
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
      setIsSpeaking(false);
    }
  }, [isAudioMuted]);

  // Send message to Swamini backend or fallback
  const handleSendMessage = async (customMessage?: string) => {
    const textToSend = customMessage || inputText.trim();
    if (!textToSend || isLoading) return;

    setInputText('');
    setLiveTranscription('');

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/swamini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content }))
        })
      });

      let replyContent = '';
      if (response.ok) {
        const data = await response.json();
        replyContent = data.reply || 'I am ready to assist you with train bookings, Tatkal procedures, complaints, and meals.';
      } else {
        replyContent = 'I can help with Tatkal booking rules (10 AM AC / 11 AM Non-AC), filing RailMadad complaints, food ordering, and glossary meanings.';
      }

      // Check for action token in reply
      const actionMatch = replyContent.match(/\[ACTION:([A-Z_]+)\]/);
      const actionToken = actionMatch ? actionMatch[1] : undefined;

      const assistantMsg: ChatMessage = {
        id: `msg-asst-${Date.now()}`,
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionToken
      };

      setMessages((prev) => [...prev, assistantMsg]);
      speakText(replyContent);
    } catch (err) {
      console.error('Swamini query error:', err);
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: `I am available to assist you! For Tatkal, AC opens at 10 AM and Non-AC at 11 AM. You can also file complaints or order pantry food directly from the Services tab.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Start real-time speech recognition
  const startVoiceRecording = () => {
    if (typeof window === 'undefined') return;

    // Check Web Speech API support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-IN'; // Indian English / Hindi mix

        recognition.onstart = () => {
          setIsRecording(true);
          setLiveTranscription('Listening... speak now');
        };

        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const transcript = event.results[current][0].transcript;
          setLiveTranscription(transcript);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsRecording(false);
          setLiveTranscription('');
        };

        recognition.onend = () => {
          setIsRecording(false);
          if (liveTranscription && liveTranscription !== 'Listening... speak now') {
            handleSendMessage(liveTranscription);
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
        return;
      } catch (e) {
        console.warn('Speech recognition failed to start:', e);
      }
    }

    // Fallback: MediaRecorder stream
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          audioChunksRef.current = [];

          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunksRef.current.push(event.data);
            }
          };

          mediaRecorder.onstop = async () => {
            setIsRecording(false);
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            stream.getTracks().forEach((track) => track.stop());

            // Convert to base64 and send to /api/swamini/transcribe
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
              const base64Audio = (reader.result as string)?.split(',')[1];
              if (base64Audio) {
                try {
                  const res = await fetch('/api/swamini/transcribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ audioBase64: base64Audio, mimeType: 'audio/webm' })
                  });
                  if (res.ok) {
                    const data = await res.json();
                    if (data.transcript) {
                      handleSendMessage(data.transcript);
                    }
                  }
                } catch (e) {
                  console.error('Transcription error:', e);
                }
              }
            };
          };

          mediaRecorder.start();
          setIsRecording(true);
          setLiveTranscription('Recording voice note...');
        })
        .catch((err) => {
          console.warn('Microphone permission denied:', err);
          alert('Microphone access is required for voice conversation.');
        });
    }
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  // Draggable Mouse & Touch handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    dragStartOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    hasMovedRef.current = true;
    const isMobile = window.innerWidth < 640;
    const trackWidth = isMobile ? 44 : 48;
    const trackClearance = 72; // requested clearance to the left of the scroll track
    const buttonWidth = isMobile ? 52 : 155;

    // Boundary constraints: strictly prevent entering the track clearance zone
    const minX = 16;
    const maxX = Math.max(minX, window.innerWidth - (trackWidth + trackClearance + buttonWidth));
    const minY = 72; // Below top navigation bar
    const maxY = Math.max(minY, window.innerHeight - (isMobile ? 128 : 76));

    const targetX = e.clientX - dragStartOffset.current.x;
    const targetY = e.clientY - dragStartOffset.current.y;

    const newX = Math.max(minX, Math.min(maxX, targetX));
    const newY = Math.max(minY, Math.min(maxY, targetY));
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleToggleOpen = () => {
    if (!hasMovedRef.current) {
      setIsOpen(!isOpen);
    }
  };

  // Render Action Button based on parsed token
  const renderActionButton = (actionToken?: string) => {
    if (!actionToken) return null;

    if (actionToken === 'OPEN_COMPLAINT_FORM') {
      return (
        <button
          type="button"
          onClick={() => {
            onNavigateTab('services', 'complaint');
            setIsOpen(false);
          }}
          className="mt-2.5 px-3 py-1.5 rounded-lg bg-[#EA580C] hover:bg-[#D94E06] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Lodge RailMadad Complaint Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      );
    }

    if (actionToken === 'OPEN_MEAL_BOOKING') {
      return (
        <button
          type="button"
          onClick={() => {
            onNavigateTab('services', 'food');
            setIsOpen(false);
          }}
          className="mt-2.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <UtensilsCrossed className="w-3.5 h-3.5" />
          <span>Order Meals to Seat Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      );
    }

    if (actionToken === 'OPEN_GLOSSARY') {
      return (
        <button
          type="button"
          onClick={() => {
            onNavigateTab('glossary');
            setIsOpen(false);
          }}
          className="mt-2.5 px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Explore 50+ Terms in Railway Glossary</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      );
    }

    if (actionToken === 'OPEN_QR_SCANNER') {
      return (
        <button
          type="button"
          onClick={() => {
            onOpenQRScanner();
            setIsOpen(false);
          }}
          className="mt-2.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors animate-pulse"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Scan Station QR to Clear Track Restriction</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      );
    }

    if (actionToken === 'OPEN_BOOKING') {
      return (
        <button
          type="button"
          onClick={() => {
            onNavigateTab('apply');
            setIsOpen(false);
          }}
          className="mt-2.5 px-3 py-1.5 rounded-lg bg-[#EA580C] hover:bg-[#D94E06] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <Train className="w-3.5 h-3.5" />
          <span>Start Train Ticket Reservation</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      );
    }

    return null;
  };

  return (
    <>
      {/* Floating Draggable Swamini Launcher Button */}
      <div
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 45,
          touchAction: 'none'
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="group select-none"
      >
        <button
          type="button"
          onClick={handleToggleOpen}
          aria-label="Open Swamini AI Travel Assistant"
          className="relative flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-[#0B2545] via-[#133E68] to-[#0B2545] border-2 border-[#EA580C] text-white shadow-2xl hover:scale-105 active:scale-95 transition-transform font-ticket cursor-grab active:cursor-grabbing"
        >
          {/* Avatar with sparkling aura */}
          <div className="relative w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm shrink-0 shadow-inner">
            <span>स्वा</span>
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0B2545] animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0B2545]" />
          </div>

          <div className="text-left hidden sm:block pr-1">
            <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-300" />
              <span>AI Assistant</span>
            </div>
            <div className="text-xs font-black tracking-wide text-white">Swamini</div>
          </div>

          {/* Track warning ping on Swamini button if user is restricted */}
          {currentZoneRestricted && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Station track safety gate active" />
          )}

          <GripVertical className="w-3 h-3 text-slate-400 opacity-60 group-hover:opacity-100" />
        </button>
      </div>

      {/* Expandable Chat Drawer Window */}
      {isOpen && (
        <div className="fixed inset-x-2 bottom-18 top-16 sm:top-auto sm:inset-auto sm:right-[120px] sm:bottom-6 sm:w-110 sm:max-w-[calc(100vw-140px)] sm:h-160 sm:max-h-[85vh] z-50 rounded-2xl bg-white dark:bg-[#0A192F] border-2 border-[#0B2545] dark:border-blue-800 shadow-2xl flex flex-col overflow-hidden font-ticket animate-in fade-in zoom-in-95 duration-200">
          {/* Chat Window Header */}
          <div className="p-3.5 bg-gradient-to-r from-[#0B2545] to-[#133E68] text-white flex items-center justify-between border-b border-blue-900 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm shrink-0">
                <span>स्वा</span>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0B2545]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black text-white">Swamini • स्वामिनी</h3>
                  <span className="px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-bold text-[9px]">
                    IRCTC AI
                  </span>
                </div>
                <p className="text-[10px] text-blue-200 font-sans">FAIRFLOW Travel & Rail Companion</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Voice Mode Toggle */}
              <button
                type="button"
                onClick={() => setIsVoiceMode(!isVoiceMode)}
                title={isVoiceMode ? 'Switch to Text Chat' : 'Switch to Real-Time Voice Mode'}
                className={`p-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                  isVoiceMode
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-blue-900/60 text-blue-200 hover:text-white'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[10px]">Voice</span>
              </button>

              {/* TTS Mute Toggle */}
              <button
                type="button"
                onClick={() => {
                  if (!isAudioMuted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                  }
                  setIsAudioMuted(!isAudioMuted);
                }}
                title={isAudioMuted ? 'Unmute Audio Voice' : 'Mute Audio Voice'}
                className="p-1.5 rounded-lg bg-blue-900/60 text-blue-200 hover:text-white transition-colors"
              >
                {isAudioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                  }
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-lg bg-blue-900/60 text-blue-200 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Station Safety Alert Notice inside Swamini if restricted */}
          {currentZoneRestricted && (
            <div className="px-3 py-2 bg-red-950 border-b border-red-800 text-red-200 text-xs flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span className="text-[11px] font-bold">Track safety lockdown active near platform</span>
              </div>
              <button
                type="button"
                onClick={onOpenQRScanner}
                className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-700 text-white font-bold text-[10px]"
              >
                Scan QR
              </button>
            </div>
          )}

          {/* Real-Time Voice Mode Overlay Panel */}
          {isVoiceMode && (
            <div className="p-4 bg-slate-900 text-white text-center space-y-3 border-b border-blue-900 shrink-0">
              <div className="text-xs text-amber-300 font-bold uppercase tracking-wider">
                Two-Way Voice Conversation
              </div>

              {/* Animated Waveform Visualizer */}
              <div className="flex items-center justify-center gap-1.5 h-12">
                {[40, 75, 95, 60, 85, 100, 70, 90, 50, 80, 45].map((height, idx) => (
                  <div
                    key={idx}
                    style={{
                      height: isRecording || isSpeaking ? `${height}%` : '20%',
                      animationDuration: `${0.4 + (idx % 4) * 0.2}s`
                    }}
                    className={`w-1 rounded-full transition-all ${
                      isRecording
                        ? 'bg-red-500 animate-pulse'
                        : isSpeaking
                        ? 'bg-amber-400 animate-pulse'
                        : 'bg-blue-700'
                    }`}
                  />
                ))}
              </div>

              <div className="text-xs text-slate-300 font-sans italic min-h-[1.5rem]">
                {liveTranscription || (isSpeaking ? 'Swamini is speaking...' : 'Tap the microphone to speak your question')}
              </div>

              <div className="flex items-center justify-center gap-3">
                {isRecording ? (
                  <button
                    type="button"
                    onClick={stopVoiceRecording}
                    className="px-4 py-2 rounded-full bg-red-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg animate-pulse"
                  >
                    <MicOff className="w-4 h-4" />
                    <span>Stop Recording</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startVoiceRecording}
                    className="px-4 py-2 rounded-full bg-[#EA580C] hover:bg-[#D94E06] text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-transform hover:scale-105"
                  >
                    <Mic className="w-4 h-4" />
                    <span>Speak to Swamini</span>
                  </button>
                )}

                {isSpeaking && (
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                        window.speechSynthesis.cancel();
                      }
                      setIsSpeaking(false);
                    }}
                    className="px-3 py-2 rounded-full bg-slate-800 text-slate-200 text-xs font-bold"
                  >
                    Stop Audio
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Quick Suggestion Pills */}
          <div className="p-2.5 bg-slate-100 dark:bg-[#001D3D] border-b border-slate-200 dark:border-blue-900/60 overflow-x-auto flex gap-1.5 no-scrollbar shrink-0">
            <button
              type="button"
              onClick={() => handleSendMessage('How to book Tatkal ticket step by step and what are the opening timings?')}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-blue-950 border border-slate-300 dark:border-blue-800 text-slate-700 dark:text-blue-100 hover:border-amber-400 text-[11px] font-bold shrink-0 transition-colors"
            >
              ⚡ Tatkal Booking Rules
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage('What is the difference between RAC and WL, and what does GNWL mean in glossary?')}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-blue-950 border border-slate-300 dark:border-blue-800 text-slate-700 dark:text-blue-100 hover:border-amber-400 text-[11px] font-bold shrink-0 transition-colors"
            >
              📖 RAC vs WL (Glossary)
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage('How do I lodge a RailMadad complaint for dirty coach or AC problem?')}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-blue-950 border border-slate-300 dark:border-blue-800 text-slate-700 dark:text-blue-100 hover:border-amber-400 text-[11px] font-bold shrink-0 transition-colors"
            >
              ⚠️ File Complaint
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage('How can I order hot meals or Jain thali to my seat using e-catering?')}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-blue-950 border border-slate-300 dark:border-blue-800 text-slate-700 dark:text-blue-100 hover:border-amber-400 text-[11px] font-bold shrink-0 transition-colors"
            >
              🍛 Book Food to Seat
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage('What is the station geofence track restriction and how to scan QR?')}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-blue-950 border border-slate-300 dark:border-blue-800 text-slate-700 dark:text-blue-100 hover:border-amber-400 text-[11px] font-bold shrink-0 transition-colors"
            >
              🛡️ Station QR Safety
            </button>
          </div>

          {/* Messages Thread */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((m) => {
              const isAsst = m.role === 'assistant';
              return (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${isAsst ? 'items-start' : 'items-end justify-end'}`}
                >
                  {isAsst && (
                    <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      स्वा
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3 space-y-1.5 shadow-xs ${
                      isAsst
                        ? 'bg-slate-100 dark:bg-[#002244] text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-blue-800'
                        : 'bg-[#EA580C] text-white'
                    }`}
                  >
                    <div className="whitespace-pre-wrap leading-relaxed font-sans text-xs">
                      {m.content.replace(/\[ACTION:[A-Z_]+\]/g, '')}
                    </div>

                    {/* Render deep-link Action Button */}
                    {isAsst && renderActionButton(m.actionToken)}

                    <div className="flex items-center justify-between text-[10px] opacity-60 font-mono pt-1">
                      <span>{m.timestamp}</span>
                      {isAsst && (
                        <button
                          type="button"
                          onClick={() => speakText(m.content)}
                          title="Listen to this message"
                          className="hover:opacity-100 ml-2"
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-slate-500 dark:text-blue-300 text-xs italic">
                <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs">
                  स्वा
                </div>
                <div className="flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#EA580C]" />
                  <span>Swamini is typing response...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-white dark:bg-[#0A192F] border-t border-slate-200 dark:border-blue-900 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask Swamini: Tatkal, complaints, meals, glossary..."
                className="flex-1 bg-slate-100 dark:bg-[#001D3D] border border-slate-300 dark:border-blue-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-amber-400 font-sans"
              />

              <button
                type="button"
                onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                title={isRecording ? 'Stop Recording' : 'Speak to Swamini'}
                className={`p-2 rounded-xl transition-colors shrink-0 ${
                  isRecording
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-slate-200 dark:bg-blue-900 text-slate-700 dark:text-blue-200 hover:text-white'
                }`}
              >
                <Mic className="w-4 h-4" />
              </button>

              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="p-2 rounded-xl bg-[#EA580C] hover:bg-[#D94E06] text-white disabled:opacity-40 transition-colors shrink-0 shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
