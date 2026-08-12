import { useCallback, useEffect, useRef, useState } from 'react';

interface UseTypewriterProps {
    text: string;
    speed?: number;
    enabled?: boolean;
}

export default function useTypewriter({ 
    text, 
    speed = 20,
    enabled = true 
}: UseTypewriterProps) {
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const indexRef = useRef(0);
    const timerRef = useRef<number | null>(null);

    // Cleanup du timer
    const clearTimer = useCallback(() => {
        if (timerRef.current !== null) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const skipAnimation = useCallback(() => {
        clearTimer();
        setDisplayedText(text);
        setIsTyping(false);
        indexRef.current = text.length;
    }, [text, clearTimer]);

    useEffect(() => {
        clearTimer();
        indexRef.current = 0;

        if (!enabled || !text) {
            setDisplayedText(text);
            setIsTyping(false);
            return;
        }

        setDisplayedText('');
        setIsTyping(true);

        const tick = () => {
            indexRef.current += 1;
            const newText = text.substring(0, indexRef.current);
            setDisplayedText(newText);

            if (indexRef.current >= text.length) {
                setIsTyping(false);
                timerRef.current = null;
            } else {
                timerRef.current = window.setTimeout(tick, speed);
            }
        };

        timerRef.current = window.setTimeout(tick, speed);

        return () => {
            clearTimer();
        };
    }, [text, speed, enabled, clearTimer]);

    return {
        displayedText,
        isTyping,
        skipAnimation,
    };
}