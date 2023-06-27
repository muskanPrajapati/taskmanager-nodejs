require('../src/db/mongoose')
const Task = require('../src/models/task')

//!deleting the task with id and counting the rest task
// Task.findByIdAndDelete('6497289512319a57292adaf9').then((task) => {
//     console.log(task)
//     return Task.countDocuments({completed:false})
// }).then((result) => {
//     console.log(result)
// }).catch((e) => {
//     console.log(e)
// })

const deleteTaskAndCount = async (id) => {
    const task = await Task.findByIdAndDelete(id);
    const count = await Task.countDocuments({completed:false});
    return count;
}


deleteTaskAndCount('6497475a0efaa8918c5cd4e5').then((count) => {
    console.log(count)
}).catch((e) => {
    console.log(e)
})