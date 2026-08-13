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

const spin = keyframes({
    'to': { transform: 'rotate(360deg)' }
});

export const fadeOutAnimation = style({
    animation: `${fadeOut} 0.3s ease-out forwards`,
});

export const loaderContainer = style({
    position: 'relative',
    bottom: 50,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    padding: '16px 20px',
    backgroundColor: 'black',
    borderRadius: '50% 20% / 10% 40%',
    border: `1px solid ${primaryColor}`,
    boxShadow: `0 0 15px rgba(${primaryColor}, 0.3)`,
    animation: `${fadeIn} 0.3s ease-out`,
});

export const spinner = style({
    width: 24,
    height: 24,
    border: `2px solid rgba(${primaryColor}, 0.2)`,
    borderTopColor: primaryColor,
    borderRadius: '50%',
    animation: `${spin} 0.8s linear infinite`,
});

export const loaderMessage = style({
    margin: 0,
    color: primaryColor,
    fontSize: vars.font.size,
    fontFamily: vars.font.body,
    zIndex: 2,
});