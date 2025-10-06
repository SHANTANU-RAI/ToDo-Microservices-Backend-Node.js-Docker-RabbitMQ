const express   = require('express');
const bodyParser = require('body-parser');
const mongoose   = require('mongoose');

const app = express();
const port = 8000;

app.use(bodyParser.json());

mongoose.connect('mongodb://mongo:27017/users')
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.log("mongodb connection error" , err));

const UserSchema = new mongoose.Schema({
    name: String,
    email: String
});

const User = mongoose.model('User' , UserSchema);

app.post('/users' , async (req , res) => {
    const {name , email} = req.body;
    try {
        const user = new User({name , email});
        await user.save();
        res.status(201).json(user);
    }
    catch(error){
        console.log("error saving: " , err);
        res.status(500).json({error: "Internal Server Error"});
    }
})

app.get('/users' , async (req , res) => {
    const users = await User.find({});
    res.json(users);
})

app.get('/' , (req , res) => {
    res.send('HELLO WORLD');
})

app.listen(port , () => console.log(`User Service is running on port ${port}`));