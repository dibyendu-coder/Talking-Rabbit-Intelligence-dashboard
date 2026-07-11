import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, VolumeX, Settings, Play, Square } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface VoiceControllerProps {
  onSpeechToText: (text: string) => void;
  isProcessing: boolean;
  lastAssistantSpeech: string;
}

export default function VoiceController({
  onSpeechToText,
  isProcessing,
  lastAssistantSpeech,
}: VoiceControllerProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [showSettings, setShowSettings] = useState(false);

  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load available voices for text-to-speech
  useEffect(() => {
    const loadVoices = () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
        // Default to a premium-sounding English voice if available
        const defaultVoice =
          availableVoices.find((v) => v.name.includes("Google") && v.lang.startsWith("en")) ||
          availableVoices.find((v) => v.lang.startsWith("en")) ||
          availableVoices[0];
        if (defaultVoice) {
          setSelectedVoice(defaultVoice.name);
        }
      }
    };

    loadVoices();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        // Pause any active text speech if listening starts
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
          setIsSpeaking(false);
        }
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onSpeechToText(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [onSpeechToText]);

  // Read text aloud
  const speakText = (text: string) => {
    if (!speechEnabled || !window.speechSynthesis) return;

    // Clean text of unpronounceable characters
    const cleanText = text
      .replace(/[\*\#\`\-\[\]]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // Cancel current synthesis
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const chosenVoice = voices.find((v) => v.name === selectedVoice);
    if (chosenVoice) {
      utterance.voice = chosenVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Trigger speak automatically on new assistant output if enabled
  useEffect(() => {
    if (lastAssistantSpeech && speechEnabled) {
      speakText(lastAssistantSpeech);
    }
  }, [lastAssistantSpeech, speechEnabled]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.error("Could not start recognition:", e);
      }
    }
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div id="voice-controller" className="flex items-center gap-2.5 p-2.5 bg-surface border border-white/5 rounded-2xl shadow-sm">
      {/* Listening Toggle */}
      <button
        id="btn-voice-mic"
        onClick={toggleListening}
        disabled={isProcessing}
        className={`relative flex items-center justify-center p-3 rounded-full transition-all duration-300 cursor-pointer ${
          isListening
            ? "bg-bitcoin-burnt hover:bg-bitcoin text-white shadow-bitcoin-glow animate-pulse"
            : "bg-[#030304] hover:bg-[#030304]/80 border border-white/5 text-muted hover:text-white"
        } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
        title={isListening ? "Stop listening" : "Speak node command"}
      >
        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        {isListening && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bitcoin opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-bitcoin"></span>
          </span>
        )}
      </button>

      {/* Voice Output Toggle */}
      <button
        id="btn-voice-mute"
        onClick={() => {
          const next = !speechEnabled;
          setSpeechEnabled(next);
          if (!next && isSpeaking) stopSpeaking();
        }}
        className={`flex items-center justify-center p-3 rounded-full transition-all duration-300 cursor-pointer ${
          speechEnabled 
            ? "bg-gradient-to-r from-bitcoin-burnt to-bitcoin text-white shadow-bitcoin-glow" 
            : "bg-[#030304] border border-white/5 text-muted"
        }`}
        title={speechEnabled ? "Mute synthesized speech" : "Activate synthesized speech"}
      >
        {speechEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
      </button>

      {/* Speak controls */}
      {isSpeaking ? (
        <button
          id="btn-voice-stop"
          onClick={stopSpeaking}
          className="flex items-center justify-center p-3 rounded-full bg-[#030304] hover:bg-white/5 border border-white/5 text-bitcoin transition-all duration-300 cursor-pointer"
          title="Stop reading aloud"
        >
          <Square className="w-5 h-5" />
        </button>
      ) : (
        lastAssistantSpeech && speechEnabled && (
          <button
            id="btn-voice-replay"
            onClick={() => speakText(lastAssistantSpeech)}
            className="flex items-center justify-center p-3 rounded-full bg-[#030304] hover:bg-white/5 border border-white/5 text-bitcoin-gold transition-all duration-300 cursor-pointer"
            title="Repeat aloud"
          >
            <Play className="w-5 h-5" />
          </button>
        )
      )}

      {/* Waveform Visualization */}
      <div className="flex-1 flex items-center justify-center px-3 gap-0.5 h-6">
        {isListening ? (
          <div className="flex items-end gap-1 h-full">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-bitcoin rounded-full"
                animate={{ height: [4, 20, 4] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
            <span className="text-[10px] text-bitcoin font-mono font-bold ml-2 uppercase tracking-wider">Listening...</span>
          </div>
        ) : isSpeaking ? (
          <div className="flex items-end gap-1 h-full">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-bitcoin-gold rounded-full"
                animate={{ height: [4, 16, 4] }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
              />
            ))}
            <span className="text-[10px] text-bitcoin-gold font-mono font-bold ml-2 uppercase tracking-wider">Speaking...</span>
          </div>
        ) : (
          <span className="text-[11px] text-muted font-mono tracking-wide font-medium">
            {isProcessing ? "Analyzing Node Ledger..." : "Secured Voice Feed Ready"}
          </span>
        )}
      </div>

      {/* Voice Settings Trigger */}
      <div className="relative">
        <button
          id="btn-voice-settings"
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 rounded-lg transition-all duration-200 cursor-pointer ${
            showSettings ? "bg-white/10 text-white" : "text-muted hover:text-white"
          }`}
          title="Voice Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 bottom-12 w-64 p-3 bg-surface border border-white/10 rounded-xl shadow-bitcoin-glow-intense z-50 text-white"
            >
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-bitcoin font-mono mb-2">Speech Synthesizer Configuration</h4>
              <div className="space-y-2">
                <div>
                  <label className="text-[9px] font-mono font-bold text-muted block mb-1">Select Synthesis Core</label>
                  <select
                    id="select-voice-option"
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="w-full text-xs bg-[#030304] border border-white/5 rounded p-1.5 focus:outline-none focus:border-bitcoin text-white font-mono"
                  >
                    {voices.map((voice) => (
                      <option key={voice.name} value={voice.name}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))}
                    {voices.length === 0 && <option value="">No system voice channels found</option>}
                  </select>
                </div>
                <div className="text-[9px] text-muted font-mono leading-relaxed mt-1">
                  Synthesized speech reads node outputs automatically. Ensure microphone permissions are active.
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
