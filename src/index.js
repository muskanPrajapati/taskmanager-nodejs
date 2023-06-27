const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')


const app = express();
const port = process.env.PORT || 3000;


//parsing req as an incoming json to an obj
app.use(express.json())

//integrating route to app for real time usage
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log('Server is on port ' + port)
}) 


