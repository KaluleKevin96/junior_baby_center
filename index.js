// console.log("Hello World");/
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser'); //requiring the body parse package (module)

const session = require('express-session'); //importing express session package
const flash = require('express-flash'); //importing express flash package

const back = require('express-back'); //express back module 
const multer = require('multer');
const fs = require('fs'); //importing the files system 

const passport = require('passport'); //importing passport
const LocalStrategy = require('passport-local').Strategy;


//initialising the app
const app = express();
//requiring the mongoose package to communicate with mondoDB
const mongoose = require('mongoose');


//MIDDLEWARES
//defining what the app should use for the body parser
app.use(bodyParser.urlencoded({ extended: true }))
// app.use(bodyParser.json());

//declaring the path where the views shall be stored
app.set('views', path.join(__dirname, 'views'));

//defining the view enegine to be pug
app.set('view engine', 'pug');

//defining the 'public' folder to be static
app.use(express.static(path.join(__dirname, 'public')));

//middleware to use flash
app.use(flash())
 
//middleware to tell the application to use session
app.use(session({
    secret : "super secret",
    resave : true,
    saveUninitialized : false
}))

//app using passport and initialzing it
app.use(passport.initialize());
app.use(passport.session());

app.use(back());


// importing the model that admins shall use
const Administrator = require('./models/AdministratorModel');



//middleware to assign session object to locals of the app
app.use((req , res , next) => {

    var registered_admin = Administrator.find();

    app.locals.registered_admin = registered_admin;
    
   if(req.session.user){

        app.locals.loggedin_user = req.session.user;
    
    }
    else if(req.user){

        app.locals.user = req.user;
    
    }else if(req.session.poa){

        app.locals.loggedin_poa = req.session.poa;
    }

     next();
 })

//connect to databese
mongoose.connect('mongodb://localhost:27017/jbc', { useNewUrlParser: true , useUnifiedTopology: true , useFindAndModify: false }, () => {
    console.log("Connected to database");
});


//IMPORTING  EXTERNAL ROUTES 
//IMPORTING ROUTES 

const adminRoutes = require('./routes/AdministratorRoutes');
const appointmentRoutes = require('./routes/AppointmentRoutes');
const sitterRoutes = require('./routes/SitterRoutes.js');
const customerRoutes = require('./routes/CustomerRoutes');

//using the imported Documents Route
app.use('/jbc_administrators', adminRoutes);

app.use('/jbc_appointments', appointmentRoutes);

app.use('/jbc_sitters', sitterRoutes);

app.use('/jbc_customers', customerRoutes);

/* ------------------------- END OF MIDDLEWARE ----------------------------------------------------*


//ROUTES
/*------------------------------------------------------------------------------------------------------------------------------*/
app.get('/', async(req, res) => {

    //initial index function

    req.session.guest = true;

    var administrators = await Administrator.find();

    res.render("home" , { 
            title : "Junior Baby Center",
            administrators : administrators
            })
   
});



app.get('/logout', (req, res) => {

//     if(req.session.user){
//         try{

//             req.session.destroy(() => {

//                 return res.redirect("/users/user_login");
//             });
    

//         }catch(err){

//             res.send("Failed to logout. \n " + err.toString())

//         }
        
//     }else{

        // return res.redirect("/users/user_login");

});



/*----------------------------------------------------------------------------------------------------------------------------------*/


//error page handling for non existent paths
app.get('*', (req, res) => {

    res.send("Page Not Found");
    //<h1> ERROR!! ERROR!! <br/><br/> This Page Does Not Exist </h1>
})


//SERVER LISTEN
//telling the server to listen on port 3000
app.listen(3000, function() {

    console.log("Listening on port 3000")
});