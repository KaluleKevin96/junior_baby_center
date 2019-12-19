//this shall have the code that will interact with the database regarding Administrators
const mongoose = require('mongoose');

const AppointmentSchema = mongoose.Schema({
    appointment_id:{
        type:String,
        unique: true,
        required: [true , "Generate unique secondary Id"]
    },
    name_of_parent:{
        type:String,
        required: [true , "Please Enter Name of Parent"]
    },
    customer_id:{
        type:String,
        required: [true , "Enter the customer ID"]
    },
    child_id:{
        type:String,
        required: [true , "Please generate baby ID"]
    },
    child_name:{
        type:String,
        required: [true , "Please Enter The Child's Name"]
    },
    club:{
        type:String,
        required: [true , "Please Select Time Club for the appointment"]
    },
    date_of_appointment:{
        type:Date,
        required : [true , "Please Enter The Date for the booking"]       
    },
    time:{
        type:String,
        required : [true , "Please Enter The Start time for the booking"]       
    },
    duration:{
        type:Number,
        required: [true , "Please Enter The Duration for the appointment"]
    },
    sitter_assigned:{
        type:String,
        required: [true , "Please Select a Sitter to be assigned"]
    },
    bill:{
        type:Number,
        required: [true , "What is the calculated bill"]
    },
    status:{
        type:String,
        default: "active"
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
module.exports = mongoose.model('Appointment', AppointmentSchema);