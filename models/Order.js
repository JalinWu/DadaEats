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
  orderImg: {
    type: String,
    required: false
  },
  orderTitle: {
    type: String,
    required: true
  },
  orderContents: {
    type: Array,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  sum: {
    type: Number,
    required: false
  },
  expired: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    default: 'not-confirmed'
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
