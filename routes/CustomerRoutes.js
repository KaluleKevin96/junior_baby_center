//imprting packages
const express = require('express');
const router = express.Router();
const path = require('path');

// importing the model that contains the customers strucure
const Customer = require('../models/CustomerModel');

//current date
const current_date = new Date();


//post route that inserts a new customer
router.post('/register_customer' , async (req,res)=>{    

    //generate secondary id (poa id)
var customer_id , autonumber , current_year ;

current_year = current_date.getFullYear(); //getting the current year

//first , get the most recent autonumber
var most_recent = await Customer.findOne().sort({autonumber:-1}).exec();

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
    customer_id = "CU"+current_year.toString().slice(1,4)+"000" +autonumber ;
}else if(autonumber >= 10){
    customer_id = "CU"+current_year.toString().slice(1,4)+"00" +autonumber ;
}else if(autonumber >= 100){
    customer_id = "CU"+current_year.toString().slice(1,4)+"0" +autonumber ;
}else if(autonumber >= 1000){
    customer_id = "CU"+current_year.toString().slice(1,4)+"" +autonumber ;
}

                            
        //creating the model / document 
        const new_customer = new Customer({
            customer_id : customer_id,
            first_name : req.body.first_name,
            last_name : req.body.last_name,
            email : req.body.email,
            phone_contact : req.body.phone_contact,
            autonumber : autonumber,
            year : current_year,
            placeOfResidence : req.body.placeOfResidence,
            status : "active",
            position : "customer",
            added_by : (req.user) ? req.user.admin_id : "guest",
            added_on : Date.now()
        });
        
        try{

            await new_customer.save();

            res.redirect("/jbc_appointments/book_appointment/"+customer_id);

        }
        catch(error){

            console.log(error);

            res.status(500).send("Customer Registration Failed. Please Refresh the page and try again");
        }

        })


//post  route that inserts a lost item into the database
router.post('/', async(req, res) => {
 
//route to load page that shows missing form report
// router.get('/all-items' , async(req,res) => {


// });

        
 
});


module.exports = router;