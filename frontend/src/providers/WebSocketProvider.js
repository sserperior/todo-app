import React, { useEffect, useState, createContext } from 'react';
import SocketManager from '../components/SocketManager';

export const WebSocketContext = createContext(null);

const WebSocketProvider = ({ children }) => {
    const [ws, setWs] = useState(null);
    useEffect(() => {
        const WS_URL = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;
        const ws = SocketManager.connect(WS_URL);
        setWs(ws);
    }, []);
    return (
        <WebSocketContext.Provider value={ws}>
            {children}
        </WebSocketContext.Provider>
    );
};

export default WebSocketProvider;