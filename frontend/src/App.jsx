import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TodoList from './components/TodoList';
import HomePage from './components/HomePage';

const App = () => {
    return (
        <BrowserRouter>
            <div className="card">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/todo-list" element={<TodoList />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
};

export default App;
