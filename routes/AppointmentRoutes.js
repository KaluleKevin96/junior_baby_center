//imprting packages
const express = require('express');
const router = express.Router();
const path = require('path');

// importing the model that contains the customers strucure
const Customer = require('../models/CustomerModel');

//importing model that contains the appointment structure
const Appointment = require('../models/AppointmentModel');

//current date
const current_date = new Date();

router.get("/book_appointment/:customer_id" , async(req,res) =>{

    //get the the info abou the customer/parent that has just been registered
    var recently_added_customer = await Customer.findOne({customer_id:req.params.customer_id});

    //find all appointments that have been booked by the customer/parent
    var customers_past_bookings = await Appointment.find({customer_id:req.params.customer_id});

    if(recently_added_customer){

        res.render("book_appointment" , {
            title:"BOOK AN APPOINTMENT",
            customer : recently_added_customer,
            past_bookings:customers_past_bookings,
        })
    
    }else{

        res.status(500).send("Customer Not Found")
    }
})

//post route to book
router.post("/customer_book_appointment" , async(req,res) =>{

    //get the the info abou the customer/parent that has just been registered
    var recently_added_customer = await Customer.findOne({customer_id:req.body.customer_id});

    //find all appointments that have been booked by the customer/parent
    var customers_past_bookings = await Appointment.find({customer_id:req.body.customer_id});

    if(recently_added_customer){

        res.render("book_appointment" , {
            title:"BOOK AN APPOINTMENT",
            customer : recently_added_customer,
            past_bookings:customers_past_bookings,
        })
    
    }else{

        res.status(500).send("Customer Not Found. Please GO BACK to continue")
    }
})


router.post("/book_appointment" , async(req,res) =>{

    if(req.body.customer_id == '' || req.body.customer_id == undefined){

        res.status(500).send("NO CUSTOMER INFORMATION PROVIDED , PLEASE TRY AGAIN");
    
    }else{

        var child_id , appointment_id , day_of_appointment , child_id_day, child_id_club , autonumber , current_year;

        /* ------- generating parts of the appointment ID ------------------------ */
        current_year = current_date.getFullYear(); //getting the current year

            //first , get the most recent autonumber
            var most_recent = await Appointment.findOne().sort({autonumber:-1}).exec();

            // console.log(most_recent);

            if(most_recent == undefined || most_recent.length == 0){
                //if there is no record, meaning its the first record to be stored

                autonumber = 0;        

            }else{
                //if there is a record then get that auto number and year

                if(current_year == ( most_recent.year + 1)){
                    //if the current year is one more than the most recent year recorded in the database
                    //that means its a new year and so the auto number is reset to 1

                    autonumber = 0;

                }else{

                    autonumber = most_recent.autonumber;
                }

            }
            //increment the returned autonumber by 1
            autonumber += 1;

            if(autonumber < 10){
                appointment_id = "AP"+current_year.toString().slice(1,4)+"000" +autonumber ;
            }else if(autonumber >= 10){
                appointment_id = "AP"+current_year.toString().slice(1,4)+"00" +autonumber ;
            }else if(autonumber >= 100){
                appointment_id = "AP"+current_year.toString().slice(1,4)+"0" +autonumber ;
            }else if(autonumber >= 1000){
                appointment_id = "AP"+current_year.toString().slice(1,4)+"" +autonumber ;
            }

        /* ------- generating parts of the baby ID ------------------------ */

        var submitted_date = new Date(req.body.date_of_appointment) , submitted_club = req.body.club;

        day_of_appointment = submitted_date.getDate() + 1;

        switch (day_of_appointment) {
            case 1:
                
                child_id_day = "MO";
                break;
            
            case 2:
            
                child_id_day = "TU";
                break;

            case 3:
        
                child_id_day = "WE";
                break;

            case 4:
    
                child_id_day = "TH";
                break;

            case 5:

                child_id_day = "FR";
                break;
            
            case 6:

                child_id_day = "SA";
                break;
            
            case 7:

                child_id_day = "SU";
                break;
        
            default:
                    child_id_day = "Unspecified"
                break;
        }

        child_id_club = submitted_club.toString().slice(0,2).toUpperCase();

        if(autonumber < 10){
            child_id = child_id_club+child_id_day+"000" +autonumber ;
        }else if(autonumber >= 10){
            child_id = child_id_club+child_id_day+"00" +autonumber ;
        }else if(autonumber >= 100){
            child_id = child_id_club+child_id_day+"0" +autonumber ;
        }else if(autonumber >= 1000){
            child_id = child_id_club+child_id_day+""+autonumber ;
        }
        /* ------- generating parts of the baby ID ends here ------------------------ */

        var booked_appointment = new Appointment({
            appointment_id:appointment_id,
            customer_id:req.body.customer_id,
            name_of_parent : req.body.name_of_parent,
            child_id : child_id,
            child_name : req.body.child_name,
            club : req.body.club,
            date_of_appointment : req.body.date_of_appointment,
            time : req.body.time,
            duration : req.body.duration,
            sitter_assigned : "None",
            bill : req.body.final_bill,
            status : "pending",
            added_on : Date.now(),
            added_by : (req.user) ? req.user.admin_id : "guest",
            autonumber : autonumber,
            year : current_year
        });

        try{

            await booked_appointment.save();
//redirect home
            res.redirect("/");

        }
        catch(error){

            console.log(error);

            res.status(500).send("Appointment Booking Failed. Please Refresh the page and try again");
        }
    }
})

//Post function to approve a booking and assign a sitter to the booking
router.post("/approve_appointment" , async(req,res) =>{

    var appointmentID = req.body.appointmentID;

    var newValues = {};

                //define what object properties should be updated depending on what was changed by the user
                if(req.body.sitter && req.body.sitter != ""){

                    newValues.sitter = req.body.sitter
                    newValues.status = "approved";
                }

    try{

        var approved_appointment = await Appointment.updateOne({_id:appointmentID} , newValues);

        console.log(approved_appointment)
        
        if(approved_appointment.ok == 1){


        return res.redirect('/jbc_administrators/admin_home');

        }else{

            //redirect with session flash message to amdin home 
           return res.redirect('/jbc_administrators/admin_home');
        }

    }catch(err){

        console.log(err);
        res.status(500).send("There is an error \n Error Message : "+ err);
    }   

})

/* 
async function getAllAppointments(status="pending"){

    var appointments = await Appointment.find({status : status})

    return appointments;
}

async function getAllCustomerAppointments(customer_id){

    var appointments = await Appointment.find({customer_id : customer_id})

    return appointments;
}

async function getAllSitterAppointments(sitter){

    var appointments = await Appointment.find({sitter : sitter})

    return appointments;
} */

module.exports = router;