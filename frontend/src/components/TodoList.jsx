import React, { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
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

const TodoList = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const listId = location.state?._id;
    const listName = location.state?.name || 'Todo List';

    const [inputValue, setInputValue] = useState('');
    const [todos, setTodos] = useState([]);

    useEffect(() => {
        const fetchTodoList = async () => {
            const res = await fetch(`/api/lists/${listId}`);
            const data = await res.json();
            setTodos(data.items);
        };
        if (listId != null) {
            fetchTodoList();
        }
    }, []);

    const handleAddTodo = () => {
        if (inputValue.trim() !== '') {
            // Call backend API to update
            setTodos([
                ...todos,
                {
                    id: nanoid(),
                    text: inputValue,
                    checked: false,
                    done: false,
                },
            ]);
            setInputValue('');
        }
    };

    const handleKeyUp = e => {
        if (e.key === 'Enter') {
            handleAddTodo();
        }
    };

    const handleToggle = id => {
        // Call backend API to update
        setTodos(
            todos.map((todo) =>
                todo.id === id && !todo.done
                    ? { ...todo, checked: !todo.checked }
                    : todo
            )
        );
    };

    const handleMarkDone = () => {
        // Call backend API to update
        setTodos(
            todos.map((todo) =>
                todo.checked ? { ...todo, done: true } : todo
            )
        );
    };

    const handleDelete = () => {
        // Call backend API to update
        setTodos(
            todos.filter(todo => !todo.checked || todo.done)
        )
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
                            onClick={() => handleToggle(todo.id)}
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
                listId != null ? getEditableSection() : null
            }
        </Box>
    );
};

export default TodoList;
