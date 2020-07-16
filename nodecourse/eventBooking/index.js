const express = require('express');
const validator = require('validator');
const bodyParser = require('body-parser');
var handlebars     = require('handlebars');
var JSAlert = require("js-alert");
const dateFormat = require('dateformat');
//var HandlebarsIntl = require('handlebars-intl')
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const flash = require('connect-flash');
require('./src/db/mongoose');
const app = express();
app.use(express.urlencoded());
app.use(express.json()); 
app.use(bodyParser.urlencoded({extended:true}));

//LOADING FILES
var storage = multer.diskStorage({
  destination: function(req,file,cb) {
    cb(null, './uploads')
  },
  filename:function(req,file,cb){
    cb(null,file.fieldname+'_'+Date.now()+"_"+file.originalname);
  }
})

var upload = multer({
  storage:storage
})


const port = process.env.PORT || 3000;
const customerModel = require('./src/models/registerModel.js');
const eventList = require('./src/models/eventModel.js');
// app.get('/' ,(req, res) => {
//   res.sendfile( './views/home.html');
// });
// app.get('/adminLogin',(req, res) => {
//   res.sendfile('./views/adminLogin.html');
// });
// app.post('/adminLogin',async(req,res,next) => {
// var name = req.body.uname;
// var password = req.body.password;
// //res.json({ access: 'logged' });

// //  res.send(name+" "+password);
// if( name === 'admin' && password === 'admin') {
 
//  const events = await eventList.find( { }, {
//     eventName: 1,
//     description: 1,
//     maxNoOfTicket: 1,
//     bookingStartTime: 1,
//     bookingEndTime: 1,
//     cost: 1,
  
//     _id: 1
//   });
//   if (events) {
    
//     res.render('eventView.hbs',{
//       events: events
//     }).then(()=>{
//       res.status(204).send()
//     });
//   } 
//  console.log("success");
     
// } else {
  
// //   console.log("soory");
// // res.status(404).send();
// }
// const error =  new error("Please provide valid credential");

// });
app.get('/adminAddingEvent',(req,res) =>{
 res.sendfile('./views/addingEvent.html') 
});


// adding event details to database
app.post('/addingEvent',upload.single('img'),(req,res) => {
  const ename = req.body.ename;
  const edetails = req.body.edetails;
  const npeople = req.body.npeople;
  const bookingStartTime = req.body.stime;
  const bookingEndTime = req.body.etime;
  const cost = req.body.cost;
  const image = req.file;
  const img = fs.readFileSync(req.file.path);
  const encoded_imgage = img.toString('base64');
  
if(!image){
  res.send("Please upload a file");

}else{
//res.send(image);
 
  if (encoded_imgage === "" || ename === "" || edetails === "" ||npeople === "" ||bookingStartTime === "" || bookingEndTime === "" || cost === "") {
    return res.send('Please provide valid information ..All are mandatory');
  }
  const addEventDetails = new eventList({
    eventName: ename,
    description: edetails,
    maxNoOfTicket: npeople,
    bookingStartTime: new Date(bookingStartTime),
    bookingEndTime: new Date(bookingEndTime),
    cost: cost,
    image : Buffer.from(encoded_imgage,'base64')
  });
  addEventDetails.save().then(() => {
    res.send('Event added successfully!!!...');
  }).catch(() => {
    res.send('failed!!!');
  }); 
}
})
app.get('/userRegistration',(req, res) => {
  
  res.sendfile('./views/userRegistration.html');
});

// app.post('/userRegistration', async(req, res) => {
//   var name = req.body.uname;
//   // res.send(name);
//   const password = req.body.password;
//   const cpassword  = req.body.cpassword;
//   if (password !==cpassword ) {
//     res.send('password not matching!!!');
//   }
  
//   else {
//     const registered = await customerModel.findOne({name:name});
//     if(registered){
//        res.send("USER ALREADY EXISTS!!!...");
//     }
//     else{
    
//       const register = new customerModel({
//       name: name,
//       password: password
//     });
//     register.save().then(async() => {
//       const today = new Date();
//       const events = await eventList.find( { bookingStartTime: { $lte: today } ,
//         bookingEndTime: { $gte: today } }, {
//         eventName: 1,
//         description: 1,
//         maxNoOfTicket: 1,
//         bookingStartTime: 1,
//         bookingEndTime: 1,
//         cost: 1,
//         likes: 1,
//         _id: 1
//         });
//         if (events) {
//           res.render('userEventView.hbs', {
//             events:events,
//             username:req.body.uname
           
//           });
//         }
//     }).catch(() => {
//       res.send('fail!!! new user not added...');
//     });
//  }
// }


 
// });

// app.get('/userLogin',(req, res) => {
  
//   res.sendfile('./views/userLogin.html');
// });
// app.post('/userLogin',async(req,res)=> {
// var name = req.body.uname;
// var password = req.body.password;
// const user = await customerModel.findOne( {
//   name:name,
//   password: password
// }); 
// if(user){
//   const today = new Date();
//       const events = await eventList.find( { bookingStartTime: { $lte: today } ,
//         bookingEndTime: { $gte: today } }, {
//         eventName: 1,
//         description: 1,
//         maxNoOfTicket: 1,
//         bookingStartTime: 1,
//         bookingEndTime: 1,
//         cost: 1,
//         likes: 1,
//         _id: 1
//         });
//         if (events) {
//           res.render('userEventView.hbs', {
//             events:events,
//             username:req.body.uname
           
//           });
//         }
//       } else {
//         res.send("LOGIN FAILED!!!!");
//       }
 

// })




//app.use(express.urlencoded());
app.use(express.json()); 


app.listen(port , () => {
  console.log('server is up to port :' + port);
});