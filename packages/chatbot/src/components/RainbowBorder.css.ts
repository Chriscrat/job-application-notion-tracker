import { style, keyframes } from '@vanilla-extract/css';

export const rainbow = style({
    vars: { '--angle': '0turn' },
    borderRadius: 10,
    border: '6px solid transparent',
    background:
        'linear-gradient(hsl(0, 0%, 0%), hsl(0, 0%, 0%)) padding-box, conic-gradient(from var(--angle), #3363ff, #b102b7, #2170cf) border-box',
    color: 'white',
    fontSize: '1.1rem',
});

export const spin = keyframes({
    to: {
        vars: { '--angle': '1turn' },
    },
});

