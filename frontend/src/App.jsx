import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TodoList from './components/TodoList';
import HomePage from './components/HomePage';
import WebSocketProvider from './providers/WebSocketProvider';

const App = () => {
    return (
        <WebSocketProvider>
            <BrowserRouter>
                <div className="card">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/todo-list" element={<TodoList />} />
                    </Routes>
                </div>
            </BrowserRouter>
        </WebSocketProvider>
    );
};

export default App;
