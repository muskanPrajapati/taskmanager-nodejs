const { builtinModules } = require('module');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Task  =require('./task')

//creating the schema
const userSchema = new mongoose.Schema(
    {
        name:{
            type: String,
            required: true ,        //mongoose validator
            trim : true
        },
        email: {
            type: String,
            unique : true,
            required : true,     //mongoose validator
            trim: true,
            lowercase: true,
            validate(value){        //custom validator
                if(!validator.isEmail(value)) {
                    throw new Error("Please enter a valid email address")
                }
            }
        }, 
        age:{
            type : Number,
            default: 0,
            validate(value){          //custom validator
                if(value <0){
                    throw new Error('Age must be positive no')
                }
            }
        },
        password: {
            type: String,
            required: true,
            minlength: 7,
            trim: true,
            validate(value) {
                if (value.toLowerCase().includes("password")) {
                    throw new Error('Password cannot contain "password"');
                }
            },
        },
        tokens:[{
            token:{
                type: String,
                required: true
            }
        }],
        avatar:{
            type:Buffer,
        }    
},{
        timestamps: true
    });

    //connecting task model to user model virtually

    userSchema.virtual('task', {
        ref: 'Task',
        localField: "_id",
        foreignField: "owner"
    })

//function to generating authentication token 
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString()}, 'thisismycourse')

    user.tokens = user.tokens.concat({token})
    await user.save();
    return token;

}

//public profile --> hiding unwanted data 
userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}
    
//building custom middleware or a function to check the email and password for login

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email})
    if(!user){
        throw new Error("unable to login, no email found")
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        throw new Error("unable to login, password is incorrect")
    }

    return user;
}
    
//setting middleware for hashing the password and matching it before saving

userSchema.pre('save', async function (next) {
    const user = this;

   // hashing the password

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password , 8)
    }
    next();
})

//Delete user tasks when deleting user
userSchema.pre('deleteOne', async function (next) {
    const user = this;
    console.log(Task.findByElement({owner: user._id}))
    await Task.deleteMany({owner: user._id})
    next();
})
   
const User = mongoose.model('User', userSchema )

module.exports = User

