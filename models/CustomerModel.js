//this shall have the code that will interact with the database regarding Administrators
const mongoose = require('mongoose');

const CustomerSchema = mongoose.Schema({
    customer_id:{
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
        unique : [true , "This email has already been registered with another customer" ],
        required : [true , "Please Enter An Email "]       
    },
    phone_contact:{
        type:String,
        unique: [true, "This contact has been registered for another customer"],
        required: [true , "Please Enter A Phone Contact"]
    },
    placeOfResidence:{
        type:String,
        required: [true , "Please Enter A Place Of Residence"]
    },
    status:{
        type:String,
        default: "active"
    },
    position : {
        type:String,
        required: [true , "What position does this record hold in the application"]
    },
    added_on:{
        type:Date,
        default: Date.now(),
    },
    added_by:{
        type:String,
        required: [true , "Who has registered this Point Of Access"]
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



//exporting the model so that it can be accessed by the different routes
module.exports = mongoose.model('Customer', CustomerSchema);