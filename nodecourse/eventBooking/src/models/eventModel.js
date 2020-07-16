const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');

const addEventModel = mongoose.model('addEvents', {
  eventName: {
    type:String,  
    trim:true,
    required: true
  },
  description : {
    type :String,
    trim :true,
    required :true
  },
  maxNoOfTicket:{
    type: Number,
    required :true
  },
  
  bookingStartTime : {
    type:Date,
    required: true
  },
  bookingEndTime: {
    type:Date,
    required:true
  },
  cost: {
    type:Number,
    required:true
  },
  likes:{
    type:Number,
    default:1
  },
  image:{
    type:String
    //  type:GridFS,
    //  data: Buffer, 
    //  contentType: String 
    
    
   
  }
});
module.exports = addEventModel;
