import React, { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import { WebSocketContext } from '../providers/WebSocketProvider';

const HomePage = () => {
    const ws = useContext(WebSocketContext);
    const [todoLists, setTodoLists] = useState([]);
    const [newTodoListName, setNewTodoListName] = useState('');
    const navigate = useNavigate();

    const refreshTodoLists = () => {
        const message = {
            api: 'lists',
        };
        ws.send(JSON.stringify(message));
    };

    const createNewTodoList = async () => {
        if (newTodoListName.trim() === '') {
            return;
        }

        const message = {
            api: 'addlist',
            name: newTodoListName,
        };
        ws.send(JSON.stringify(message));
    };

    useEffect(() => {
        if (!ws) {
            return;
        }

        const messageHandler = event => {
            const message = JSON.parse(event.data);
            if (message?.api === 'lists') {
                setTodoLists(message.result);
            } else if (message?.api === 'addlist') {
                setNewTodoListName('');
                refreshTodoLists();
            }
        };

        ws.addEventListener('message', messageHandler);

        if (ws.readyState === WebSocket.OPEN) {
            // Socket might already be open - for example if navigate back from /todo-list
            refreshTodoLists();
        } else {
            ws.addEventListener(
                'open',
                refreshTodoLists,
                { once: true }
            );
        }

        return () => {
            console.log('Removing event listener for lists.');
            ws.removeEventListener('message', messageHandler);
        };
    }, [ws]);

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