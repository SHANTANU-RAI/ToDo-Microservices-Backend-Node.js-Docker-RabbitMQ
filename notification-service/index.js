const amqp = require('amqplib');

async function start() {

    try{
        connection = await amqp.connect("amqp://rabbitmq");
        channel = await connection.createChannel();

        await channel.assertQueue("task_created");
        console.log("Notification Service is listening on task_created queue");
        
        channel.consume("task_created", (msg) => {
            const taskData = JSON.parse(msg.content.toString());
            console.log("Notification Service received task:", taskData);
            channel.ack(msg);
        });
        
    } catch (error){
        console.log("RabbitMQ connection failed :", error.message);
    }
    
}

start();