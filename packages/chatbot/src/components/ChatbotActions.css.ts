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

const fadeUp = keyframes({
    'from': {
        opacity: 0,
        transform: 'translateY(12px)'
    },
    'to': {
        opacity: 1,
        transform: 'translateY(0)'
    }
});

export const actionsContainer = style({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 12,
    width: '100%',
    marginTop: 16,
    animation: `${fadeUp} 0.3s ease-out`,
});

export const actionButton = style({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 2,
    padding: 12,
    backgroundColor: getClassColor('command', 0.1),
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.3s ease',

    ':hover': {
        boxShadow: `0 0 20px ${getClassColor('command', 0.6)}}`,
        transform: 'translateY(-1px)',
    },

    ':active': {
        transform: 'translateY(0)',
    },

    ':disabled': {
        opacity: 0.5,
        cursor: 'not-allowed',
    },
});

export const actionLabel = style({
    fontSize: vars.font.defaultSize,
    color: 'rgb(0, 255, 245)',
    textShadow: `0 0 10px ${getClassColor('accent', 0.5)}`,
});
