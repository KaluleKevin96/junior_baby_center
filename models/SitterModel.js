//this shall have the code that will interact with the database regarding Administrators
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const passportLocalMongoose = require('passport-local-mongoose');

const SitterSchema = mongoose.Schema({
    sitter_id:{
        type:String,
        unique: true,
        required: [true , "Generate unique secondary Id"]
    },
    first_name:{
        type:String,
        required: [true , "Please Enter The First Name"]
    },
    last_name:{
        type:String,
        required: [true , "Please Enter The Last Name"]
    },
    email:{
        type:String,
        unique : [true , "This email has already been registered with another Administrator" ],
        required : [true , "Please Enter The Email of The Registered Administrator"]       
    },
    phone_contact:{
        type:String,
        unique: [true, "This contact has been registered for another Administrator"],
        required: [true , "Please Enter The Phone Contact of The Point Of Access"]
    },
    password:{
        type:String,
    },
    status:{
        type:String,
        default: "active"
    },
    club : {
        type:String,
        required: [true , "What club does the supervisor belong to?"]
    },
    position : {
        type:String,
        required: [true , "Official or Supervisor"]
    },
    added_on:{
        type:Date,
        default: Date.now(),
    },
    added_by:{
        type:String,
        required: [true , "Who has registered this Point Of Access"]
    },
    updated_on:{
        type:Date,
    },
    autonumber:{
        type:Number,
        required : [true , "Autonumber is required"]
    },
    year:{
        type:Number,
        required : [true , "Year is required"]
    }

});


//hashing the password before it is saved
/* AdministratorSchema.pre('save' , function(next) {

    this.password = bcrypt.hashSync(this.password , 10);

    next();
});
 */

SitterSchema.plugin(passportLocalMongoose);

//exporting the model so that it can be accessed by the different routes
module.exports = mongoose.model('Sitter', SitterSchema);