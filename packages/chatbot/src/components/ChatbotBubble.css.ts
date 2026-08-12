import { style, keyframes } from '@vanilla-extract/css';
import { vars } from './Theme.css';
import { spin } from './RainbowBorder.css';

type Theme = keyof typeof vars.color;
function getClassColor(theme: Theme, opacity?: number) {
    const colorValue = vars.color[theme];

    if (opacity) {
        return `rgba(${colorValue}, ${opacity})`;
    } else {
        return `rgb(${colorValue})`;
    }
}

const primaryColor = getClassColor('primary');
const accentColor = getClassColor('accent');

const fadeIn = keyframes({
    from: {
        opacity: 0,
        transform: 'translateY(10px)',
    },
    to: {
        opacity: 1,
        transform: 'translateY(0)',
    },
});


export const fadeInAnimation = style({
    animation: `${fadeIn} 0.3s ease-out`,
})

export const chatBubbleContainer = style({
    minWidth: 100,
    maxWidth: 800,
    position: 'relative',
    bottom: 40,
    backgroundColor: 'black',
    borderRadius: '30% 10% / 10% 30%',
    boxShadow: `0 0 20px ${getClassColor('primary', 0.3)}`,
    overflow: 'visible',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: 48,
    animation: `${spin} 3s linear infinite, ${fadeIn} 0.3s ease-out`,
});

const glytchAnimation = keyframes({
    '0%, 100%': {
        clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)',
        transform: 'translate(0)',
    },
    '33%': {
        clipPath: 'polygon(0 0, 100% 0, 100% 15%, 0 15%)',
        transform: 'translate(-5px, -5px)',
    },
    '66%': {
        clipPath: 'polygon(0 85%, 100% 85%, 100% 100%, 0 100%)',
        transform: 'translate(5px, 5px)',
    },
});

// Cursor animation
const blinkCursor = keyframes({
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0 },
});

export const chatBubbleTextContainer = style({
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'flex-start',
    maxHeight: 600,
    overflowX: 'auto',
});

// Cursor
export const chatBubbleCursor = style({
    display: 'inline-block',
    width: '2px',
    height: '1em',
    backgroundColor: primaryColor,
    marginLeft: '4px',
    animation: `${blinkCursor} 0.8s step-end infinite`,
    boxShadow: `0 0 5px ${primaryColor}`,
});

// State message
export const chatBubbleTextState = style({
    color: primaryColor,
    fontSize: vars.font.stateMessage.fontSize,
    fontFamily: vars.font.stateMessage.fontFamily,
    position: 'relative',
    textShadow: `0 0 10px ${primaryColor}, 0 0 20px ${primaryColor}`,
    zIndex: 2,
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    pointerEvents: 'none',
    '::before': {
        content: 'attr(data-text)',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        animation: `${glytchAnimation} 2s infinite`,
        clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)',
        transform: 'translate(-2px, -2px)',
        color: primaryColor,
        textShadow: `0 0 5px ${accentColor}, 0 0 15px ${accentColor}`,
    },
});

// Response message
export const chatBubbleTextResponse = style({
    color: primaryColor,
    fontSize: vars.font.responseMessage.fontSize,
    fontFamily: vars.font.responseMessage.fontFamily,
    position: 'relative',
    zIndex: 2,
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
});

const fadeOut = keyframes({
    to: {
        opacity: 0,
        transform: 'translateY(-10px)',
    },
});

export const fadeOutAnimation = style({
    animation: `${fadeOut} 0.3s ease-out forwards`,
});
