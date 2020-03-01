const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  account: {
    type: String,
    required: true
  },
  orderId: {
    type: Number,
    required: true
  },
  orders:{
    type: Array,
    required: false
  },
  subTotal: {
    type: Number,
    default: 0
  },
  freight: {
    type: Number,
    required: false
  },
  dadaCoin: {
    type: Number,
    required: false
  },
  sum: {
    type: Number,
    default: 0
  },
  expired: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
