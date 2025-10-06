const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const amqp = require('amqplib');

const app = express();
const port = 8001;

app.use(bodyParser.json());

mongoose.connect('mongodb://mongo:27017/tasks')
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.log("mongodb connection error", err));

const TaskSchema = new mongoose.Schema({
    title: String,
    description: String,
    userId: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Task = mongoose.model('Task', TaskSchema);

var channel , connection;

async function connectRabbitMQWithRetry(retries = 5, delay = 5000) {

    while(retries){
        try{
            connection = await amqp.connect("amqp://rabbitmq");
            channel = await connection.createChannel();
            await channel.assertQueue("task_created");
            console.log("Connected to RabbitMQ");
            return;
        } catch (error){
            console.log("RabbitMQ connection failed, retrying in 5 seconds...", error.message);
            retries--;
            console.log(`Retries left: ${retries}`);
            await new Promise(res => setTimeout(res, delay));
        }
    }
}

app.post('/tasks', async (req, res) => {
    const {title , description, userId} = req.body;
    try {
        const task = new Task({title, description, userId});
        await task.save();

        const message = {taskId: task._id, userId , title};

        if(!channel){
            return res.status(503).json({error: "RabbitMQ channel not established"});
        }

        channel.sendToQueue("task_created" , Buffer.from(JSON.stringify(message)));

        res.status(201).json(task);
    }
    catch(error){
        console.log("error saving: " , error);
        res.status(500).json({error: "Internal Server Error"});
    }
})

app.get('/tasks', async (req, res) => {
    const tasks = await Task.find({});
    res.json(tasks);
})

app.listen(port, () => {
    console.log(`Task Service is running on port ${port}`)
    connectRabbitMQWithRetry();
});