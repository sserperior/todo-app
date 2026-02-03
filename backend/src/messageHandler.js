export const messageHandler = (ws, { dbName, collectionName }, dbConnector) => async message => {
    // Messages come in as a Buffer. They need to be converted to a string first.
    const messageString = message.toString();
    const jsonMessage = JSON.parse(messageString);
    if (jsonMessage?.api === 'lists') {
        // Initial connection.Send the list of todos to the client.
        // owner stubbed to 'you' for now.
        const todos = await dbConnector.find(dbName, collectionName, { owner: 'you' }, { createdAt: -1 }, { _id: 1, name: 1, owner: 1 });
        const message = {
            api: 'lists',
            result: todos,
        };
        ws.send(JSON.stringify(message));
    } else if (jsonMessage?.api === 'list') {
        // Initial connection.Send the list of todos to the client.
        // owner stubbed to 'you' for now.
        const id = jsonMessage?.id;
        const todoList = await dbConnector.findById(dbName, collectionName, id, { _id: 1, name: 1, items: 1 });
        const message = {
            api: 'list',
            result: todoList,
        };
        ws.send(JSON.stringify(message));
    } else if (jsonMessage?.api === 'addlist') {
        const { name } = jsonMessage;
        const todoList = {
            name,
            owner: 'you', // stub for now
            items: [],
            createdAt: new Date(),
        };
        const { insertedId } = await dbConnector.insertOne(dbName, collectionName, todoList);
        const message = {
            api: 'addlist',
            result: { id: insertedId },
        };
        ws.send(JSON.stringify(message));
    } else if (jsonMessage?.api === 'addTodoItem') {
        const { todoListId, text } = jsonMessage;
        const todoItem = {
            text,
            checked: false,
            done: false,
        };
        const result = await dbConnector.syncItems(dbName, collectionName, todoListId, [
            {
                type: 'append',
                payload: todoItem,
            }
        ]);
        const updatedDocument = await dbConnector.findById(dbName, collectionName, todoListId, { _id: 1, name: 1, items: 1 });
        const message = {
            api: 'addTodoItem',
            result: {
                todos: updatedDocument.items,
            },
        };
        ws.send(JSON.stringify(message));
    } else if (jsonMessage?.api === 'toggleTodoItemChecked') {
        const { todoListId, id, checked } = jsonMessage;
        await dbConnector.syncItems(dbName, collectionName, todoListId, [
            {
                type: 'modify',
                payload: {
                    id,
                    checked,
                },
            },
        ]);
        const updatedDocument = await dbConnector.findById(dbName, collectionName, todoListId, { _id: 1, name: 1, items: 1 });
        const message = {
            api: 'toggleTodoItemChecked',
            result: {
                todos: updatedDocument.items,
            },
        };
        ws.send(JSON.stringify(message));
    } else if (jsonMessage?.api === 'markTodoItemsDone') {
        const { todoListId, checkedTodoIds } = jsonMessage;
        await dbConnector.syncItems(dbName, collectionName, todoListId, checkedTodoIds.map(id => ({
            type: 'modify',
            payload: {
                id,
                done: true,
            },
        })));
        const updatedDocument = await dbConnector.findById(dbName, collectionName, todoListId, { _id: 1, name: 1, items: 1 });
        const message = {
            api: 'markTodoItemsDone',
            result: {
                todos: updatedDocument.items,
            },
        };
        ws.send(JSON.stringify(message));
    } else if (jsonMessage?.api === 'deleteTodoItems') {
        const { todoListId, checkedTodoIds } = jsonMessage;
        await dbConnector.syncItems(dbName, collectionName, todoListId, checkedTodoIds.map(id => ({
            type: 'remove',
            payload: {
                id,
            },
        })));
        const updatedDocument = await dbConnector.findById(dbName, collectionName, todoListId, { _id: 1, name: 1, items: 1 });
        const message = {
            api: 'deleteTodoItems',
            result: {
                todos: updatedDocument.items,
            },
        };
        ws.send(JSON.stringify(message));
    }
};