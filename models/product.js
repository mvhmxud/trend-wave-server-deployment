const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  images: [{ type: String, required: true }],
  category: { type: mongoose.Schema.Types.ObjectId, ref : 'Category' },
});
module.exports = mongoose.model('Product' , productSchema)
