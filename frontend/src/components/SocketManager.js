class SocketManager {
    static #wsMap = new Map();

    static connect(url) {
        if (this.#wsMap.has(url)) {
            return this.#wsMap.get(url);
        }
        const ws = new WebSocket(url);
        this.#wsMap.set(url, ws);
        return ws;
    }

    static disconnect(url) {
        const ws = this.#wsMap.get(url);
        if (ws) {
            ws.close(1000, `Websocket connection to ${url} is closed.`);
            this.#wsMap.delete(url);
        }
    }

    static disconnectAll() {
        console.log('Disconnecting all WebSocket connections');
        for (const [url, ws] of this.#wsMap.entries()) {
            ws.close(1000, `Websocket connection to ${url} is closed.`);
            this.#wsMap.delete(url);
        }
    }
}

export default SocketManager;