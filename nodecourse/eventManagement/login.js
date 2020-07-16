const express = require('express');
const dateFormat = require('dateformat');
var Handlebars     = require('handlebars');
var HandlebarsIntl = require('handlebars-intl');
const fs = require('fs');
const handlebars = require("handlebars")
handlebars.registerHelper('dateFormat', require('handlebars-dateformat'));
const bodyParser = require('body-parser');
const registerModel = require('./src/models/registerModel.js');
const addEventModel = require('./src/models/addEvent.js');
const ticketSoldModel = require('./src/models/ticketSold.js');
const eventActivityModel = require('./src/models/eventActivity.js');
const addCommentModel = require('./src/models/addComments.js');
const validator = require('validator');
require('./src/db/mongoose');
var exphbs = require('express-handlebars');
const app = express();
const port = process.env.PORT || 3000;
app.get('/' ,(req, res) => {
  res.sendfile( './src/register.html');


});

app.use(express.urlencoded());
app.use(express.json()); 

app.post('/login', async(req, res) => {
  var  name = req.body.uname;
  var password = req.body.password;
  if (name === 'admin' && password === 'admin') {
    return res.sendfile('./src/addEventDetails.html');
  }
  if (name === "" || password === "") {
    return res.send('Please provide valid information');
  }
  const user = await registerModel.findOne( {
    name: req.body.uname,
    password: req.body.password
  }); 

  const today = new Date();

  if (user) {
    const events = await addEventModel.find( { bookingStartTime: { $lte: today } ,
    bookingEndTime: { $gte: today } }, {
    eventName: 1,
    description: 1,
    maxNoOfTicket: 1,
    bookingStartTime: 1,
    bookingEndTime: 1,
    cost: 1,
    likes: 1,
    _id: 1
    });
    if (events) {
      res.render('userView.hbs', {
        events:events,
        username:req.body.uname
       
      });
    }
  } else {
    res.send("user not found!!!");
  }
});
  

app.post('/addEvent', (req, res) => {
  const ename = req.body.ename;
  const edetails = req.body.edetails;
  const npeople = req.body.npeople;
  const bookingStartTime = req.body.stime;
  const bookingEndTime = req.body.etime;
  const cost = req.body.cost;
  if (ename === "" || edetails === "" ||npeople === "" ||bookingStartTime === "" || bookingEndTime === "" || cost === "") {
    return res.send('Please provide valid information ..All are mandatory');
  }
  const addEventDetails = new addEventModel({
    eventName: ename,
    description: edetails,
    maxNoOfTicket: npeople,
    bookingStartTime: new Date(bookingStartTime),
    bookingEndTime: new Date(bookingEndTime),
    cost: cost
  });
  addEventDetails.save().then(() => {
    res.send('Event added successfully!!!...');
  }).catch(() => {
    res.send('failed!!!');
  }); 
});


app.get('/login',async (req,res) => {
  res.sendfile('./src/login.html');
})


app.post('/register', (req, res) => {
  var name = req.body.uname;
  // res.send(name);
  var password = req.body.password;
  var cpassword  = req.body.cpassword;
  if (password !==cpassword ) {
    res.send('password not matching!!!');
  }
  else if (name === "" || password === "" || cpassword === "") {
    res.send('Please provide valid informtaion!!!...');
  }
  else {
    const register = new registerModel({
      name: name,
      password: password
    });
    register.save().then(async() => {
      const today = new Date();
      const events = await addEventModel.find( { bookingStartTime: { $lte: today } ,
        bookingEndTime: { $gte: today } }, {
        eventName: 1,
        description: 1,
        maxNoOfTicket: 1,
        bookingStartTime: 1,
        bookingEndTime: 1,
        cost: 1,
        likes: 1,
        _id: 1
        });
        if (events) {
          res.render('userView.hbs', {
            events:events,
            username:req.body.uname
           
          });
        }
    }).catch(() => {
      res.send('fail!!! new user not added...');
    });
 }
});

app.get('/viewEvent',async (req, res) => {
  const events = await addEventModel.find( { }, {
    eventName: 1,
    description: 1,
    maxNoOfTicket: 1,
    bookingStartTime: 1,
    bookingEndTime: 1,
    cost: 1,
   
    _id: 1
  });
  if (events) {
    res.render('viewEvent.hbs', {
      events: events
    });
  } else {
    res.send("Fail to load!!!!");
  }

});

