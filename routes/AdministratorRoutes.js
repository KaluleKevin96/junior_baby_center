/* ---------------- CONTAINS ALL ROUTES TO DO WITH ADMINISTRATORS-------------*/
//importing important packages that shall be used
const express = require('express');
const router = express.Router();
const path = require('path');

const bcrypt = require('bcrypt');

const passport = require('passport'); //importing passport
const AdministratorLocalStrategy = require('passport-local').Strategy;

// importing the model that admins shall use
const Administrator = require('../models/AdministratorModel');

//importing other necessary Models
const Sitter = require('../models/SitterModel');
const Customer = require('../models/CustomerModel');
const Appointment = require('../models/AppointmentModel');

//current date
const current_date = new Date();

 passport.use('admin-local' , new AdministratorLocalStrategy({
     usernameField:"email"
 },Administrator.authenticate()));

passport.serializeUser(Administrator.serializeUser());
passport.deserializeUser(Administrator.deserializeUser());

/* passport.serializeUser(function(user, done) {
    done(null, user.admin_id);
  });
  
passport.deserializeUser(function(admin_id, done) {
    Administrator.findOne({admin_id : admin_id}, function(err, user) {
      done(err, user);
    });
  }); */

/* passport.use('admin-local' , new AdministratorLocalStrategy(function(username , password , done ){
    Administrator.findOne({ username : username }, function(err, user) {
        // first method succeeded?
        if (!err && user && passwordMatches(password)) {

        return done(null, user);

        }else{

            return done(null , false)
        }

}); */


//route to load the register administrator form
router.get('/register_administrator_form', checkAdminlogged_in , (req,res) => {

    //incoporate session code later

    res.render('administrators/register_administrator' , {
        
        title:"REGISTER ADMINISTRATOR",
        user : req.user
    })

});


//POST route to insert admin into the database WITH PASSPORT
router.post('/register_admin' , async(req,res) => {

    //incoporate session code later

    //generate secondary id (poa id)
var admin_id , autonumber , current_year ;

    current_year = current_date.getFullYear(); //getting the current year

    //first , get the most recent autonumber
    var most_recent = await Administrator.findOne().sort({autonumber:-1}).exec();

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
        admin_id = "A"+current_year.toString().slice(1,4)+"000" +autonumber ;
    }else if(autonumber >= 10){
        admin_id = "A"+current_year.toString().slice(1,4)+"00" +autonumber ;
    }else if(autonumber >= 100){
        admin_id = "A"+current_year.toString().slice(1,4)+"0" +autonumber ;
    }else if(autonumber >= 1000){
        admin_id = "A"+current_year.toString().slice(1,4)+"" +autonumber ;
    }

    //passport registration function begins here
    Administrator.register(new Administrator({

        admin_id : admin_id,
        first_name : req.body.first_name,
        last_name : req.body.last_name,
        email : req.body.email,
        username : req.body.email,
        phone_contact : req.body.phone_contact,
        autonumber : autonumber,
        year : current_year,
        status : "active",
        position : "admin",
        club : "Official",
        added_by : (req.user) ? req.user.admin_id : admin_id,
        added_on : Date.now()

    }) , req.body.password
        ,function (err , account) {

            if(err){
                //if there are any errors during registration , redirect to the registration form page
                // console.log(err);
                // console.log(account);
                console.log(err.message)
                
                
                return res.redirect('/');
            }

            console.log(account);

            passport.authenticate('admin-local')(req, res , function (){
                
                res.redirect("/jbc_administrators/admin_home");
            })
        }
    )


});

//route to load the administrator HOME PAGE
router.get('/admin_home', async(req,res) => {

    //incoporate session code later
// if(messages != undefined) {console.log(messages)}
var administrators = await Administrator.find(),

    pending_appointments = await Appointment.find({status : "pending"}),
    approved_appointments = await Appointment.find({status : "approved"}),
    registered_sitters = await Sitter.find({status : "active"});


    res.render('admin_home' , {
        
        title:"JBC ADMINISTRATOR",
        user : req.user,
        administrators : administrators,
        pending_appointments : pending_appointments,
        approved_appointments : approved_appointments,
        registered_sitters : registered_sitters,
    });

});

//POST ROUTE FOR admin login
router.post('/admin_login', 
  passport.authenticate('admin-local', {
      failureFlash: true,
      failureRedirect : "/",
      failureMessage : "Log In Failed"
  }) , function(req , res){
// console.log(req.user);

    return res.redirect('/jbc_administrators/admin_home');
  
    }
);

//route to load page that shows all administrators
router.get('/all_administrators', checkAdminlogged_in , async(req,res) => {

    //incoporate session code later
// console.log(req.user);
    var all_administrators = await Administrator.find();
// console.log(req.user);
    res.render('administrators/all_administrators' , {
        
        title:"ALL REGISTERED ADMINISTRATORS",
        administrators : administrators,
        user : req.user
    })

});

//route for administrator to logout
router.get('/admin_logout', checkAdminlogged_in , function(req, res) {
    req.logout();
    res.redirect('/administrators/admin_login');
});

//custom function that is going to be used as middleware to check if an administrator is logged in
function checkAdminlogged_in (req , res , next){

    var all_admins = Administrator.find();
    
    if(all_admins.admin_id == undefined || all_admins == null || all_admins.length == 0){ //if it is first time setup and the first administrator is going to register

        return next();

    }else{
        
        if(req.isAuthenticated()){ //if user is authenticated then go ahead and let them see the page

            return next();

        }else{

            console.log("Please Log In To Continue");
            return res.redirect('/administrators/admin_login');
        }
    }
}

//custom function that is going to be used as middleware to check if an administrator is not logged in
//so that they are not allowed to go to the log in form
function checkAdminlogged_out (req , res , next){
        
        if(req.isAuthenticated()){ //if user is authenticated then go ahead and let them see the page

            console.log("Please Log Out To Continue");
            return res.redirect('/administrators/all_administrators');
            

        }else{

            return next();           
        }
    
}


module.exports = router;