import { style, keyframes } from '@vanilla-extract/css';
import { vars } from './Theme.css';

type Theme = keyof typeof vars.color;

function getClassColor(theme: Theme, opacity?: number) {
    const colorValue = vars.color[theme];

    if (opacity) {
        return `rgba(${colorValue}, ${opacity})`
    } else {
        return `rgb(${colorValue})`
    }
}

const primaryColor = getClassColor('primary');

const fadeIn = keyframes({
    'from': {
        opacity: 0,
        transform: 'translateY(10px)'
    },
    'to': {
        opacity: 1,
        transform: 'translateY(0)'
    }
});

const fadeOut = keyframes({
    'to': {
        opacity: 0,
        transform: 'translateY(-10px)'
    }
});

export const fadeOutAnimation = style({
    animation: `${fadeOut} 0.3s ease-out forwards`,
});

export const formContainer = style({
    position: 'relative',
    bottom: 40,
    minWidth: 320,
    maxWidth: 600,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    padding: 48,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: '30% 10% / 10% 30%',
    boxShadow: `0 0 20px ${getClassColor('primary', 0.3)}`,
    backdropFilter: 'blur(10px)',
    animation: `${fadeIn} 0.3s ease-out`,
});

export const formTitle = style({
    margin: 0,
    color: getClassColor('command'),
    fontSize: vars.font.defaultSize,
    fontFamily: vars.font.defaultFamily,
    textShadow: `0 0 10px ${getClassColor('accent', 0.5)}`,
    textDecoration: 'underline',
});

export const formFields = style({
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
});

export const formField = style({
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
});

export const formLabel = style({
    color: getClassColor('primary', 0.8),
    fontSize: '12px',
    fontFamily: vars.font.defaultFamily,
});

export const input = style({
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: `1px solid ${getClassColor('primary', 0.4)}`,
    borderRadius: 6,
    padding: '10px 12px',
    color: primaryColor,
    fontFamily: vars.font.defaultFamily,
    fontSize: vars.font.defaultSize,
    outline: 'none',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',

    ':focus': {
        borderColor: primaryColor,
        boxShadow: `0 0 12px ${getClassColor('primary', 0.4)}`,
    },

    '::placeholder': {
        color: getClassColor('secondary', 0.4),
    },
});

export const inputError = style({
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgb(220 38 38)',
    borderRadius: 6,
    padding: '10px 12px',
    color: primaryColor,
    fontFamily: vars.font.defaultFamily,
    fontSize: vars.font.defaultSize,
    outline: 'none',

    ':focus': {
        borderColor: 'rgb(220 38 38)',
        boxShadow: '0 0 12px rgba(220, 38, 38, 0.4)',
    },

    '::placeholder': {
        color: 'rgba(220, 38, 38, 0.4)',
    },
});

export const errorMessage = style({
    color: 'rgb(220 38 38)',
    fontSize: '12px',
    fontFamily: vars.font.defaultFamily,
});

export const formActions = style({
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 12,
});

export const cancelButton = style({
    padding: '10px 16px',
    backgroundColor: 'transparent',
    border: `1px solid ${getClassColor('command', 0.5)}`,
    borderRadius: 6,
    color: getClassColor('command', 0.8),
    fontFamily: vars.font.defaultFamily,
    fontSize: vars.font.defaultSize,
    cursor: 'pointer',
    transition: 'all 0.3s ease',

    ':hover': {
        backgroundColor: getClassColor('command', 0.1),
    },
});

export const submitButton = style({
    padding: '10px 16px',
    backgroundColor: getClassColor('command', 0.2),
    border: `1px solid ${getClassColor('command')}`,
    borderRadius: 6,
    color: getClassColor('command'),
    fontFamily: vars.font.defaultFamily,
    fontSize: vars.font.defaultSize,
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: `0 0 10px ${getClassColor('command', 0.3)}`,

    ':hover': {
        backgroundColor: getClassColor('command', 0.35),
        boxShadow: `0 0 20px ${getClassColor('command', 0.6)}`,
    },
});
