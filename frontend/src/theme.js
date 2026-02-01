import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    typography: {
        fontFamily: 'Roboto, sans-serif',
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    fontFamily: 'Roboto, sans-serif',
                    marginLeft: '2rem',
                    marginRight: '2rem',
                    marginTop: '2rem',
                    marginBottom: 'calc(2rem + 80px)', // Space for fixed buttons
                },
                h1: {
                    fontFamily: 'Roboto, sans-serif',
                    marginBottom: '0.5rem',
                },
                h2: {
                    fontFamily: 'Roboto, sans-serif',
                },
                h3: {
                    fontFamily: 'Roboto, sans-serif',
                },
                h4: {
                    fontFamily: 'Roboto, sans-serif',
                },
                h5: {
                    fontFamily: 'Roboto, sans-serif',
                },
                h6: {
                    fontFamily: 'Roboto, sans-serif',
                },
                '.todo-container': {
                    width: '100%',
                    maxWidth: '500px',
                    margin: '0 auto',
                    padding: '1rem',
                },
                '.todo-input-container': {
                    display: 'flex',
                    gap: '0.75rem',
                    marginBottom: '0.75rem',
                },
                '.todo-buttons-container': {
                    display: 'flex',
                    gap: '0.75rem',
                    justifyContent: 'center',
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '1rem',
                    backgroundColor: 'white',
                    boxShadow: '0 -4px 6px -1px rgb(0 0 0 / 0.1)',
                    zIndex: 1000,
                },
                '.mark-done-button': {
                    marginTop: '0.75rem',
                    height: '2.5rem'
                },
                '.delete-button': {
                    marginTop: '0.75rem',
                    height: '2.5rem'
                },
                '.todo-done': {
                    opacity: 0.5,
                    /*
                    '& .MuiListItemText-root': {
                        textDecoration: 'line-through',
                    },*/
                },
            },
        },
        MuiList: {
            styleOverrides: {
                root: {
                    padding: 0,
                },
            },
        },
        MuiListItem: {
            styleOverrides: {
                root: {
                    paddingTop: '0.5rem',
                    paddingBottom: '0.5rem',
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    paddingTop: '0.5rem',
                    paddingBottom: '0.5rem',
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                size: 'small',
            },
        },
        MuiButton: {
            defaultProps: {
                size: 'small',
            },
        },
        MuiListItemText: {
            styleOverrides: {
                primary: {
                    fontSize: '1.25rem',
                },
            },
        },
        MuiListItemIcon: {
            styleOverrides: {
                root: {
                    minWidth: '2rem',
                },
            },
        },
        MuiCheckbox: {
            styleOverrides: {
                root: {
                    '& .MuiSvgIcon-root': {
                        fontSize: '2rem',
                    },
                },
            },
        },
    },
});

export default theme;