app.get('/buyTicket', ( req,res) => {
  console.log(req.query.eventname)
  res.render('buyTicket.hbs', {
    username: req.query.username,
    eventname: req.query.eventname,
    bookingStartTime: req.query.bookingStartTime,
    bookingEndTime: req.query.bookingEndTime,
    cost: req.query.cost,
    ticket:req.query.tickets,
    status:req.query.status,
    eventId:req.query.id,
    likes:req.query.likes,
    description:req.query.description

  });
});

app.post('/buyTicket', async (req, res) => {
  console.log(req.query.eventname);
  const today = new Date();
  const datetimes = new Date(req.query.bookingEndTime);
  if  (today  > datetimes) {
    return res.send("event finished!!!..you cannt book the ticket now!!");
  }
  const event = await addEventModel.findOne( { 
    eventName: req.query.eventname
  });
 
  if (req.body.number > event.maxNoOfTicket) {
    return res.jsonp([{message:"You cant book more ticket..Avalable ticket is "+event.maxNoOfTicket}]);
  }
  const newNoOfTicket = event.maxNoOfTicket - req.body.number;
  const updateTicket = await addEventModel.findOneAndUpdate({
    eventName: req.query.eventname
  }, {
    maxNoOfTicket : newNoOfTicket
  });

  if (updateTicket) {
    console.log('updated successfully!!!');
  } else {
    console.log('failed to update the ticket count!!!');
  }
  const soldTicket = new  ticketSoldModel( {
    userName: req.query.username,
    eventName: req.query.eventname,
    noOfTicket: req.body.number,
    cost: req.query.cost*req.body.number,
    bookingTime: new Date()
  });
  soldTicket.save().then(() => {
   return  res.jsonp([{message:"ticket booked successfuly!!.."}]);
  }).catch(() => {
    return res.jsonp([{message:'ticket booking failed!!!...'}]);
  });

});

app.get('/descriptionPage',async (req,res)=> {
  
  const  events  = await eventActivityModel.find( {eventName: req.query.eventName,userName: req.query.username 
  });
  console.log(events.length);
  if (events.length===0) {
    console.log("hgsgsgh");  
  const newUser = new eventActivityModel({
    eventName: req.query.eventName,
    userName: req.query.username,

    status: false,

  });
  newUser.save().then(( ) => {
    console.log("success");
  }).catch(()=>{
    console.log("hgsgsgh");
  });
}
  console.log("hgsgsgh");
  //console.log(req.query.username);
  const eventDetails = await addEventModel.findById(req.query.id);
  const allevents = await eventActivityModel.find( {eventName: req.query.eventName,userName: req.query.username 
  });
  //console.log(allevents[0])
 
  if (eventDetails) {
    let color1, color2;
    if(!allevents){
      return  res.send("try again");
    }
  if (allevents[0].status === true) {
    color1 = "blue";
    color2 = "black"
  } else {
    color1 = "black";
    color2 = "blue"
  }
  
  res.render('about.hbs', {
        description: eventDetails.description,
        likes: eventDetails.likes,
        eventId: eventDetails._id,
        eventName: eventDetails.eventName,
        username: allevents[0].userName ,
        status: allevents[0].status,
        color1: color1,
        color2: color2,
        eventStart:eventActivityModel.bookingStartTime,
        eventEnd:eventDetails.bookingEndTime,
        cost:eventDetails.cost,
        tickets:eventDetails.maxNoOfTicket
      });
  //res.send(events[0].status)
} else {
  res.send("sorry");
}

    });
