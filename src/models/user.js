const { Schema, model } = require("mongoose");

const GeoSchema = new Schema({
  type: {
    type: String,
    default: "Point",
  },
  coordinates: {
    type: [Number], //the type is an array of numbers
  },
});

const MySchema = new Schema({
  name: {
    type: String,
    required: true,
    maxlength: 50,
  },
  refresh_token: {
    type: String,
    required: true,
  },
  email: { type: String },
  tenantId: { type: String },
  location: GeoSchema,
});

MySchema.index({ location: "2dsphere" });

const UserModel = model("User", MySchema);

module.exports = UserModel;
