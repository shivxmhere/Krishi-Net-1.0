import React, { createContext, useContext, useState, ReactNode } from 'react';

interface VoiceContextType {
    isListening: boolean;
    transcript: string;
    lastCommand: string;
    startListening: () => void;
    stopListening: () => void;
    resetTranscript: () => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const VoiceProvider = ({ children }: { children: ReactNode }) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [lastCommand, setLastCommand] = useState('');

    const startListening = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert("Voice commands not supported in this browser. Try Chrome.");
            return;
        }

        const SpeechRecognition = (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US'; // Default, could be dynamic
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        setIsListening(true);
        setTranscript('');

        recognition.onresult = (event: any) => {
            const command = event.results[0][0].transcript;
            console.log("Voice Result:", command);
            setTranscript(command);
            setLastCommand(command.toLowerCase());
            setIsListening(false);
        };

        recognition.onerror = (event: any) => {
            console.error("Voice Error:", event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        if (navigator.vibrate) navigator.vibrate(10);
        recognition.start();
    };

    const stopListening = () => {
        setIsListening(false);
    };

    const resetTranscript = () => {
        setTranscript('');
        setLastCommand('');
    };

    return (
        <VoiceContext.Provider value={{ isListening, transcript, lastCommand, startListening, stopListening, resetTranscript }}>
            {children}
        </VoiceContext.Provider>
    );
};

export const useVoice = () => {
    const context = useContext(VoiceContext);
    if (context === undefined) {
        throw new Error('useVoice must be used within a VoiceProvider');
    }
    return context;
};
