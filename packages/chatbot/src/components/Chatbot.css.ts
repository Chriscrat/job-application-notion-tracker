import { style } from '@vanilla-extract/css';

export const avatarContainer = style({
    display: 'flex',
    flexDirection: 'row-reverse',
    alignItems: 'flex-end',
});

export const avatar = style({
    width: 100,
    height: 100,
    ':hover': {
        cursor: 'pointer',
    }
});

export const historyButton = style({
    position: 'relative',
    bottom: 40,
    padding: '10px 16px',
    backgroundColor: 'transparent',
    border: '1px solid rgba(109, 13, 211, 0.6)',
    borderRadius: 8,
    color: 'rgb(109 13 211)',
    fontFamily: 'monospace',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 0 10px rgba(109, 13, 211, 0.2)',

    ':hover': {
        backgroundColor: 'rgba(109, 13, 211, 0.15)',
        boxShadow: '0 0 20px rgba(109, 13, 211, 0.5)',
    },
});