app.get('/description', async (req, res) => {
  const  events  = await eventActivityModel.find( {eventName: req.query.eventName,userName: req.query.username 
  });
  
  //console.log(events[0].status);
  if (events.length===0) {
  const newUser = new eventActivityModel({
    eventName: req.query.eventName,
    userName: req.query.username,

    status: false,

  });
  newUser.save().then(( ) => {
    console.log("success");
  }).catch(()=>{

  });
 // eventsStatus = false;
  }
  //console.log(events.status)
 // console.log(events[0].status);
//res.send(req.query.id)
  const eventDetails = await addEventModel.findById(req.query.id);
  const allevents = await eventActivityModel.find( {eventName: req.query.eventName,userName: req.query.username 
  });
//console.log(allevents[0])
  //res.send(eventDetails)
 //res.send(events[0]);
if (eventDetails) {
  let color1, color2;
  if(!allevents){
   return  res.send("try again");
  }
  if (allevents[0].status === true) {
    color1 = "blue";
    color2 = "black"
  } else {
    color1 = "black";
    color2 = "blue"
  }
  // const eventAdding = addEventModel.findByIdAndUpdate(eventDetails._id,{
  //   likes:eventDetails.likes
  // });
  
  //.log(eventDetails.eventName);
  //console.log(events[0].userName)
  res.render('about.hbs', {
        description: eventDetails.description,
        likes: eventDetails.likes,
        eventId: eventDetails._id,
        eventName: eventDetails.eventName,
        username: allevents[0].userName ,
        status: allevents[0].status,
        color1: color1,
        color2: color2,
        eventStart:req.query.bookingStartTime,
        eventEnd:req.query.bookingEndTime,
        cost:eventDetails.cost,
        tickets:eventDetails.maxNoOfTicket
      });
  //res.send(events[0].status)
} else {
  res.send("sorry");
}
  
  
  //console.log(events[0].status)
  
//   res.render('about.hbs', {
//     description: eventDetails.description,
//     likes: eventDetails.likes,
//     eventId: eventDetails._id,
//     eventName: eventDetails.eventName,
//     username:events.userName ,
//     status: events[0].status,
//     color1: color1,
//     color2: color2
//   });
});


app.get('/comments', async (req, res, next) => {
  //   res.render('likes.hbs',{
  //     description:req.query.description,
  //     likes:0,
  //     eventActivity
  //       });
  let description = [];
  const  events  = await eventActivityModel.findById(req.query.id,{
    eventName: 1,
    userName: 1,
    likes: 1,
    comments: 1,
    _id: 1
  });
  if (events) {
    res.render("comments.hbs", {
      comments:events
    });
  }
//   },(err,events) => {
//     if(err) {
//       res.send(err);
//     } else {
//       var resultArray = [];
//       var count=0;
//       events.forEach(function(event,err){
//         resultArray.push(event);
//         count+=1;
//       });
//       var comments;
//       for (var i=0;i<count;i++) {
//       //  console.log(resultArray[i].likes);
// comments+="<td>"+resultArray[i].userName+"\t :"+resultArray[i].comments+"</td>";
// comments += '<td>abc</td>'
//       }
// if(events){
//       res.render('description.hbs',{
//         description:events,
//         likes:10
//       })
//     }

//     });
 // });
});

app.post('/description', (req, res) => {
  res.send(req.body.para + '' + req.body.comments);
});


app.set('view engine', 'ejs');
app.get('/ajax', (req, res)=>{
  res.render('ajax', { title: 'An Ajax Example', quote: "AJAX is great!"});
});

app.get('/editView', (req, res) => {

  res.render('editView.hbs', {
    eventName: req.query.eventName,
    description: req.query.description,
    tickets: req.query.tickets,
    bookingStartTime: req.query.bookingStartTime,
    bookingEndTime: req.query.bookingEndTime,
    cost: req.query.cost
    
  });
});


app.post('/editEvent' , async (req,res) =>{
  const editedView = await addEventModel.findOneAndUpdate({
    eventName: req.body.ename
  }, {
    description: req.body.description,
    bookingStartTime: Date(req.body.stime),
    bookingEndTime: Date(req.body.eetime),
    cost: req.body.cost,
    maxNoOfTicket: req.body.maxNoOfTicket
  });
  if (editedView) {
    res.send('Successfully update the event details!!!!...');
  } else {
    res.send('failure while updating!!!!');
  }
});

