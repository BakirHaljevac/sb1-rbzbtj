import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Loader2, Bot, Volume2, RefreshCw, Settings } from 'lucide-react';
import { useAIStore } from '../store/aiStore';

export default function VoiceAssistant() {
  const { processUserInput } = useAIStore();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [browserSupported, setBrowserSupported] = useState(true);

  useEffect(() => {
    checkBrowserSupport();
  }, []);

  const checkBrowserSupport = () => {
    const isSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    setBrowserSupported(isSupported);
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return false;
    }
    return true;
  };

  const initializeSpeechRecognition = () => {
    if (!checkBrowserSupport()) return;

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      // Configure recognition
      recognitionRef.current.continuous = false; // Changed to false to handle one utterance at a time
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setTranscript(transcript);
        setError(null);
      };

      recognitionRef.current.onerror = (event) => {
        let errorMessage = '';
        
        switch (event.error) {
          case 'network':
            errorMessage = 'Please check your microphone settings in your browser:\n1. Click the lock/site settings icon in your address bar\n2. Ensure microphone access is allowed\n3. Try refreshing the page';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone access in your browser settings.';
            break;
          case 'no-speech':
            errorMessage = 'No speech detected. Please try speaking again.';
            break;
          case 'aborted':
            errorMessage = 'Speech recognition was aborted. Please try again.';
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }
        
        setError(errorMessage);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (transcript) {
          handleProcess();
        }
      };

    } catch (err) {
      console.error('Error initializing speech recognition:', err);
      setError('Failed to initialize speech recognition. Please refresh the page and try again.');
    }
  };

  useEffect(() => {
    initializeSpeechRecognition();
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [retryCount]);

  const retryRecognition = () => {
    setError(null);
    setIsListening(false);
    setTranscript('');
    setRetryCount(count => count + 1);
  };

  const toggleListening = () => {
    if (!browserSupported) {
      setError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (error) {
      setError(null);
    }

    if (!isListening) {
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.error('Error starting speech recognition:', err);
        setError('Failed to start speech recognition. Please try again.');
      }
    } else {
      recognitionRef.current?.stop();
    }
  };

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    } else {
      console.error('Speech synthesis not supported');
    }
  };

  const handleProcess = async () => {
    if (!transcript.trim() || isProcessing) return;

    setIsProcessing(true);
    try {
      const response = await processUserInput(transcript);
      if (response) {
        speakResponse(response);
      }
    } catch (err) {
      console.error('Error processing voice input:', err);
      setError('Failed to process voice input. Please try again.');
    } finally {
      setIsProcessing(false);
      setTranscript('');
    }
  };

  const openBrowserSettings = () => {
    if (error?.includes('microphone settings')) {
      window.open('chrome://settings/content/microphone', '_blank');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
            <Bot className="w-6 h-6 text-purple-600" />
            Voice Assistant
          </h1>
          <p className="text-gray-600">
            {browserSupported 
              ? 'Click the microphone and start speaking'
              : 'Please use Chrome, Edge, or Safari for voice support'}
          </p>
        </div>

        <div className="flex flex-col items-center gap-8">
          <motion.div
            animate={{
              scale: isListening ? [1, 1.2, 1] : 1,
              transition: {
                repeat: isListening ? Infinity : 0,
                duration: 2,
              },
            }}
            className="relative"
          >
            <button
              onClick={toggleListening}
              disabled={isProcessing || !browserSupported}
              className={`w-32 h-32 rounded-full flex items-center justify-center cursor-pointer transition-colors
                ${isListening ? 'bg-red-100' : 'bg-purple-100'}
                ${(isProcessing || !browserSupported) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isListening ? (
                <MicOff className="w-12 h-12 text-red-600" />
              ) : (
                <Mic className="w-12 h-12 text-purple-600" />
              )}
            </button>
            <AnimatePresence>
              {isListening && (
                <motion.div
                  initial={{ scale: 1, opacity: 0.3 }}
                  animate={{ scale: 2, opacity: 0 }}
                  exit={{ scale: 1, opacity: 0 }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute inset-0 bg-purple-100 rounded-full"
                />
              )}
            </AnimatePresence>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-50 text-red-600 p-4 rounded-lg max-w-md"
            >
              <div className="flex items-start gap-2 mb-2">
                <span className="font-medium">Error:</span>
                <div className="flex-1">
                  {error.split('\n').map((line, i) => (
                    <p key={i} className="mb-1">{line}</p>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center mt-3">
                <button
                  onClick={retryRecognition}
                  className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
                {error.includes('microphone settings') && (
                  <button
                    onClick={openBrowserSettings}
                    className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
                  >
                    <Settings className="w-4 h-4" />
                    Open Settings
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {transcript && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-lg bg-gray-50 rounded-lg p-4"
            >
              <p className="text-gray-700">{transcript}</p>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleProcess}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4" />
                      Process
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}