const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const promotionSchema = new Schema(
  {
    name: {
      type: String,
      require: true,
      unique: true,
    },
    description: {
      type: String,
      require: true,
    },
    image: {
      type: String,
      require: true,
    },
    label: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      min: 0,
      require: true,
    },
  },
  {
    timestamps: true,
  }
);

const Promotions = mongoose.model("Promotion", promotionSchema);

module.exports = Promotions;