app.get('/deleteEvent', async (req, res) => {
  const deletedEvent = await addEventModel.findOneAndDelete({
    eventName: req.query.eventName,
    // description:req.query.description,
    // bookingStartTime:req.query.bookingStartTime,
    // bookingEndTime:req.query.bookingEndDate,
    // cost:req.query.cost,
    // maxNoOfTicket:req.query.tickets
  });
  if (deletedEvent) {
    //res.redirect('./src/deletemsg.html');
   res.send('deleted suceessfully!...');
  } else {
    res.send('failed to delete!!!..');
  }
  // res.render('deleteEvent.hbs',{
  //   eventName : req.query.eventName,
  //   description:req.query.description,
  //   tickets:req.query.tickets,
  //   bookingStartTime:req.query.bookingStartTime,
  //   bookingEndTime:req.query.bookingEndTime,
  //   cost:req.query.cost
    
  // });

});
app.post('/like' , (req, res) => {
  res.send("hi")
})
app.post('/likes',async (req,res)=>{
  //console.log(req.query.likes);
  //console.log("hi");
  //res.send(req.body.status)
  //res.send(req.body.id)
  const event = await addEventModel.findOneAndUpdate({
    _id: req.body.id
  }, {
    likes: req.body.like
  }
  );
  
  let status;
  if(req.body.status === "blue"){
    status = true;
  } else {
    status = false;
  }
 // console.log(req.body.like+" "+status)
 //console.log(req.body.like)
    const activity = await eventActivityModel.findOneAndUpdate({
      userName: req.body.userName, 
        //  _id:ObjectId(req.query.id)
        
      eventName: req.body.eventName
    }, {
    status: status,
    likes: req.body.like 
    });
    
  // res.jsonp({likes:req.body.like,
  // status:req.body.status})
    
  // if (event) {
  //   res.send("updated");
  // } else {
  //   res.send("failed");
  // }
  //}
  
  
});

app.get('/commentsview', async (req, res) => {
  console.log(req.query.bookingEndTime);
  
  const comments = await addCommentModel.find({ eventName: req.query.eventname,
   eventId:req.query.eventid
  });
  res.render('viewComments.hbs', {
    eventName: req.query.eventname,
    userName: req.query.username,
    eventId: req.query.eventid,
    comments: comments,
    bookingStartTime:req.query.bookingStartTime,
    bookingEndTime:req.query.bookingEndTime,
    tickets:req.query.tickets,
    cost:req.query.cost,
    likes:req.query.likes,
    description:req.query.description,
    status:req.query.status

  });
});



app.post('/saveComments',(req,res)=>{
  res.send("hello!!!");
})

app.post('/commentAdd', async(req, res) => {
 console.log(req.body.comments); 
 //res.send(req.query.eventName)
  const addComment = new addCommentModel({
    eventName: req.body.eventName,
    eventId: req.body.eventId,
    userName: req.body.userName,
    comments: req.body.comments,
    time: req.body.times
  });
  addComment.save().then(()=>{
    //console.log("hi")
    res.jsonp([{time:req.body.times ,
eventId:req.body.eventId,
eventName:req.body.eventName,
userName:req.body.userName,
comments:req.body.comments
    }])
  }).catch(()=>
  {
    console.log("sorry");
  });
  // addComment.save().then(async ( )=> {
  //   const allComments =await addCommentModel.find({
  //    eventId: req.body.eventId 
  //   });

//     // res.redirect('viewComments.hbs', {
//     //   eventName: req.body.eventName,
//     //   userName: req.body.userName,
//     //   eventId: req.body.eventId,
//     //   comments: allComments
//     // });
 
//  //console.log(allComments)
//     // res.render('newComment.hbs',
//     // {
//     //   eventName: req.body.eventName,
//     // eventId: req.body.eventId,
//     // userName: req.body.userName,
//     // comments: req.body.comments,
//     // time: req.body.time 
//     // });
    
  // }).catch(() => {
  //   console.log("failed to post!!!!");
  // });
});
app.get('/random.php',(req,res) => {
  //res.send("hi");
  res.sendfile('./views/random.php');
});
app.get('/likes',(req,res) => {
  //res.send(req.query.name);
  //console.log(req.query.name)
  res.jsonp({test:"hi"});
});



app.get('/loginPage', async (req, res) => {
  const today =  new Date();
  const events = await addEventModel.find( { bookingStartTime: { $lte: today } ,
    bookingEndTime: { $gte: today } }, {
    eventName: 1,
    description: 1,
    maxNoOfTicket: 1,
    bookingStartTime: 1,
    bookingEndTime: 1,
    cost: 1,
    likes: 1,
    _id: 1
    });
    if (events) {
      res.render('userView.hbs', {
        events:events,
        username:req.query.username
      });
    } else {
      res.send("Sorry no events found!!!!");
    }

})


app.get('/mynew', (req,res)=>{
  console.log(req.query.name);
  res.jsonp({like:"hahah"})
})
app.get('/about',(req,res) => {
  res.sendfile('./views/about.html');
})
app.listen(port , () => {
  console.log('server is up to port :' + port);
});