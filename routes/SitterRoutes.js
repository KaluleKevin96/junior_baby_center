/* ---------------- CONTAINS ALL ROUTES TO DO WITH ADMINISTRATORS-------------*/
//importing important packages that shall be used
const express = require('express');
const router = express.Router();
const path = require('path');

const bcrypt = require('bcrypt');

const passport = require('passport'); //importing passport

// importing the model that sitters shall use
const Sitter = require('../models/SitterModel');

//current date
const current_date = new Date();

 /* passport.use('admin-local' , new AdministratorLocalStrategy({
     usernameField:"email"
 },Administrator.authenticate()));
  */
/* passport.serializeUser(function(user, done) {
    done(null, user.sitter_id);
  });
  
passport.deserializeUser(function(sitter_id, done) {
    Administrator.findOne({sitter_id : sitter_id}, function(err, user) {
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
router.get('/register_sitter_form', (req,res) => {

    //incoporate session code later

    res.render('administrators/register_administrator' , {
        
        title:"REGISTER SITTER",
        user : req.user
    })

});


//POST route to insert admin into the database WITH PASSPORT
router.post('/register_sitter' , async(req,res) => {

    //incoporate session code later

    //generate secondary id (poa id)
var sitter_id , autonumber , current_year ;

    current_year = current_date.getFullYear(); //getting the current year

    //first , get the most recent autonumber
    var most_recent = await Sitter.findOne().sort({autonumber:-1}).exec();

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
        sitter_id = "ST"+current_year.toString().slice(1,4)+"000" +autonumber ;
    }else if(autonumber >= 10){
        sitter_id = "ST"+current_year.toString().slice(1,4)+"00" +autonumber ;
    }else if(autonumber >= 100){
        sitter_id = "ST"+current_year.toString().slice(1,4)+"0" +autonumber ;
    }else if(autonumber >= 1000){
        sitter_id = "ST"+current_year.toString().slice(1,4)+"" +autonumber ;
    }

    //passport registration function begins here
    Administrator.register(new Administrator({

        sitter_id : sitter_id,
        first_name : req.body.first_name,
        last_name : req.body.last_name,
        email : req.body.email,
        phone_contact : req.body.phone_contact,
        username: req.body.username,
        autonumber : autonumber,
        year : current_year,
        status : "active",
        position : "babysitter",
        added_by : (req.user) ? req.user.admin_id : sitter_id,
        added_on : Date.now()

    }) , req.body.password
        ,function (err , account) {

            if(err){
                //if there are any errors during registration , redirect to the registration form page
                // console.log(err);
                // console.log(account);
                console.log(err.message)
                
                
                return res.render('admin_home' , {
        
                    title:"ADMINISTRATOR HOME",
                    account : account,
                    error_message : err.message
                });
            }

            console.log(account);

            passport.authenticate('admin-local')(req, res , function (){
                
                res.redirect("/all_sitters");
            })
        }
    )


});



router.post('/sitter_login', 
        passport.authenticate('admin-local', {
            failureFlash: true,
            failureRedirect : "/administrators/admin_login",
            failureMessage : "Log In Failed"
        }) , function(req , res){
        // console.log(req.user);

        return res.redirect('/administrators/all_administrators');
        
        }
);

//route to load page that shows all administrators
router.get('/all_appointments', checkAdminlogged_in , async(req,res) => {

});

//route for administrator to logout
router.get('/admin_logout', checkAdminlogged_in , function(req, res) {
    req.logout();
    res.redirect('/administrators/admin_login');
});

//custom function that is going to be used as middleware to check if an administrator is logged in
function checkAdminlogged_in (req , res , next){

    var all_admins = Administrator.find();
    
    if(all_admins.sitter_id == undefined || all_admins == null || all_admins.length == 0){ //if it is first time setup and the first administrator is going to register

        return next();

    }else{
        
        if(req.isAuthenticated()){ //if user is authenticated then go ahead and let them see the page

            return next();

        }else{

            console.log("Please Log In To Continue");
            return res.redirect('/jbc_administrators/admin_home');
        }
    }
}

//custom function that is going to be used as middleware to check if an administrator is not logged in
//so that they are not allowed to go to the log in form
function checklogged_out (req , res , next){

}


module.exports = router;