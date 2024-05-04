require('dotenv').config()
const express  = require('express');
const Io = require('./io')
const { v4:uuid} = require('uuid');
const PORT = process.env.PORT
const app = express();

const todosDb = new Io(`${process.cwd()}/db/todos.json`)

app.use(express.json())

app.get('', async(req, res) => {
    let todos = await todosDb.read()
    res.json({ message: 'Hello', data: todos })
})

app.post('/create', async(req, res) => {
    let todos = await todosDb.read()
    const {name, description} = req.body;
    if(!name || !description) {
        return res.status(406).json({message: 'Did not input name or description. Please try again'})
    }
    const newTodo = {
        name,
        description,
        id: uuid()
    };
    todos.push(newTodo);
    await todosDb.write(todos);
    res.json({data: newTodo})
})

app.put('/update', async(req, res) => {
    let todos = await todosDb.read()
    const {name, description, id} = req.body
    const todo = todos.find((el) => el.id === id)
    if(!todo) return res.status(404).json({message: `This todo with id '${id}' is not found`})
    todo.name = name
    todo.description = description
    await todosDb.write(todos)
    res.json({data: todo})
})

app.delete('/delete', async(req, res) => {
    let todos = await todosDb.read()
    const {id} = req.body
    if(!id){
        return res.status(400).json({message: 'Please input id'})
    } else if(todos.length == 0) {
        return res.status(404).json({message: 'Todos is empty'})
    }
    todos = todos.filter((el) => el.id !== id)  
    await todosDb.write(todos)
    res.json({data: todos})
})

app.listen(PORT, () => {
    console.log(`Listening to port ${PORT}`);
})

