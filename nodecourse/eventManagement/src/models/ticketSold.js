const mongoose = require('mongoose');

const ticketSoldModel = mongoose.model('ticketsolddetails', {
  userName: {
    type: String,
    trim: true,
    required: true
  },
  eventName: {
    type: String,
    required: true
  },
  noOfTicket:{
    type:Number,
    required:true
  },
  bookingTime: {
    type: Date,
    required: true
  },
  cost: {
      type: Number,
      required: true
  }
});

module.exports = ticketSoldModel;
       