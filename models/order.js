const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderItemSchema = new mongoose.Schema({
  title: { type: String},
  qty: { type: Number },
});

const orderSchema = new Schema({
  items: [orderItemSchema],
  userId: { type: mongoose.Schema.Types.ObjectId, ref : 'User' },
  price: { type: Number },
},{
  timestamps : true
});

module.exports = mongoose.model("Order", orderSchema);
