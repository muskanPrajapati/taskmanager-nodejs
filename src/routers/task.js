const express = require('express');
const router = new express.Router();
const Task = require('../models/task');
const auth = require('../middleware/auth');

//!task

//route for task creation
router.post('/createTasks', auth,  async (req, res) => {
//     const task = new Task(req.body);
    const task = new Task({
          ...req.body,
     owner: req.user._id,
    });
    try {
        await task.save()
        res.status(201).send(task);
   } catch (e) {
        res.status(400).send(e)
   }
})

//route to fetch all tasks

//GET /task?completed=true
//GET /task?completed=false


//pagination
//GET/task/limit=10&skip=20

router.get('/allTasks', auth, async (req, res) => {

     const match = {};
     const sort = {};
 
     if (req.query.completed) {
         match.completed = req.query.completed === "true";
     }
 
     if (req.query.sortBy) {
         const parts = req.query.sortBy.split(":");
         sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
     } else {
         sort["createdAt"] = -1;
     }
 
     try {
         const task = await Task.find({
             user: req.user._id,
             ...match,
         }).skip(req.query.skip || 0)
             .limit(req.query.limit || 10)
             .sort(sort);
 
         if (!task) {
             return res.status(404).send("Oops!!, no task");
         }
 
         res.status(201).send(task);
    } catch (e) {
         res.status(500).send(e)
    }
})


//route to fetch single task

router.get('/tasks/:id',auth, async (req, res) => {
    const _id = req.params.id;

    try {
        const tasks =  await Task.findOne({_id, owner: req.user._id});
        if(!tasks){
            return res.status(400).send()
        }
         res.status(201).send(tasks);
    } catch (e) {
         res.status(500).send(e)
    }
})

//route to update task
router.patch('/updateTasks/:id',auth, async (req, res)=>{
     const updates = Object.keys(req.body);
     const allowedUpdate = ['description', 'completed'];
     const isValidOperation = updates.every((update) => allowedUpdate.includes(update));

     if(!isValidOperation){
          return res.status(400).send("Invalid update request")
     }
     
     try{
          const task = await Task.findById({
               _id: req.params.id,
               owner: req.user._id
          });

 
          if(!task){
               return res.status(404).send("no task exists")
          }

          updates.forEach((update) => task[update] = req.body[update])
          await task.save();

          res.send(task);
     } catch(e) {
          res.status(400).send(e)
     }
})


//route for deleting tasks 
router.delete('/deleteTask/:id',auth, async (req, res)=>{
     try{
          //findByIdAndDelete(search query, {fields to update}, {options})
          const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id})
          if(!task){
               return res.status(404).send('no task found')
          }
          res.send(task);
     } catch(e) {
          res.status(400).send(e)
     }
})



module.exports = router;