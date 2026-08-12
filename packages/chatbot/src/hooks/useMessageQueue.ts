import { useState, useEffect, useCallback, useRef } from 'react';
import type { ChatbotMessage, StateMachineAnimations } from '../types';

interface UseMessageQueueOptions {
    fadeOutDuration?: number;
    delayBetweenMessages?: number;
    onAnimationTrigger?: (animation: StateMachineAnimations) => void;
}

interface UseMessageQueueReturn {
    currentMessage: ChatbotMessage | null;
    isExiting: boolean;
    queueLength: number;
    showMessage: (message: ChatbotMessage) => void;
    showMessages: (messages: ChatbotMessage[]) => void;
    clearQueue: () => void;
    skipCurrent: () => void;
}

const DEFAULT_FADE_OUT_DURATION = 300; // ms
const DEFAULT_DELAY_BETWEEN_MESSAGES = 0; // ms

export function useMessageQueue(options?: UseMessageQueueOptions): UseMessageQueueReturn {
    const fadeOutDuration = options?.fadeOutDuration ?? DEFAULT_FADE_OUT_DURATION;
    const delayBetweenMessages = options?.delayBetweenMessages ?? DEFAULT_DELAY_BETWEEN_MESSAGES;

    const [queue, setQueue] = useState<ChatbotMessage[]>([]);
    const [currentMessage, setCurrentMessage] = useState<ChatbotMessage | null>(null);
    const [isExiting, setIsExiting] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const durationTimerRef = useRef<number | null>(null);
    const fadeOutTimerRef = useRef<number | null>(null);
    const delayTimerRef = useRef<number | null>(null);

    // Cleanup des timers
    const clearTimers = useCallback(() => {
        if (durationTimerRef.current !== null) {
            clearTimeout(durationTimerRef.current);
            durationTimerRef.current = null;
        }
        if (fadeOutTimerRef.current !== null) {
            clearTimeout(fadeOutTimerRef.current);
            fadeOutTimerRef.current = null;
        }
        if (delayTimerRef.current !== null) {
            clearTimeout(delayTimerRef.current);
            delayTimerRef.current = null;
        }
    }, []);

    // Fonction pour terminer le message actuel et préparer le suivant
    const finishCurrentMessage = useCallback(() => {
        setIsExiting(true);
        
        fadeOutTimerRef.current = window.setTimeout(() => {
            setCurrentMessage(null);
            setIsExiting(false);
            
            if (delayBetweenMessages > 0) {
                delayTimerRef.current = window.setTimeout(() => {
                    setIsProcessing(false);
                }, delayBetweenMessages);
            } else {
                setIsProcessing(false);
            }
        }, fadeOutDuration);
    }, [fadeOutDuration, delayBetweenMessages]);

    // Fonction pour traiter le message suivant de la queue
    const processNextMessage = useCallback(() => {
        setIsProcessing(true);
        
        setQueue(prev => {
            if (prev.length === 0) {
                setIsProcessing(false);
                return prev;
            }
            
            const [nextMessage, ...rest] = prev;
            setCurrentMessage(nextMessage);

            if (nextMessage.animation && options?.onAnimationTrigger) {
                options.onAnimationTrigger(nextMessage.animation);
            }
            
            // Si le message a une durée, programmer la suppression
            if (nextMessage.duration) {
                durationTimerRef.current = window.setTimeout(() => {
                    finishCurrentMessage();
                }, nextMessage.duration);
            } else {
                // Pas de duration → reste affiché indéfiniment
                setIsProcessing(false);
            }
            
            return rest;
        });
    }, [finishCurrentMessage]);

    // Ajouter un message à la queue
    const showMessage = useCallback((message: ChatbotMessage) => {
        setQueue(prev => [...prev, message]);
    }, []);

    // Ajouter plusieurs messages à la queue
    const showMessages = useCallback((messages: ChatbotMessage[]) => {
        setQueue(prev => [...prev, ...messages]);
    }, []);

    // Vider la queue et masquer le message actuel
    const clearQueue = useCallback(() => {
        clearTimers();
        setQueue([]);
        
        if (currentMessage) {
            finishCurrentMessage();
        } else {
            setIsProcessing(false);
        }
    }, [clearTimers, currentMessage, finishCurrentMessage]);

    // Passer immédiatement au message suivant
    const skipCurrent = useCallback(() => {
        if (!currentMessage) return;
        
        clearTimers();
        finishCurrentMessage();
    }, [currentMessage, clearTimers, finishCurrentMessage]);

    // Effect pour traiter la queue
    useEffect(() => {
        // Si pas de message actuel et pas en train de traiter et queue non vide
        if (!currentMessage && !isProcessing && queue.length > 0) {
            processNextMessage();
        }
    }, [currentMessage, isProcessing, queue.length, processNextMessage]);

    // Cleanup au démontage
    useEffect(() => {
        return () => {
            clearTimers();
        };
    }, [clearTimers]);

    return {
        currentMessage,
        isExiting,
        queueLength: queue.length,
        showMessage,
        showMessages,
        clearQueue,
        skipCurrent,
    };
}
