import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

const HomePage = () => {
    const [todoLists, setTodoLists] = useState([]);
    const [newTodoListName, setNewTodoListName] = useState('');
    const navigate = useNavigate();

    const createNewTodoList = async () => {
        if (newTodoListName.trim() === '') {
            return;
        }
        const result = await fetch('/api/addlist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: newTodoListName }),
        });
        if (!result.ok) {
            throw new Error('Failed to create todo list');
        }
        setNewTodoListName('');
        refreshTodoLists();
    }

    const refreshTodoLists = async () => {
        const res = await fetch('/api/lists');
        const data = await res.json();
        setTodoLists(data);
    };

    useEffect(() => {
        refreshTodoLists();
    }, []);

    const handleKeyUp = async e => {
        if (e.key === 'Enter') {
            await createNewTodoList();
        }
    };

    return (
        <Box sx={{ padding: '0 2rem' }}>
            <h1 className="title">Todo Lists</h1>
            <Box className="todo-input-container">
                <TextField
                    fullWidth
                    variant="outlined"
                    label="Enter a new todo list name"
                    value={newTodoListName}
                    onChange={e => setNewTodoListName(e.target.value)}
                    onKeyUp={handleKeyUp}
                />
                <Button variant="contained" onClick={createNewTodoList}>
                    Add
                </Button>
            </Box>
            <List>
                {
                    todoLists.map(todoList => (
                        <ListItem key={todoList._id} disablePadding>
                            <ListItemButton onClick={() => navigate('/todo-list', { state: todoList })}>
                                <ListItemText primary={todoList.name} secondary={`Owner: ${todoList.owner}`} />
                            </ListItemButton>
                        </ListItem>
                    ))
                }
            </List>
        </Box>
    );
};

export default HomePage;