const express = require('express');
const router = new express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp')

//!user
// route handler for creating new user
router.post('/users', async (req, res) => {
    const user  = new User(req.body)
    try {
         await user.save()
         const token = await user.generateAuthToken()
         res.status(201).send({user, token});
    } catch (e) {
         res.status(400).send(e)
    }
 
 })


 //route for logging in with the credentials
 router.post('/users/login', async(req, res) => {
     try{
          const user = await User.findByCredentials(req.body.email, req.body.password);

          const token = await user.generateAuthToken();
          
          res.send({user, token});
     }catch(e){
          res.status(400).send(e);
     }
 })

 //route for logout from one device
 router.post('/users/logout', auth, async (req, res) => {
     
     try{
          req.user.tokens = req.user.tokens.filter((token) => {
               return token.token !== req.token
          })
          
          await req.user.save()
          res.send('logged out')
     }catch(e){
          res.status(400).send(e);
     }
 })

 //route for logout from all device
 router.post('/users/logoutAll', auth, async (req, res) => {
     
     try{
          req.user.tokens = [];
          await req.user.save()
          res.send('logged out from all ')
     }catch(e){
          res.status(500).send(e);
     }
 })
 
 //route to fetch profile of single user form db
 
 router.get(('/users/me'), auth, async (req, res) => {
     res.send(req.user)
})
 
 
 //route to update user
 router.patch('/updateUsers/me', auth, async (req, res)=>{

      const updates = Object.keys(req.body);
      const allowedUpdates = ['name', 'email', 'password', 'age'];
      const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
 
      if(!isValidOperation){
           return res.status(400).send("Invalid update request")
      }
 
      try{
          //creating middleware
          // const user = await User.findById(req.params.id)


          updates.forEach((update) => req.user[update] = req.body[update])
          await req.user.save();

           res.send(req.user);
      } catch(e) {
           res.status(400).send(e)
      }
 })
 
 // route for deleting user 
 router.delete('/deleteUser/me', auth, async (req, res) => {
     
      try{
           await req.user.deleteOne()
           res.send(req.user);
      } catch(e) {
           res.status(500).send()
      }
 })
 

 //to save user image
 
 const upload = multer({
     
     limits:{
          fileSize: 1000000
     },
     fileFilter(req, file, cb){
          if(!file.originalname.match(/\.(jpg|jpeg|png|)$/)){
               return cb(new Error('Please upload an required image'))
          }

          cb(undefined, true)
     }
 })

 router.post('/users/me/avatar', auth, upload.single('avatar'), async(req, res) => {
     const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer();
     req.user.avatar = buffer;
     await req.user.save()
     res.send("uploaded image")
 },(error, req, res, next) => {
     res.status(400).send({error: error.message});
 })


 //route to delete the user image 
 router.delete('/users/me/deleteavatar', auth , async (req, res) => {
     req.user.avatar = undefined;
     await req.user.save();
     res.send()
 })

 router.get('/users/:id/avatar', async (req, res) => {
     try{
          const user = await User.findById(req.params.id);
          if(!user || !user.avatar) {
               throw new Error("No avatar is uploaded")
          }
          res.set('Content-Type', 'image/png');
          res.send(user.avatar)
     }catch(e){
          res.status(404).send(e);
     }
 })

 module.exports = router;