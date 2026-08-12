import { createTheme, createThemeContract } from '@vanilla-extract/css';

export const vars = createThemeContract({
    color: {
        primary: null,
        secondary: null,
        accent: null,
        command: null,
    },
    font: {
        defaultSize: null,
        defaultFamily: null,
        stateMessage: {
            fontFamily: null,
            fontSize: null,
        },
        responseMessage: {
            fontFamily: null,
            fontSize: null,
        }
    }
});

export const darkTheme = createTheme(vars, {
    color: {
        primary: '109, 13, 211',
        secondary: '185, 137, 235',
        accent: '153, 75, 236',
        command: '0, 255, 245',
    },
    font: {
        defaultSize: '12px',
        defaultFamily: 'sans-serif',
        stateMessage: {
            fontFamily: 'sans-serif',
            fontSize: '20px',
        },
        responseMessage: {
            fontFamily: 'monospace',
            fontSize: '12px',
        }
    }
});

export const lightTheme = createTheme(vars, {
    color: {
        primary: '220, 38, 127',
        secondary: '248, 113, 113',
        accent: '251, 146, 60',
        command: '0, 255, 245',
    },
    font: {
        defaultSize: '12px',
        defaultFamily: 'sans-serif',
        stateMessage: {
            fontFamily: 'sans-serif',
            fontSize: '20px',
        },
        responseMessage: {
            fontFamily: 'monospace',
            fontSize: '12px',
        }
    }
});

export const themeClass = darkTheme;
