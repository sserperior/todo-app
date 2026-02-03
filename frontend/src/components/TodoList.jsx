import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

import { WebSocketContext } from '../providers/WebSocketProvider';

const TodoList = () => {
    const ws = useContext(WebSocketContext);
    const location = useLocation();
    const navigate = useNavigate();
    const listId = location.state?._id;
    const listName = location.state?.name || 'Todo List';

    const [inputValue, setInputValue] = useState('');
    const [todos, setTodos] = useState([]);

    const refreshTodos = () => {
        const message = {
            api: 'list',
            id: listId,
        };
        ws.send(JSON.stringify(message));
    };

    useEffect(() => {
        if (!ws || listId == null) {
            return;
        }

        const messageHandler = event => {
            const message = JSON.parse(event.data);
            if (message?.api === 'list' && message?.result?._id === listId) {
                setTodos(message.result.items);
            } else if (message?.api === 'addTodoItem') {
                setTodos(message.result.todos);
                setInputValue('');
            } else if (message?.api === 'toggleTodoItemChecked' || message?.api === 'markTodoItemsDone' || message?.api === 'deleteTodoItems') {
                setTodos(message.result.todos);
            }
        };

        ws.addEventListener('message', messageHandler);

        if (ws.readyState === WebSocket.OPEN) {
            // Socket might already be open - for example if navigate back from /todo-list
            refreshTodos();
        } else {
            ws.addEventListener(
                'open',
                refreshTodos,
                { once: true }
            );
        }

        return () => {
            console.log('Removing event listener for list[:id].');
            ws.removeEventListener('message', messageHandler);
        };

    }, [ws]);

    const handleAddTodo = () => {
        if (inputValue.trim() !== '') {
            const message = {
                api: 'addTodoItem',
                text: inputValue,
                todoListId: listId,
            };
            ws.send(JSON.stringify(message));
        }
    };

    const handleKeyUp = e => {
        if (e.key === 'Enter') {
            handleAddTodo();
        }
    };

    const handleToggle = todo => {
        const { id, text, checked, done } = todo;
        const message = {
            api: 'toggleTodoItemChecked',
            todoListId: listId,
            id,
            checked: !checked,
        };
        ws.send(JSON.stringify(message));
    };

    const handleMarkDone = () => {
        const checkedTodoIds = todos.filter(todo => todo.checked).map(todo => todo.id);
        const message = {
            api: 'markTodoItemsDone',
            todoListId: listId,
            checkedTodoIds,
        };
        ws.send(JSON.stringify(message));
    };

    const handleDelete = () => {
        const checkedTodoIds = todos.filter(todo => todo.checked && !todo.done).map(todo => todo.id);
        const message = {
            api: 'deleteTodoItems',
            todoListId: listId,
            checkedTodoIds,
        };
        ws.send(JSON.stringify(message));
    };

    const hasSelectedItems = todos.some(todo => todo.checked && !todo.done);

    const sortedTodos = [...todos].sort((a, b) => a.text.localeCompare(b.text, undefined, { sensitivity: 'base' }));

    const getHeaderSection = () => (
        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <Button onClick={() => navigate('/')} sx={{ marginRight: '1rem' }}>
                Back
            </Button>
            <h1 className="title" style={{ margin: 0 }}>{listName}</h1>
        </Box>
    );

    const getEditableSection = () => (
        <>
            <Box className="todo-input-container">
                <TextField
                    fullWidth
                    variant="outlined"
                    label="Enter a todo"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyUp={handleKeyUp}
                />
                <Button variant="contained" onClick={handleAddTodo}>
                    Add
                </Button>
            </Box>

            <List>
                {sortedTodos.map(todo =>
                    todo.done ? (
                        <ListItem
                            key={todo.id}
                            className="todo-done"
                        >
                            <ListItemIcon>
                                <Checkbox edge="start" checked={todo.checked} disabled disableRipple />
                            </ListItemIcon>
                            <ListItemText primary={todo.text} />
                        </ListItem>
                    ) : (
                        <ListItemButton
                            key={todo.id}
                            dense
                            onClick={() => handleToggle(todo)}
                        >
                            <ListItemIcon>
                                <Checkbox
                                    edge="start"
                                    checked={todo.checked}
                                    disableRipple
                                />
                            </ListItemIcon>
                            <ListItemText primary={todo.text} />
                        </ListItemButton>
                    )
                )}
            </List>

            <Box className="todo-buttons-container">
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleMarkDone}
                    disabled={!hasSelectedItems}
                    className="mark-done-button"
                >
                    Mark Done
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleDelete}
                    disabled={!hasSelectedItems}
                    className="delete-button"
                >
                    Delete
                </Button>
            </Box>
        </>
    );

    return (
        <Box className="todo-container">
            {
                getHeaderSection()
            }
            {
                (listId != null && ws != null) ? getEditableSection() : null
            }
        </Box>
    );
};

export default TodoList;
