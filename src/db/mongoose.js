//CRUD BY MONGOOSE
const mongoose = require('mongoose');


//connection url and db name
const connectionURI = 'mongodb+srv://muskanprajapati94:muskaan@cluster0.qd8rynx.mongodb.net/taskManagerApi?retryWrites=true&w=majority'

mongoose.connect(connectionURI, console.log('db connected'), {
    useNewUrlParser: true,
    useCreateIndex: true
})




