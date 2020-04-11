const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  groupId: {
    type: String,
    required: true
  },
  foodpandaUrl: {
    type: String,
    required: true
  },
  shopName: {
    type: String,
    required: true
  },
  freight: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    default: "open"
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Group = mongoose.model('Group', GroupSchema);

module.exports = Group;
