const mongoose = require('mongoose');

const registerModel = mongoose.model('register', {
  name: {
    type:String,
    trim:true,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

module.exports = registerModel;
       